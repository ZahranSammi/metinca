# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Laravel 13 + Inertia.js (React 18) application implementing "Sistem Inventarisasi Barang Operasional" — an
operational-goods purchasing/procurement workflow for PT Metinca Prima Industrial Works Jakarta
("metincainventory"). The domain and UI strings are in Indonesian. It runs on Laravel Herd locally at
`https://metincainventory.test`.

## Commands

```bash
# Install
composer install
npm install

# Run app (server + queue worker + log tail + vite, all at once)
composer dev

# Individually
php artisan serve
npm run dev
npm run build

# Tests (PHPUnit, sqlite :memory: — see phpunit.xml)
composer test
php artisan test
php artisan test --filter=TestName
php artisan test tests/Feature/ProfileTest.php

# DB
php artisan migrate
php artisan migrate:fresh --seed   # seeds four demo users, see below

# Lint/format PHP
vendor/bin/pint
```

There is no JS test runner configured — verify frontend changes by running `npm run dev` and exercising the
Inertia pages in a browser. Whenever new PHP classes are added under `app/`, run `composer dump-autoload`
afterwards — `optimize-autoloader` is enabled in `composer.json`, so the classmap is static and won't pick up
new files (including from `php artisan tinker`) until it's regenerated.

## Architecture

### Roles and route groups

There is no permissions package — access control is a single `role` column on `users` (`requester`,
`staff_purchasing`, `staff_accounting`, `manager_accounting`), enforced by `App\Http\Middleware\EnsureRole`
(aliased as `role` in `bootstrap/app.php`). `routes/web.php` groups every controller route under
`->middleware('role:<one-or-more>')`. When adding a route for a role, add it inside the matching
`Route::middleware('role:...')` group rather than checking the role manually inside the controller.

Seeded demo accounts (`database/seeders/UserSeeder.php`, password `password` for all):
- `requester@example.com` — requester
- `purchasing@example.com` — staff_purchasing
- `sa@example.com` — staff_accounting
- `ma@example.com` — manager_accounting

### The procurement pipeline is a strict state machine

This is the core piece of business logic and the thing most likely to break if edited carelessly. Four models
each carry a `status` string and a `transitionTo(string $newStatus, ...)` method (`App\Models\PurchaseRequest`,
`FundProposal`, `PurchaseDocument`, `PurchaseRecord`). Each method hardcodes a `$validTransitions` map from
current status to allowed next statuses and calls `abort(422, ...)` on anything not in the map. **Never set
`->status` directly or `update(['status' => ...])`** — always go through `transitionTo()` so illegal jumps are
rejected. If you add a new status, add it to the transitions map in the model, not just in the controller.
Unlike a typical approve/reject flow, no status here is a permanent terminal rejection — every "tidak sesuai"
outcome is a revise-and-resubmit loop back to `Diajukan` (or a `Direvisi *` variant that ultimately returns to
`Diajukan`), never a dead-end `Ditolak`.

The full lifecycle spans four models handed off between all four roles:

1. **Requester** submits a `PurchaseRequest` for an operational good (`Diajukan`).
2. **Staff Purchasing** accepts it into the purchase list (`Masuk Daftar Pembelian`), then creates a
   `FundProposal` against it (`Diajukan`).
3. **Staff Accounting** checks completeness: forwards it (`Menunggu Persetujuan Manager`) or kicks it back
   (`Direvisi Staff Accounting`, with a note) for Staff Purchasing to fix and resubmit.
4. **Manager Accounting** checks the funds: approves & disburses in one step (`Dana Cair`, sets
   `disbursed_at`) or kicks it back (`Direvisi Manager`, with a note) — either way a rejection round-trips
   back through Staff Accounting once resubmitted.
5. **Staff Accounting** records the disbursement and forwards it (`Dana Diterima Purchasing`); **Staff
   Purchasing** then makes the actual purchase (`Selesai Pembelian`).
6. **Staff Purchasing** files a `PurchaseDocument` (item, qty, unit price, proof) against the completed
   `FundProposal`; **Staff Accounting** alone approves (`Disetujui`) or sends it back (`Direvisi`).
7. **Staff Accounting** records a `PurchaseRecord` against the approved document; **Manager Accounting** alone
   approves and archives it (`Diarsipkan`) or sends it back (`Direvisi`) — archiving transitions the original
   `PurchaseRequest` to `Selesai`, closing the cycle.

Status strings are the actual source of truth used across controllers and JSX (e.g. filtering by
`status === 'Disetujui'`) — there are no enum classes or constants, so grep for the literal string when tracing
a status through the system.

### Controllers are organized by role, not by resource

`RequesterController` (submit requests) and `StaffPurchasingController` (accept requests, submit fund
proposals, complete purchases, file purchase documents) cover the two purchasing-side roles.
`StaffAccountingController` handles fund-proposal triage, disbursement recording, purchase-document approval,
and purchase-record creation. `ManagerAccountingController` covers fund approval/disbursement, purchase-record
approval/archiving, and history. `ReportController` (cross-role CSV/table export over `FundProposal`) and
`DashboardController` (role-branched dashboard) are shared — `DashboardController::index` is the actual
post-login landing page for every role (see `AuthenticatedSessionController::store`, which always redirects to
`route('dashboard')`), and it delegates to each role controller's own `dashboard()` method rather than
duplicating query logic. When adding a feature, put it in the controller matching the *role that acts*, not the
model it touches.

### Frontend

Inertia resolves page components from `resources/js/Pages/**/*.jsx` by the string passed to `Inertia::render()`
in controllers (e.g. `Inertia::render('ManagerAccounting/ApprovalDana', [...])` → `Pages/ManagerAccounting/ApprovalDana.jsx`).
Pages are grouped by role (`Requester/`, `StaffPurchasing/`, `StaffAccounting/`, `ManagerAccounting/`), mirroring
the controller split above. Shared UI lives in `resources/js/Components/` (Breeze-derived form/nav primitives,
plus app-specific `Badge.jsx`/`StatCard.jsx`), layouts in `resources/js/Layouts/`. Charts use `recharts`; icons
use `lucide-react`. `auth.user` (including `role`) is shared globally via `HandleInertiaRequests::share()`.

### File uploads

Purchase-document proof files are stored on the `public` disk under `purchase_documents/`
(`Storage::disk('public')` via `$file->store(...)`). Remember `php artisan storage:link` is required for these
to be web-accessible in a fresh environment. File uploads combined with a PUT-based revise action (e.g.
`purchasing.data-barang.revisi`) use Inertia's `useForm().put(route, { forceFormData: true })` directly —
Inertia automatically spoofs this as a POST with a `_method` override when file data is present, so there's no
need to manually call `.post()` against a PUT route.
