Task List - Teacher Dashboard and Attendance System
[x] 1. Database & Models Creation
[x] Create absensi table migration
[x] Create Absensi.php model
[x] Modify User.php (add ROLE_GURU, isGuru(), and relationships)
[x] Modify PortalSeeder.php to seed a demo teacher user
[x] Run migrations and seed database
[x] 2. Middleware & Authentication Config
[x] Update EnsureRole.php middleware
[x] Update LoginController.php redirect logic
[x] Update AdminController.php role validation
[x] 3. Backend Controllers & Routing
[x] Create GuruController.php for teacher home
[x] Create GuruProgramController.php for program & quiz management
[x] Create GuruAbsensiController.php for teacher & student attendance
[x] Create SiswaAbsensiController.php for student check-in
[x] Create AdminAbsensiController.php for admin view of all logs
[x] Define new routes in routes/auth.php
[ ] 4. Frontend Layouts & Components
[ ] Create GuruLayout.tsx with purple sidebar
[ ] Create Guru/Home.tsx dashboard page
[ ] Create Guru/Programs.tsx program list page
[ ] Create Guru/ProgramMateri.tsx materials & quiz editor
[ ] Create Guru/Absensi.tsx teacher attendance dashboard
[ ] Create Siswa/Absensi.tsx student attendance widget
[ ] Create Admin/Absensi.tsx admin attendance monitor page
[ ] Update StudentSidebar.tsx and AdminLayout.tsx navigation menus
[ ] 5. Verification & Walkthrough
[ ] Verify frontend and backend compiles and works
[ ] Create walkthrough.md






for 2 :
Implementation Plan - Teacher Dashboard and Attendance System
This plan details the implementation of a new Teacher Dashboard (with a purple sidebar layout) under /guru, a multi-role Attendance System (/siswa/absensi, /guru/absensi, and /admin/absensi), and advanced content management features for teachers (specifically Lesson Quiz Management).

User Review Required
IMPORTANT

The database migration will create a new table absensi to store attendance for students and teachers, with daily activity logs. The EnsureRole middleware will be modified to support the new 'guru' role. A new teacher account will be seeded via DatabaseSeeder or manual commands to allow testing.

Open Questions
None at this time. All requirements are clear.

Proposed Changes
1. Database & Models
[NEW] 
create_absensi_table.php
Create the database migration for absensi table.

user_id: Reference to users table (cascade delete)
tanggal: Date of attendance
waktu_masuk: Time of check-in
status: 'hadir', 'sakit', 'izin', 'alpha'
kegiatan: Text describing what they did
keterangan: Text describing details for sickness or permission
verified_by: Nullable reference to user (teacher/admin) who approved
Composite unique key: ['user_id', 'tanggal']
[NEW] 
Absensi.php
Create Absensi model class with belongsTo(User::class) relations for student/teacher and verifier.

[MODIFY] 
User.php
Add ROLE_GURU = 'guru' constant, isGuru() helper, and absensi() relations.

[MODIFY] 
PortalSeeder.php
Add a default teacher account gurualbayan / guru@albayan.test (password: password123).

2. Backend Logic (Controllers & Middleware)
[MODIFY] 
EnsureRole.php
Change to support the guru role check dynamically.

[MODIFY] 
LoginController.php
Redirect authenticated teachers to guru.home after a successful login.

[MODIFY] 
AdminController.php
Allow adding/updating users with the 'guru' role from the admin panel user form.

[NEW] 
GuruController.php
Teacher dashboard home displaying statistics (number of students, attendance rates, recent activities).

[NEW] 
GuruProgramController.php
Teacher course program management:

View all course programs.
Edit course program details.
Manage chapters (bab): list, create, update, delete, reorder.
Manage lesson content (video, pdf, text, links): list, create, update, delete, reorder.
Quiz Management: Create/Edit/Delete quizzes for bab, edit questions, add answer options, and view quiz submissions/grades.
[NEW] 
GuruAbsensiController.php
Teacher attendance controller:

Perform teacher check-in.
View teacher attendance history.
View student attendance logs.
Verify student attendance logs (approve, reject, update status).
[NEW] 
SiswaAbsensiController.php
Student attendance controller:

Perform student daily check-in (including daily activity logs).
View student check-in history.
[NEW] 
AdminAbsensiController.php
Admin attendance view controller to monitor student and teacher attendance logs.

[MODIFY] 
auth.php
Define new routes under namespaces and middlewares:

/guru/* group with role:guru middleware.
/siswa/absensi route in role:siswa group.
/admin/absensi route in role:admin group.
3. Frontend Layouts & Components
[NEW] 
GuruLayout.tsx
A premium layout for teachers containing a purple/violet sidebar (bg-indigo-950 or purple theme), styled similarly to the admin panel layout.

[NEW] 
Home.tsx
Teacher dashboard displaying general stats cards, recent activity, and quick access.

[NEW] 
Programs.tsx
Programs lists and metadata modification forms.

[NEW] 
ProgramMateri.tsx
Chapters (bab) and content manager, plus the custom Quiz & Question Editor for a highly comprehensive experience.

[NEW] 
Absensi.tsx
Interface for teachers to record their presence and verify student attendance logs.

[NEW] 
Absensi.tsx
Daily check-in widget for students showing their monthly history calendar and activity reports.

[NEW] 
Absensi.tsx
Admin dashboard component for auditing all teacher and student attendance logs.

[MODIFY] 
StudentSidebar.tsx
Add /siswa/absensi tab to the sidebar navigation.

[MODIFY] 
AdminLayout.tsx
Add /admin/absensi tab to the sidebar navigation.

Verification Plan
Automated Verification
Run database migrations: php artisan migrate
Seed database to populate mock data: php artisan db:seed --class=PortalSeeder
Test compiling assets: npm run build or npm run typecheck
Manual Verification
Login as admin@albayan.test / adminalbayan -> Check user list, ensure "guru" role can be assigned. Verify /admin/absensi compiles and displays.
Login as guru@albayan.test -> Ensure redirect to /guru works. Verify purple sidebar.
Access /guru/programs and click a program -> Edit bab, contents, and quizzes.
Access /guru/absensi -> Log attendance and view students' logs.
Login as siswa@albayan.test -> Access /siswa/absensi, perform check-in and fill activity log. Verify it appears on teacher and admin dashboards.