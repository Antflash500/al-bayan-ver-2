import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    Bell,
    BookOpen,
    CircleUserRound,
    ClipboardCheck,
    History,
    Image,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Menu,
    Users,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuruLayoutProps {
    children: ReactNode;
}

const NAV = [
    { label: 'Dashboard', href: '/guru', icon: LayoutDashboard },
    { label: 'Daftar Siswa', href: '/guru/siswa', icon: Users },
    { label: 'Program & Materi', href: '/guru/programs', icon: BookOpen },
    { label: 'Absensi', href: '/guru/absensi', icon: ClipboardCheck },
    { label: 'Laporan Kehadiran', href: '/guru/laporan', icon: BarChart3 },
    { label: 'Sertifikat Siswa', href: '/guru/sertifikat', icon: Award },
    { label: 'Galeri', href: '/guru/galeri', icon: Image },
    { label: 'Log Aktivitas', href: '/guru/aktivitas', icon: History },
    { label: 'Pengumuman', href: '/guru/pengumuman', icon: Megaphone },
    { label: 'Profil', href: '/guru/profil', icon: CircleUserRound },
];

function NavItem({ href, label, icon: Icon }: (typeof NAV)[number]) {
    const active =
        window.location.pathname === href ||
        (href !== '/guru' && window.location.pathname.startsWith(href + '/'));

    return (
        <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                active
                    ? 'bg-white text-indigo-950 shadow-soft'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
        >
            <Icon className="size-4 shrink-0" />
            {label}
        </Link>
    );
}

function SidebarNav() {
    return (
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3" aria-label="Menu guru">
            {NAV.map((item) => (
                <NavItem key={item.href} {...item} />
            ))}
        </nav>
    );
}

export default function GuruLayout({ children }: GuruLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const drawerCloseRef = useRef<HTMLButtonElement>(null);
    const { auth } = usePage<{ auth?: { user?: { email?: string; name?: string; username?: string } | null } }>()
        .props;
    const guruName = auth?.user?.name ?? auth?.user?.username ?? 'Ustadz';

    const closeAll = () => {
        setMobileOpen(false);
        setUserOpen(false);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAll();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            drawerCloseRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Head title="Guru Dashboard" />
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-indigo-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
                Lewati ke konten utama
            </a>

            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-indigo-950 lg:flex">
                <div className="flex h-[72px] items-center gap-3 px-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 font-display text-lg text-white">
                        G
                    </span>
                    <div className="leading-tight">
                        <p className="font-display text-lg text-white">Al Bayan</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                            Portal Guru
                        </p>
                    </div>
                </div>
                <SidebarNav />
                <div className="border-t border-indigo-900/50 p-3">
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="size-4" /> Keluar
                    </button>
                </div>
            </aside>

            {/* Topbar */}
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:left-64'
                )}
            >
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Buka menu"
                        aria-expanded={mobileOpen}
                        aria-controls="guru-mobile-menu"
                        className="grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <Menu className="size-5" />
                    </button>
                    <h1 className="font-display text-lg font-bold text-slate-800">Dashboard Pengajar</h1>
                </div>

                <div className="flex items-center gap-1">
                    <div className="mr-2 hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:flex">
                        <span className="size-2 rounded-full bg-indigo-500" />
                        Pengajar
                    </div>

                    <button
                        type="button"
                        aria-label="Notifikasi"
                        className="relative grid size-11 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
                    >
                        <Bell className="size-5" />
                        <span className="absolute right-3 top-3 size-1.5 rounded-full bg-indigo-500" />
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={userOpen}
                            aria-label="Menu akun"
                            className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
                        >
                            <span className="grid size-10 place-items-center rounded-full bg-indigo-800 text-sm font-bold text-white">
                                {guruName.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden text-sm font-medium sm:block">{guruName}</span>
                        </button>
                        {userOpen && (
                            <div className="absolute right-0 top-12 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-800">{guruName}</p>
                                    <p className="text-xs text-slate-500">Guru Pengajar</p>
                                </div>
                                <Link
                                    href="/guru/profil"
                                    onClick={() => setUserOpen(false)}
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
                                >
                                    <CircleUserRound className="size-4" /> Profil
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUserOpen(false);
                                        router.post('/logout');
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                    <LogOut className="size-4" /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" id="guru-mobile-menu">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Tutup menu"
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-indigo-950 shadow-xl">
                        <div className="flex h-[72px] items-center justify-between px-5">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-white/10 font-display text-white">
                                    G
                                </span>
                                <div className="leading-tight">
                                    <p className="font-display text-lg text-white">Al Bayan</p>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                                        Portal Guru
                                    </p>
                                </div>
                            </div>
                            <button
                                ref={drawerCloseRef}
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Tutup menu"
                                className="grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <SidebarNav />
                        <div className="border-t border-indigo-900/50 p-3">
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                <LogOut className="size-4" /> Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main id="main" className="min-h-screen pt-[72px] lg:pl-64">
                <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}