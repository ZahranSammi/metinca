<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'nip',
        'jabatan',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function hasRole(string|array $roles): bool
    {
        $targetRoles = is_array($roles) ? $roles : [$roles];

        $aliasMap = [
            'staff_accounting' => ['staff_accounting', 'staff_gudang'],
            'staff_gudang' => ['staff_gudang', 'staff_accounting'],
            'inventarisir' => ['inventarisir'],
            'manager_accounting' => ['manager_accounting', 'manager_gudang'],
            'manager_gudang' => ['manager_gudang', 'manager_accounting'],
            'direktur_sdm' => ['direktur_sdm'],
            'karyawan' => ['karyawan'],
        ];

        $effectiveUserRoles = $aliasMap[$this->role] ?? [$this->role];

        foreach ($targetRoles as $target) {
            if (in_array($target, $effectiveUserRoles, true)) {
                return true;
            }
            $targetAliases = $aliasMap[$target] ?? [$target];
            if (in_array($this->role, $targetAliases, true)) {
                return true;
            }
        }

        return false;
    }
}
