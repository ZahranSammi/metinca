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
            'name' => 'Requester',
            'email' => 'requester@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'requester'
        ]);

        \App\Models\User::create([
            'name' => 'Staff Purchasing',
            'email' => 'purchasing@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'staff_purchasing'
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
