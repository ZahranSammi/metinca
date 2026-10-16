<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(Request $request, int $id): RedirectResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return redirect()->back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();
        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('role_target', $user->role);
        })->update(['is_read' => true]);

        return redirect()->back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }
}
