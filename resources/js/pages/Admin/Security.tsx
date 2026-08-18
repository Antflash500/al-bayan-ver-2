import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Activity,
    AlertTriangle,
    Ban,
    Binary,
    Clock,
    Cpu,
    Download,
    Globe,
    KeyRound,
    Lock,
    LockOpen,
    LogOut,
    Play,
    Radar,
    RefreshCw,
    ScanLine,
    Server,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Siren,
    Unplug,
    Users,
    Zap,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Summary {
    total_users: number;
    total_guru: number;
    total_siswa: number;
    active_sessions: number;
    banned_ips: number;
    login_sukses_24h: number;
    login_gagal_24h: number;
    diblokir_24h: number;
    banned_24h: number;
    peringatan_24h: number;
    aiBlocks: number;
}

interface SecuritySystem {
    key: string;
    name: string;
    desc: string;
    schedule: string;
    tipe: string;
    last_run: string;
    last_result: string;
}

interface FortressLayer {
    layer: number;
    name: string;
    desc: string;
    ok: boolean;
}

interface IpIntel {
    ip: string;
    total: number;
    login_gagal: number;
    diblokir: number;
    risk: number;
    verdict: string;
}

interface IpScanResult {
    ip: string;
    verdict: string;
    risk: number;
    events_24h: number;
    login_gagal: number;
    diblokir: number;
    diban: number;
    banned_now: boolean;
    in_allowlist: boolean;
    in_blocklist: boolean;
    last_seen: string | null;
    last_event: string | null;
}

interface Device {
    user_agent: string;
    label: string;
    total: number;
    ip: string | null;
    last_activity: string;
    blocked: boolean;
    hash: string;
}

interface BlockedDevice {
    hash: string;
    label: string;
    blocked_at: string;
    remaining_minutes: number;
}

interface CveItem {
    code: string;
    title: string;
    desc: string;
    severity: string;
    affected: string;
    fix: string;
    check: string;
    status: string;
}

interface ConfigCheck {
    label: string;
    ok: boolean;
    value: string;
    hint: string;
}

interface Gap {
    file: string;
    size: number;
}

interface BackdoorItem {
    path: string;
    reason: string;
    size: number;
}

interface LockdownState {
    until: number;
    safe_ip: string;
}

interface TickerItem {
    id: number;
    tipe: string;
    tipe_label: string;
    name: string;
    ip: string | null;
    keterangan: string | null;
    time_ago: string;
}

interface SelfTestResult {
    total: number;
    blocked: number;
    leaked: number;
    results: Array<{ payload: string; pattern: string | null; blocked: boolean }>;
}

interface PasswordAuditItem {
    id: number;
    name: string;
    username: string;
    role: string;
    reason: string;
}

interface Threat {
    tipe: string;
    label: string;
    count: number;
}

interface BannedIp {
    ip: string;
    reason: string | null;
    banned_at: string;
    remaining_minutes: number;
}

interface ActiveSession {
    id: string;
    user_id: number | null;
    name: string;
    ip: string | null;
    browser: string;
    last_activity: string;
}

interface SecurityLogItem {
    id: number;
    tipe: string;
    tipe_label: string;
    name: string;
    ip: string | null;
    browser: string | null;
    path: string | null;
    keterangan: string | null;
    created_at: string | null;
}

interface HealthCheck {
    label: string;
    value: string;
    ok: boolean;
}

interface Firewall {
    ban_minutes: number;
    max_blocked_hits: number;
    failed_login_threshold: number;
    blocked_ips_config: string[];
    allowed_ips_config: string[];
    admin_allowed_ips_config: string[];
}

const LOG_BADGE: Record<string, string> = {
    login_sukses: 'bg-emerald-50 text-emerald-700',
    login_gagal: 'bg-red-50 text-red-700',
    diblokir: 'bg-amber-50 text-amber-700',
    banned: 'bg-slate-800 text-white',
    unbanned: 'bg-blue-50 text-blue-700',
    port_scan: 'bg-violet-50 text-violet-700',
    analisis: 'bg-sky-50 text-sky-700',
    integritas: 'bg-teal-50 text-teal-700',
    pemantauan: 'bg-cyan-50 text-cyan-700',
    pembersihan: 'bg-lime-50 text-lime-700',
    pindai: 'bg-rose-50 text-rose-700',
    peringatan: 'bg-orange-50 text-orange-700',
};

const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin',
    guru: 'Guru',
    siswa: 'Siswa',
};

const SEVERITY_BADGE: Record<string, string> = {
    Kritis: 'bg-red-600 text-white',
    Tinggi: 'bg-orange-500 text-white',
    Sedang: 'bg-amber-400 text-white',
    Rendah: 'bg-slate-400 text-white',
};

const VERDICT_BADGE: Record<string, string> = {
    Berbahaya: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    Mencurigakan: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Bersih: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
};

export default function AdminSecurity() {
    const {
        summary,
        threats,
        systems,
        passwordAudit,
        fortress,
        ipIntel,
        devices,
        blockedDevices,
        cve,
        configChecks,
        gaps,
        backdoors,
        lockdown,
        ticker,
        ipScan,
        selfTest,
        bannedIps,
        sessions,
        logs,
        health,
        firewall,
        flash,
    } = usePage<{
        summary: Summary;
        threats: Threat[];
        systems: SecuritySystem[];
        passwordAudit: PasswordAuditItem[];
        fortress: FortressLayer[];
        ipIntel: IpIntel[];
        devices: Device[];
        blockedDevices: BlockedDevice[];
        cve: CveItem[];
        configChecks: ConfigCheck[];
        gaps: Gap[];
        backdoors: { total: number; files: BackdoorItem[] };
        lockdown: LockdownState | null;
        ticker: TickerItem[];
        ipScan: IpScanResult | null;
        selfTest: SelfTestResult | null;
        bannedIps: BannedIp[];
        sessions: ActiveSession[];
        logs: SecurityLogItem[];
        health: HealthCheck[];
        firewall: Firewall;
        flash?: { success?: string; error?: string };
    }>().props;

    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({
                only: ['ticker', 'summary'],
            });
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const banForm = useForm({ ip: '' });
    const ipScanForm = useForm({ ip: '' });

    const stats = [
        { icon: Unplug, label: 'Sesi Aktif', value: summary.active_sessions, tone: 'bg-primary text-white' },
        { icon: Ban, label: 'IP Diban', value: summary.banned_ips, tone: 'bg-red-600 text-white' },
        { icon: ShieldCheck, label: 'Login Sukses 24 Jam', value: summary.login_sukses_24h, tone: 'bg-emerald-600 text-white' },
        { icon: ShieldAlert, label: 'Login Gagal 24 Jam', value: summary.login_gagal_24h, tone: 'bg-amber-500 text-white' },
        { icon: Radar, label: 'Diblokir 24 Jam', value: summary.diblokir_24h, tone: 'bg-violet-600 text-white' },
        { icon: Users, label: 'Total Pengguna', value: summary.total_users, tone: 'bg-slate-700 text-white' },
        { icon: Cpu, label: 'Serangan AI Diblokir 24 Jam', value: summary.aiBlocks, tone: 'bg-rose-600 text-white' },
    ];

    const maxThreat = Math.max(1, ...threats.map((t) => t.count));

    return (
        <AdminLayout>
            <Head title="Admin | Keamanan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">Keamanan & Monitoring</h1>
                        <p className="mt-1 text-sm text-muted">
                            Pantau ancaman, sesi aktif, dan kesehatan sistem Al Bayan.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                            <AlertTriangle className="size-4" /> {summary.peringatan_24h} peringatan 24 jam
                        </span>
                        <button
                            type="button"
                            onClick={() => router.post('/admin/security/health', {}, { preserveScroll: true })}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface"
                        >
                            <RefreshCw className="size-4" /> Health Check
                        </button>
                        <a
                            href="/admin/security/export"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface"
                        >
                            <Download className="size-4" /> Ekspor CSV
                        </a>
                        <a
                            href="/admin/security/export/json"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Zap className="size-4" /> Ekspor Benteng
                        </a>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Statistik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-soft"
                        >
                            <span className={cn('grid size-10 place-items-center rounded-xl', stat.tone)}>
                                <stat.icon className="size-4" />
                            </span>
                            <p className="mt-3 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs font-medium text-muted">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Sistem Keamanan — selalu online */}
                <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Cpu className="size-4 text-primary" /> Sistem Keamanan — Selalu Online
                        </h2>
                        <span className="hidden rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 sm:inline">
                            5 sistem aktif otomatis
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                        {systems.map((system) => (
                            <div
                                key={system.key}
                                className="flex flex-col rounded-xl border border-border bg-surface/60 p-4"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <span className="relative flex size-2.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                                        </span>
                                        {system.name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
                                        <Clock className="size-3" /> {system.schedule}
                                    </span>
                                </div>
                                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{system.desc}</p>
                                <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs">
                                    <p className="text-muted">
                                        Terakhir:{' '}
                                        <span className="font-semibold text-foreground">{system.last_run}</span>
                                    </p>
                                    <p className="line-clamp-2 text-muted" title={system.last_result}>
                                        {system.last_result}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(`/admin/security/${system.key}`, {}, { preserveScroll: true })
                                    }
                                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-primary ring-1 ring-border transition hover:bg-primary hover:text-white"
                                >
                                    <Play className="size-3.5" /> Jalankan Sekarang
                                </button>
                            </div>
                        ))}
                        <div className="flex flex-col justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                            <div>
                                <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <Zap className="size-4 text-primary" /> Pusat Kendali Keamanan
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-muted">
                                    Jalankan pemeriksaan mendalam secara manual, atau kunci seluruh perangkat
                                    bila terjadi insiden.
                                </p>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            '/admin/security/integrity/rebuild',
                                            {},
                                            { preserveScroll: true }
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-foreground ring-1 ring-border transition hover:bg-surface"
                                >
                                    <RefreshCw className="size-3.5" /> Bangun Ulang Baseline
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Cabut semua sesi aktif (force logout global)? Seluruh pengguna harus masuk kembali.'
                                            )
                                        ) {
                                            router.post('/admin/security/logout-all', {}, { preserveScroll: true });
                                        }
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                >
                                    <LogOut className="size-3.5" /> Force Logout Global
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Peta Benteng */}
                <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Shield className="size-4 text-primary" /> Peta Benteng — 6 Lapisan Pertahanan
                        </h2>
                        <span
                            className={
                                fortress.every((layer) => layer.ok)
                                    ? 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                                    : 'rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
                            }
                        >
                            {fortress.every((layer) => layer.ok) ? 'Semua lapisan kokoh' : 'Ada celah terbuka'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
                        {fortress.map((layer) => (
                            <div
                                key={layer.layer}
                                className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3.5"
                            >
                                <span
                                    className={cn(
                                        'grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold',
                                        layer.ok
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                    )}
                                >
                                    {layer.layer}
                                </span>
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        {layer.name}
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                layer.ok ? 'bg-emerald-500' : 'bg-amber-500'
                                            )}
                                        />
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{layer.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pemindai IP + Peta Serangan */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <ScanLine className="size-4 text-primary" />
                            <h2 className="font-semibold text-foreground">Pemindai IP</h2>
                        </div>
                        <div className="px-5 py-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    ipScanForm.post('/admin/security/ip/scan', {
                                        preserveScroll: true,
                                        onSuccess: () => ipScanForm.reset(),
                                    });
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={ipScanForm.data.ip}
                                    onChange={(e) => ipScanForm.setData('ip', e.target.value)}
                                    placeholder="Pindai IP... cth: 1.2.3.4"
                                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="submit"
                                    disabled={ipScanForm.processing || !ipScanForm.data.ip}
                                    className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                                >
                                    <ScanLine className="mr-1.5 inline size-4" />
                                    Pindai
                                </button>
                            </form>
                            {ipScanForm.errors.ip && (
                                <p className="mt-2 text-xs text-red-600">{ipScanForm.errors.ip}</p>
                            )}

                            {ipScan ? (
                                <div className="mt-4 rounded-xl border border-border bg-surface/60 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-mono text-sm font-bold text-foreground">{ipScan.ip}</p>
                                        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', VERDICT_BADGE[ipScan.verdict])}>
                                            {ipScan.verdict}
                                        </span>
                                    </div>
                                    <div className="mt-3">
                                        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                                            <span>Skor risiko</span>
                                            <span className="font-bold text-foreground">{ipScan.risk} / 100</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    ipScan.risk >= 70 ? 'bg-red-500' : ipScan.risk >= 30 ? 'bg-amber-400' : 'bg-emerald-500'
                                                )}
                                                style={{ width: `${ipScan.risk}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                                        <div className="rounded-lg bg-white p-2.5">
                                            <p className="text-muted">Kejadian 24 jam</p>
                                            <p className="text-base font-bold text-foreground">{ipScan.events_24h}</p>
                                        </div>
                                        <div className="rounded-lg bg-white p-2.5">
                                            <p className="text-muted">Login gagal</p>
                                            <p className="text-base font-bold text-foreground">{ipScan.login_gagal}</p>
                                        </div>
                                        <div className="rounded-lg bg-white p-2.5">
                                            <p className="text-muted">Diblokir</p>
                                            <p className="text-base font-bold text-foreground">{ipScan.diblokir}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                                        {ipScan.banned_now && (
                                            <span className="rounded-full bg-slate-800 px-2 py-0.5 font-medium text-white">
                                                Diban sekarang
                                            </span>
                                        )}
                                        {ipScan.in_allowlist && (
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                                                Dalam allowlist
                                            </span>
                                        )}
                                        {ipScan.in_blocklist && (
                                            <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                                                Dalam blocklist permanen
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs text-muted">
                                        Terakhir terlihat: {ipScan.last_seen ?? 'tidak dalam 24 jam'}
                                        {ipScan.last_event ? ` — ${ipScan.last_event}` : ''}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {!ipScan.banned_now && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        '/admin/security/ban',
                                                        { ip: ipScan.ip },
                                                        { preserveScroll: true }
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                                            >
                                                <Ban className="size-3.5" /> Diban Sekarang
                                            </button>
                                        )}
                                        {ipScan.banned_now && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        '/admin/security/unban',
                                                        { ip: ipScan.ip },
                                                        { preserveScroll: true }
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                <LockOpen className="size-3.5" /> Cabut Ban
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center text-sm text-muted">
                                    Masukkan IP untuk memindai reputasinya: riwayat, skor risiko, dan tindakan cepat.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Radar className="size-4 text-primary" /> Peta Serangan — IP Paling Aktif
                            </h2>
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                                24 jam terakhir
                            </span>
                        </div>
                        {ipIntel.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-muted">
                                Tidak ada IP bermasalah dalam 24 jam terakhir. Benteng tenang.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/60">
                                {ipIntel.map((item) => (
                                    <li key={item.ip} className="flex items-center gap-3 px-5 py-3">
                                        <span className="w-28 shrink-0 truncate font-mono text-xs font-semibold text-foreground">
                                            {item.ip}
                                        </span>
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    item.risk >= 70 ? 'bg-red-500' : item.risk >= 30 ? 'bg-amber-400' : 'bg-emerald-500'
                                                )}
                                                style={{ width: `${item.risk}%` }}
                                            />
                                        </div>
                                        <span className={cn('hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline', VERDICT_BADGE[item.verdict])}>
                                            {item.verdict}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted">
                                            {item.total}× · gagal {item.login_gagal} · blok {item.diblokir}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                ipScanForm.setData('ip', item.ip);
                                                ipScanForm.post('/admin/security/ip/scan', { preserveScroll: true });
                                            }}
                                            className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-primary ring-1 ring-border transition hover:bg-primary hover:text-white"
                                        >
                                            Pindai
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Audit kata sandi */}
                <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <KeyRound className="size-4 text-primary" /> Audit Kata Sandi
                        </h2>
                        <span
                            className={
                                passwordAudit.length === 0
                                    ? 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                                    : 'rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
                            }
                        >
                            {passwordAudit.length === 0
                                ? 'Semua aman'
                                : `${passwordAudit.length} akun berisiko`}
                        </span>
                    </div>
                    {passwordAudit.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-muted">
                            Tidak ditemukan akun dengan kata sandi lemah atau hash tidak aman.
                        </div>
                    ) : (
                        <ul className="divide-y divide-border/60">
                            {passwordAudit.map((user) => (
                                <li key={user.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                                            {user.name}
                                            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                                                @{user.username}
                                            </span>
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                                {ROLE_LABEL[user.role] ?? user.role}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-muted">{user.reason}</p>
                                    </div>
                                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pemindai Perangkat */}
                <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Globe className="size-4 text-primary" /> Pemindai Perangkat
                        </h2>
                        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                            {devices.length} perangkat · {blockedDevices.length} diblokir
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3 font-semibold">Perangkat</th>
                                    <th className="px-5 py-3 font-semibold">IP</th>
                                    <th className="px-5 py-3 font-semibold">Aktif Terakhir</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {devices.map((device) => (
                                    <tr key={device.hash} className="transition hover:bg-surface/60">
                                        <td className="max-w-[220px] px-5 py-3">
                                            <p className="truncate font-semibold text-foreground" title={device.user_agent}>
                                                {device.label}
                                            </p>
                                            <p className="text-xs text-muted">{device.total} sesi</p>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-muted">{device.ip ?? '-'}</td>
                                        <td className="px-5 py-3 text-muted">{device.last_activity}</td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={
                                                    device.blocked
                                                        ? 'rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700'
                                                        : 'rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'
                                                }
                                            >
                                                {device.blocked ? 'Diblokir' : 'Aman'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {device.blocked ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            '/admin/security/device/unblock',
                                                            { hash: device.hash },
                                                            { preserveScroll: true }
                                                        )
                                                    }
                                                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    Buka Blokir
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Blokir perangkat "${device.label}"? Seluruh sesi dari perangkat ini ditolak.`
                                                            )
                                                        ) {
                                                            router.post(
                                                                '/admin/security/device/block',
                                                                { user_agent: device.user_agent },
                                                                { preserveScroll: true }
                                                            );
                                                        }
                                                    }}
                                                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                >
                                                    Blokir
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {blockedDevices.length > 0 && (
                        <div className="border-t border-border px-5 py-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Perangkat diblokir sementara
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {blockedDevices.map((item) => (
                                    <span
                                        key={item.hash}
                                        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs text-red-700"
                                    >
                                        {item.label} · sisa {item.remaining_minutes} mnt
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.post(
                                                    '/admin/security/device/unblock',
                                                    { hash: item.hash },
                                                    { preserveScroll: true }
                                                )
                                            }
                                            className="font-bold text-red-700 hover:text-red-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Intel CVE + Konfigurasi + Celah */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Binary className="size-4 text-primary" /> Intel CVE
                            </h2>
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                                {cve.filter((item) => item.check === 'rentan').length} rentan
                            </span>
                        </div>
                        <ul className="divide-y divide-border/60">
                            {cve.map((item) => (
                                <li key={item.code} className="px-5 py-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-mono text-xs font-bold text-foreground">{item.code}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', SEVERITY_BADGE[item.severity])}>
                                                {item.severity}
                                            </span>
                                            <span
                                                className={
                                                    item.check === 'aman'
                                                        ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'
                                                        : 'rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700'
                                                }
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-sm font-semibold text-foreground">{item.title}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted">{item.desc}</p>
                                    <p className="mt-1.5 text-[11px] text-muted">
                                        Terkena: <span className="font-medium text-foreground">{item.affected}</span> · Perbaikan:{' '}
                                        <span className="font-medium text-foreground">{item.fix}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <ShieldCheck className="size-4 text-primary" /> Pemeriksaan Konfigurasi
                            </h2>
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                                {configChecks.filter((check) => !check.ok).length} bermasalah
                            </span>
                        </div>
                        <ul className="divide-y divide-border/60">
                            {configChecks.map((check) => (
                                <li key={check.label} className="px-5 py-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium text-foreground">{check.label}</span>
                                        <span
                                            className={cn(
                                                'flex items-center gap-1.5 text-xs font-bold',
                                                check.ok ? 'text-emerald-600' : 'text-red-600'
                                            )}
                                        >
                                            <span className={cn('size-2 rounded-full', check.ok ? 'bg-emerald-500' : 'bg-red-500')} />
                                            {check.value}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{check.hint}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <AlertTriangle className="size-4 text-primary" /> Pemindai Celah
                            </h2>
                            <button
                                type="button"
                                onClick={() => router.post('/admin/security/scan-gaps', {}, { preserveScroll: true })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-border transition hover:bg-primary hover:text-white"
                            >
                                <ScanLine className="size-3.5" /> Pindai Ulang
                            </button>
                        </div>
                        {gaps.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-muted">
                                Tidak ditemukan artefak sensitif (backup, .env, dump SQL) di direktori publik.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/60">
                                {gaps.map((gap) => (
                                    <li key={gap.file} className="flex items-center justify-between gap-3 px-5 py-3">
                                        <span className="truncate font-mono text-xs font-semibold text-foreground">{gap.file}</span>
                                        <span className="shrink-0 text-xs text-muted">{Math.round(gap.size / 1024)} KB</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="border-t border-border px-5 py-3.5">
                            <p className="text-[11px] leading-relaxed text-muted">
                                Artefak seperti <code className="rounded bg-surface px-1">.bak</code>,{' '}
                                <code className="rounded bg-surface px-1">.sql</code>,{' '}
                                <code className="rounded bg-surface px-1">.env</code> di folder publik dapat membocorkan
                                kredensial. Hapus atau pindahkan keluar dari <code className="rounded bg-surface px-1">public/</code>.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Cpu className="size-4 text-primary" /> Pemindai Backdoor & Webshell
                            </h2>
                            <button
                                type="button"
                                onClick={() => router.post('/admin/security/scan-backdoors', {}, { preserveScroll: true })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-border transition hover:bg-primary hover:text-white"
                            >
                                <ScanLine className="size-3.5" /> Pindai Ulang
                            </button>
                        </div>
                        {backdoors.files.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-muted">
                                Webroot & area unggahan bersih dari nama berkas atau pola kode webshell.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/60">
                                {backdoors.files.map((file) => (
                                    <li key={file.path} className="flex items-center justify-between gap-3 px-5 py-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-xs font-semibold text-red-600">{file.path}</p>
                                            <p className="mt-0.5 text-[11px] text-muted">{file.reason}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted">{Math.round(file.size / 1024)} KB</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="border-t border-border px-5 py-3.5">
                            <p className="text-[11px] leading-relaxed text-muted">
                                Memindai <code className="rounded bg-surface px-1">public/</code> dan area unggahan terhadap
                                nama berkas mencurigakan (file manager, c99, shell) serta pola kode seperti{' '}
                                <code className="rounded bg-surface px-1">eval</code>,{' '}
                                <code className="rounded bg-surface px-1">base64_decode</code>,{' '}
                                <code className="rounded bg-surface px-1">system($_GET)</code>. Ini juga menangkal
                                serangan otomatis berbasis AI yang menjatuhkan webshell.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pusat aksi: Uji Benteng, Lockdown, SIAGA */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <RefreshCw className="size-4 text-primary" />
                            <h2 className="font-semibold text-foreground">Uji Benteng</h2>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-xs leading-relaxed text-muted">
                                Kirim sampel payload serangan (SQLi, XSS, traversal, command injection, dll.) ke scanner
                                pola dan pastikan dinding menahannya.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.post('/admin/security/self-test', {}, { preserveScroll: true })}
                                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                <Play className="size-4" /> Jalankan Uji Benteng
                            </button>
                            {selfTest && (
                                <div className="mt-4 rounded-xl border border-border bg-surface/60 p-4">
                                    <p className="text-sm font-bold text-foreground">
                                        {selfTest.blocked}/{selfTest.total} payload diblokir
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                        {selfTest.results.map((result) => (
                                            <div
                                                key={result.payload}
                                                className="flex items-center justify-between gap-2 text-xs"
                                            >
                                                <span className="text-muted">{result.payload}</span>
                                                <span
                                                    className={
                                                        result.blocked
                                                            ? 'font-semibold text-emerald-600'
                                                            : 'font-semibold text-red-600'
                                                    }
                                                >
                                                    {result.blocked ? `Diblokir (${result.pattern})` : 'LOLOS'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 font-semibold text-foreground">
                                <Lock className="size-4 text-primary" /> Mode Lockdown
                            </h2>
                            {lockdown && (
                                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                                    AKTIF · sisa {Math.max(0, Math.ceil((lockdown.until - Date.now() / 1000) / 60))} mnt
                                </span>
                            )}
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-xs leading-relaxed text-muted">
                                Kunci gerbang: selama mode ini, hanya IP allowlist dan IP admin saat ini yang boleh
                                masuk. Seluruh pengguna lain ditolak. IP Anda selalu aman.
                            </p>
                            {lockdown ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            '/admin/security/lockdown',
                                            { action: 'off' },
                                            { preserveScroll: true }
                                        )
                                    }
                                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    <LockOpen className="size-4" /> Matikan Lockdown
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Aktifkan mode lockdown? Seluruh akses di luar IP terpercaya akan ditolak selama 30 menit.'
                                            )
                                        ) {
                                            router.post(
                                                '/admin/security/lockdown',
                                                { action: 'on' },
                                                { preserveScroll: true }
                                            );
                                        }
                                    }}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                                >
                                    <Lock className="size-4" /> Aktifkan Lockdown
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50/50 shadow-soft">
                        <div className="flex items-center gap-2 border-b border-red-100 px-5 py-4">
                            <Siren className="size-4 text-red-600" />
                            <h2 className="font-semibold text-red-800">Respon Insiden — SIAGA</h2>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-xs leading-relaxed text-red-700">
                                Satu tombol saat terjadi serangan: ban semua IP mencurigakan aktif (24 jam), cabut seluruh
                                sesi pengguna, dan catat insiden. Celah kecil langsung ditutup.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            'Jalankan SIAGA BENTENG? IP mencurigakan akan diban dan semua sesi pengguna dicabut.'
                                        )
                                    ) {
                                        router.post('/admin/security/respond', {}, { preserveScroll: true });
                                    }
                                }}
                                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                            >
                                <Siren className="size-4" /> SIAGA BENTENG
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ticker ancaman langsung */}
                <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Activity className="size-4 text-primary" /> Ticker Ancaman Langsung
                        </h2>
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            Live · perbarui 30 detik
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3 font-semibold">Waktu</th>
                                    <th className="px-5 py-3 font-semibold">Tipe</th>
                                    <th className="px-5 py-3 font-semibold">Pengguna</th>
                                    <th className="px-5 py-3 font-semibold">IP</th>
                                    <th className="px-5 py-3 font-semibold">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {ticker.map((event) => (
                                    <tr key={event.id} className="transition hover:bg-surface/60">
                                        <td className="whitespace-nowrap px-5 py-2.5 text-muted">{event.time_ago}</td>
                                        <td className="px-5 py-2.5">
                                            <span
                                                className={cn(
                                                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    LOG_BADGE[event.tipe] ?? 'bg-slate-100 text-slate-600'
                                                )}
                                            >
                                                {event.tipe_label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 font-medium text-foreground">{event.name}</td>
                                        <td className="px-5 py-2.5 font-mono text-xs text-muted">{event.ip ?? '-'}</td>
                                        <td className="max-w-[300px] px-5 py-2.5">
                                            <p className="truncate text-muted" title={event.keterangan ?? ''}>
                                                {event.keterangan ?? '-'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Kesehatan sistem */}
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <Server className="size-4 text-primary" />
                            <h2 className="font-semibold text-foreground">Kesehatan Sistem</h2>
                        </div>
                        <ul className="divide-y divide-border/60">
                            {health.map((check) => (
                                <li key={check.label} className="flex items-center justify-between px-5 py-3">
                                    <span className="text-sm text-muted">{check.label}</span>
                                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                check.ok ? 'bg-emerald-500' : 'bg-red-500'
                                            )}
                                        />
                                        {check.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-border px-5 py-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Konfigurasi Firewall
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-surface px-2.5 py-1 text-foreground">
                                    Ban: {firewall.ban_minutes} menit
                                </span>
                                <span className="rounded-full bg-surface px-2.5 py-1 text-foreground">
                                    Ambang blokir: {firewall.max_blocked_hits}x
                                </span>
                                <span className="rounded-full bg-surface px-2.5 py-1 text-foreground">
                                    Login gagal: {firewall.failed_login_threshold}x
                                </span>
                                {firewall.blocked_ips_config.length > 0 && (
                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
                                        Blocklist: {firewall.blocked_ips_config.join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ancaman 24 jam */}
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <Radar className="size-4 text-primary" />
                            <h2 className="font-semibold text-foreground">Ancaman 24 Jam</h2>
                        </div>
                        <div className="space-y-4 px-5 py-5">
                            {threats.map((threat) => (
                                <div key={threat.tipe} className="flex items-center gap-3">
                                    <span className="w-28 shrink-0 text-sm text-muted">{threat.label}</span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                                        <div
                                            className={cn(
                                                'h-full rounded-full',
                                                threat.tipe === 'login_gagal' || threat.tipe === 'banned'
                                                    ? 'bg-red-500'
                                                    : 'bg-amber-400'
                                            )}
                                            style={{ width: `${Math.max(4, (threat.count / maxThreat) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-sm font-semibold text-foreground">
                                        {threat.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IP Diban + form ban */}
                    <div className="rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <Ban className="size-4 text-primary" />
                            <h2 className="font-semibold text-foreground">IP Diban</h2>
                        </div>
                        <div className="px-5 py-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    banForm.post('/admin/security/ban', {
                                        preserveScroll: true,
                                        onSuccess: () => banForm.reset(),
                                    });
                                }}
                                className="mb-4 flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={banForm.data.ip}
                                    onChange={(e) => banForm.setData('ip', e.target.value)}
                                    placeholder="Diban IP... cth: 1.2.3.4"
                                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="submit"
                                    disabled={banForm.processing || !banForm.data.ip}
                                    className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                                >
                                    Ban
                                </button>
                            </form>
                            {banForm.errors.ip && (
                                <p className="mb-3 text-xs text-red-600">{banForm.errors.ip}</p>
                            )}
                            {bannedIps.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted">Tidak ada IP yang sedang diban.</p>
                            ) : (
                                <ul className="space-y-2.5">
                                    {bannedIps.map((item) => (
                                        <li
                                            key={item.ip}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-2.5"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-mono text-sm font-semibold text-foreground">{item.ip}</p>
                                                <p className="truncate text-xs text-muted">
                                                    {item.reason ?? 'Tanpa alasan'} · sisa {item.remaining_minutes} mnt
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.post(
                                                        '/admin/security/unban',
                                                        { ip: item.ip },
                                                        { preserveScroll: true }
                                                    )
                                                }
                                                className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                                            >
                                                Unban
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sesi aktif */}
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Globe className="size-4 text-primary" /> Sesi Aktif
                        </h2>
                        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted">
                            {sessions.length} sesi lainnya
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3.5 font-semibold">Pengguna</th>
                                    <th className="px-5 py-3.5 font-semibold">Perangkat</th>
                                    <th className="px-5 py-3.5 font-semibold">IP</th>
                                    <th className="px-5 py-3.5 font-semibold">Aktivitas Terakhir</th>
                                    <th className="px-5 py-3.5 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted">
                                            Tidak ada sesi aktif lain saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => (
                                        <tr key={session.id} className="transition hover:bg-surface/60">
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-foreground">{session.name}</p>
                                                {session.user_id && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.post(
                                                                `/admin/security/sessions/${session.user_id}/terminate`,
                                                                {},
                                                                { preserveScroll: true }
                                                            )
                                                        }
                                                        className="mt-0.5 text-xs font-medium text-primary hover:underline"
                                                    >
                                                        Cabut semua sesi pengguna ini
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-muted">{session.browser}</td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-muted">{session.ip ?? '-'}</td>
                                            <td className="px-5 py-3.5 text-muted">{session.last_activity}</td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            '/admin/security/session/terminate',
                                                            { session_id: session.id },
                                                            { preserveScroll: true }
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                                >
                                                    <Unplug className="size-3.5" /> Cabut
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Log keamanan */}
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-soft">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="flex items-center gap-2 font-semibold text-foreground">
                            <Activity className="size-4 text-primary" /> Log Keamanan Terbaru
                        </h2>
                        <a
                            href="/admin/security/export"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Ekspor semua
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                                    <th className="px-5 py-3.5 font-semibold">Waktu</th>
                                    <th className="px-5 py-3.5 font-semibold">Tipe</th>
                                    <th className="px-5 py-3.5 font-semibold">Pengguna</th>
                                    <th className="px-5 py-3.5 font-semibold">IP</th>
                                    <th className="px-5 py-3.5 font-semibold">Browser</th>
                                    <th className="px-5 py-3.5 font-semibold">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted">
                                            Belum ada log keamanan. Aktifitas login dan firewall akan tercatat di sini.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="transition hover:bg-surface/60">
                                            <td className="whitespace-nowrap px-5 py-3.5 text-muted">{log.created_at}</td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                        LOG_BADGE[log.tipe] ?? 'bg-slate-100 text-slate-600'
                                                    )}
                                                >
                                                    {log.tipe_label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-foreground">{log.name}</td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-muted">{log.ip ?? '-'}</td>
                                            <td className="max-w-[180px] truncate px-5 py-3.5 text-muted">
                                                {log.browser ?? '-'}
                                            </td>
                                            <td className="max-w-[260px] px-5 py-3.5">
                                                <p className="truncate text-muted">
                                                    {log.keterangan ?? log.path ?? '-'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ringkasan pengguna */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white px-5 py-4 shadow-soft">
                        <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
                            <Shield className="size-4" />
                        </span>
                        <div>
                            <p className="font-display text-lg font-bold text-foreground">{summary.total_guru}</p>
                            <p className="text-xs text-muted">Pengajar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white px-5 py-4 shadow-soft">
                        <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                            <Users className="size-4" />
                        </span>
                        <div>
                            <p className="font-display text-lg font-bold text-foreground">{summary.total_siswa}</p>
                            <p className="text-xs text-muted">Santri</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white px-5 py-4 shadow-soft">
                        <span className="grid size-10 place-items-center rounded-xl bg-slate-700 text-white">
                            <ShieldAlert className="size-4" />
                        </span>
                        <div>
                            <p className="font-display text-lg font-bold text-foreground">{summary.banned_24h}</p>
                            <p className="text-xs text-muted">IP diban dalam 24 jam</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}