<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Manager Maintenance',
            'email' => 'mm@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'manager_maintenance'
        ]);

        \App\Models\User::create([
            'name' => 'Staff Accounting',
            'email' => 'sa@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'staff_accounting'
        ]);

        \App\Models\User::create([
            'name' => 'Manager Accounting',
            'email' => 'ma@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'manager_accounting'
        ]);
    }
}
