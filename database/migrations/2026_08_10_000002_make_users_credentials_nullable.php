<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Students no longer create login credentials during registration. A freshly
 * registered student is stored as a `users` row without an email or password
 * (status = pending). The admin later assigns the username + password and
 * activates the account, so those columns must accept NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
            DB::statement('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
            DB::statement('ALTER TABLE users ALTER COLUMN password SET NOT NULL');

            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};
