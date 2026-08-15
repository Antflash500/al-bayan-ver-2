<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE student_profiles ALTER COLUMN nim DROP NOT NULL');

            return;
        }

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('nim')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE student_profiles ALTER COLUMN nim SET NOT NULL');

            return;
        }

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('nim')->nullable(false)->change();
        });
    }
};
