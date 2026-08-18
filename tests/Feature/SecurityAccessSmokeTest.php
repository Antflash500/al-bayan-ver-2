<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tests\CreatesApplication;

class SecurityAccessSmokeTest extends BaseTestCase
{
    use CreatesApplication;

    public function test_role_dashboards_and_security_page_are_accessible(): void
    {
        $admin = User::query()->where('role', 'admin')->where('status', 'aktif')->first();
        $guru = User::query()->where('role', 'guru')->where('status', 'aktif')->first();
        $siswa = User::query()->where('role', 'student')->where('status', 'aktif')->first();

        $this->assertNotNull($admin, 'tidak ada admin aktif');
        $this->assertNotNull($guru, 'tidak ada guru aktif');
        $this->assertNotNull($siswa, 'tidak ada siswa aktif');

        $this->actingAs($admin)->get('/admin')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/security')->assertStatus(200);

        $this->actingAs($guru)->get('/guru')->assertStatus(200);
        $this->actingAs($guru)->get('/guru/programs')->assertStatus(200);

        $this->actingAs($siswa)->get('/siswa')->assertStatus(200);
        $this->actingAs($siswa)->get('/siswa/program')->assertStatus(200);

        $this->assertTrue(true);
    }
}