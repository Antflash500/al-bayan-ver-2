<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AsramaSeeder::class,
            ContentSeeder::class,
            PortalSeeder::class,
        ]);
    }
}
