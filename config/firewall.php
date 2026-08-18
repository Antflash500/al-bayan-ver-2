<?php

return [

    /*
    |--------------------------------------------------------------------------
    | IP Routing
    |--------------------------------------------------------------------------
    |
    | allowed_ips:      IP yang selalu lolos dari firewall (opsional).
    | blocked_ips:      IP yang selalu ditolak aksesnya (opsional).
    | admin_allowed_ips: Jika tidak kosong, hanya IP dalam daftar ini yang
    |                     boleh mengakses seluruh area /admin/*. Kosongkan agar
    |                     tidak mengunci akses Anda sendiri.
    |
    | IP dapat berupa alamat tunggal, CIDR (192.168.1.0/24), maupun wildcard
    | parsial (192.168.1.*).
    */

    'allowed_ips' => array_values(array_filter(array_map('trim', explode(',', (string) env('FIREWALL_ALLOWED_IPS', ''))))),
    'blocked_ips' => array_values(array_filter(array_map('trim', explode(',', (string) env('FIREWALL_BLOCKED_IPS', ''))))),
    'admin_allowed_ips' => array_values(array_filter(array_map('trim', explode(',', (string) env('FIREWALL_ADMIN_ALLOWED_IPS', ''))))),

    /*
    |--------------------------------------------------------------------------
    | Throttle / Ban
    |--------------------------------------------------------------------------
    |
    | max_blocked_hits:   Jumlah pelanggaran pola dalam 10 menit sebelum IP diban.
    | ban_minutes:        Durasi ban sementara (menit).
    | failed_login_threshold: Jumlah gagal login dalam 15 menit sebelum IP diban.
    */

    'max_blocked_hits' => (int) env('FIREWALL_MAX_BLOCKED_HITS', 5),
    'ban_minutes' => (int) env('FIREWALL_BAN_MINUTES', 60),
    'failed_login_threshold' => (int) env('FIREWALL_FAILED_LOGIN_THRESHOLD', 8),

    /*
    |--------------------------------------------------------------------------
    | Cache Prefix
    |--------------------------------------------------------------------------
    */

    'cache_prefix' => env('FIREWALL_CACHE_PREFIX', 'sec:fw:'),
    'ban_cache_prefix' => env('FIREWALL_BAN_PREFIX', 'sec:ban:'),
    'device_block_prefix' => env('FIREWALL_DEVICE_PREFIX', 'sec:dev:'),
    'lockdown_cache_prefix' => env('FIREWALL_LOCKDOWN_PREFIX', 'sec:lockdown:'),

    /*
    |--------------------------------------------------------------------------
    | Blokir Perangkat
    |--------------------------------------------------------------------------
    |
    | blocked_agents:   Daftar User-Agent yang selalu ditolak (permanen).
    |                   Blokir sementara dikelola lewat panel keamanan (cache).
    */

    'blocked_agents' => array_values(array_filter(array_map('trim', explode('|', (string) env('FIREWALL_BLOCKED_AGENTS', ''))))),

    /*
    |--------------------------------------------------------------------------
    | Durasi Blokir Perangkat & Lockdown
    |--------------------------------------------------------------------------
    */

    'device_block_minutes' => (int) env('FIREWALL_DEVICE_BLOCK_MINUTES', 1440),
    'lockdown_minutes' => (int) env('FIREWALL_LOCKDOWN_MINUTES', 30),

    /*
    |--------------------------------------------------------------------------
    | Retensi Data Keamanan
    |--------------------------------------------------------------------------
    |
    | log_retention_days:        Berapa hari security_logs disimpan sebelum dibuang
    |                            oleh sistem pembersihan rutin (security:sweep).
    | session_retention_hours:   Umur maksimal sesi basi (tanpa user_id / sudah lama
    |                            tidak aktif) sebelum dibuang otomatis.
    */

    'log_retention_days' => (int) env('FIREWALL_LOG_RETENTION_DAYS', 30),
    'session_retention_hours' => (int) env('FIREWALL_SESSION_RETENTION_HOURS', 48),

    /*
    |--------------------------------------------------------------------------
    | Batas Panjang Input yang Dipindai
    |--------------------------------------------------------------------------
    |
    | Nilai input yang lebih panjang dari ini tidak dipindai untuk mencegah
    | abuse melalui payload raksasa (protection DoS pada lapisan pindai).
    */

    'max_input_scan_length' => (int) env('FIREWALL_MAX_SCAN_LENGTH', 4096),

    /*
    |--------------------------------------------------------------------------
    | Pola URI (path + query string)
    |--------------------------------------------------------------------------
    */

    'uri_patterns' => [
        'sqli-union' => '/\bunion\s+(?:all\s+)?select\b/i',
        'sqli-crud' => '/\b(?:select|insert|update|delete|drop|alter|create|truncate|grant)\b.{0,30}\b(?:from|into|table|database)\b/i',
        'sqli-time' => '/\b(?:sleep|benchmark|pg_sleep|waitfor)\s*\(/i',
        'sqli-enum' => '/\b(?:information_schema|performance_schema|xp_cmdshell|@@version|@@datadir|@@hostname)\b/i',
        'sqli-hex' => '/\b0x[0-9a-fA-F]{6,}\b/i',
        'xss-tag' => '/<(?:script|iframe|object|embed|applet)\b/i',
        'xss-js' => '/\bjavascript\s*:/i',
        'xss-event' => '/\bon(?:error|load|click|mouseover|focus|blur|submit|change)\s*=/i',
        'xss-doc' => '/\bdocument\s*\.\s*(?:cookie|write|location|domain)\b/i',
        'traversal' => '/(?:\.\.\/|\.\.\\\\)/',
        'traversal-encode' => '/%2e%2e(?:%2f|%5c|\/)/i',
        'crlf' => '/%0d%0a|%0a|%0d/i',
        'nullbyte' => '/%00/i',
        'cmd-inject' => '/\b(?:wget|curl|powershell|cmd|nc\s+-e|netcat|/bin/sh|/bin/bash)\b/i',
        'cmd-inject-extra' => '/\b(?:/usr/bin/(?:python|perl|wget)|nslookup|dig\s|tcpdump|%26%26|%3b)\b/i',
        'cmd-semicolon' => '/[;|][\s]*\b(?:id|whoami|uname|cat\s+\/etc|ls\s+\/|ipconfig|net\s+user|dir\s+\\\\|rm\s+-rf|chmod\s+777)\b/i',
        'php-globals' => '/(?:^|[^\w])(?:\$(?:_GET|_POST|_COOKIE|_SERVER|_REQUEST)\s*\[|GLOBALS\s*\[|__globals__)/i',
        'ssti' => '/\{\{\s*[^}]*?(?:\d\s*[*+\-\/]|\w+\s*\(|\.\w+|\bconfig\b)[^}]*\}\}|<%(?:=|@)\s*\w+/i',
        'log4j-jndi' => '/\$\{\s*jndi\s*:/i',
        'log4j-ldap' => '/\$\{\s*ldap\s*:|ldap\:\/\/|rmi\s*:\/\/|dns\s*:\/\/\w+\.\w+/i',
        'xxe' => '/<!DOCTYPE\s+|<!ENTITY\s+|xinclude\s+|<%.*\binclude\b/i',
        'ssrf-url' => '/\b(?:file|gopher|dict|ftp)\s*:\/\/\s*(?:localhost|127\.0\.0\.1|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|\[\s*::1\s*\])/i',
        'webshell' => '/\b(?:c99|r57|b374k|wso\.php|cmd\.php|shell\.php|alfashell|filesman|r57shell)\b/i',
        'upload-malicious' => '/\.(?:php|phtml|php3|php4|php5|php7|phar|shtml|jsp|jspx|asp|aspx|asa|cer|cfm|war)\s*$|\0/i',
        'traversal-encoded' => '/%(?:2e|e0)%(?:2e|e0)|\.\.\/%00|%252e%252e/i',
        'serialized' => '/a:\d+:\{|O:\d+:"\w+":|__PHP_Incomplete_Class/i',
        'jwt-none' => '/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.\s*$/i',
        'idor-numeric' => '/\b(?:id|user_id|userId|account|order|file)\s*=\s*-?\d{6,}\b/i',
        'double-encode' => '/%2525|%2527|%2522|%253c|%253e/i',
        'backdoor-name' => '/\b(?:ftp-manager|webshell|c99|r57|b374k|wso\b|alfashell|filesman|h4x0r|backdoor|eval-stdin|phpinfo|uploader|shell)\b/i',
        'dotfile' => '/(?:^|\/)(?:\.env(?:$|[\/.]))|(?:^|\/)(?:\.git(?:$|[\/]))|(?:^|\/)\.ht(?:access|passwd)(?:$|[\/?#])|(?:^|\/)\.(?:gitignore|svn|DS_Store|user\.ini)(?:$|[\/?#])/i',
        'exec-ext' => '/(?:^|\/)[^\/?#]*\.(?:php|phtml|phar|shtml|pht|php3|php4|php5|php7|php8|cgi|pl|py|sh)(?:$|[?])/i',
    ],

    /*
    |--------------------------------------------------------------------------
    | Pola Body / Form (lebih sempit agar tidak memblokir konten sah)
    |--------------------------------------------------------------------------
    */

    'body_patterns' => [
        'xss-tag' => '/<\s*(?:script|iframe|object|embed)\b/i',
        'xss-js' => '/\bjavascript\s*:/i',
        'xss-event' => '/\bon(?:error|load|mouseover|focus|blur)\s*=/i',
        'xss-doc' => '/\b(?:document\.cookie|document\.write|eval\s*\()/i',
        'sqli-union' => '/\bunion\s+(?:all\s+)?select\b/i',
        'sqli-boolean' => '/(?:\'\s*(?:or|and)\s*\'|\b(?:or|and)\s+[\'\d"]\s*=\s*[\'\d"]|--\s|\/\*)/i',
        'sqli-time' => '/\b(?:sleep|benchmark|pg_sleep|waitfor)\s*\(/i',
        'sqli-enum' => '/\b(?:information_schema|xp_cmdshell|@@version)\b/i',
        'sqli-hex' => '/\b0x[0-9a-fA-F]{6,}\b/i',
        'proto-pollution' => '/(?:__proto__|constructor\[\s*["\']prototype|__stringify)/i',
        'ssti' => '/\{\{\s*[^}]*?(?:\d\s*[*+\-\/]|\w+\s*\(|\.\w+|\bconfig\b)[^}]*\}\}|<%(?:=|@)\s*\w+/i',
        'log4j-jndi' => '/\$\{\s*jndi\s*:/i',
        'xxe' => '/<!DOCTYPE\s+|<!ENTITY\s+|xinclude\s+/i',
        'webshell' => '/\b(?:c99|r57|b374k|wso\.php|cmd\.php|shell\.php|filesman)\b/i',
        'upload-malicious' => '/\.(?:php|phtml|php3|php4|php5|php7|phar|shtml|jsp|jspx|asp|aspx|asa|cer|cfm|war)\s*$/i',
        'serialized' => '/a:\d+:\{|O:\d+:"\w+":/i',
        'crlf-null' => '/%0d%0a|%00/i',
        'traversal-lfi' => '/\.\.\/(?:etc\/|var\/|boot\/|proc\/|opt\/|home\/|tmp\/|usr\/)/i',
        'cmd-semicolon' => '/[;|][\s]*\b(?:id|whoami|uname|cat\s+\/etc|ipconfig|net\s+user|dir\s+\\\\|rm\s+-rf|chmod\s+777)\b/i',
        'php-globals' => '/(?:^|[^\w])(?:\$(?:_GET|_POST|_COOKIE|_SERVER|_REQUEST)\s*\[|GLOBALS\s*\[|__globals__)/i',
        'ai-prompt-inject' => '/\b(?:ignore\s+(?:all\s+)?(?:previous|prior|earlier)\s+(?:instructions?|prompts?|messages?|rules?)|disregard\s+(?:all\s+)?(?:previous|prior)\s+(?:instructions?|prompts?)|reveal\s+(?:your\s+)?(?:system\s+|hidden\s+)?(?:prompt|instructions)|(?:developer|jailbreak|superior|god|unfiltered)\s+mode|act\s+as\s+(?:an\s+)?(?:unrestricted|evil|unfiltered|no-?rules)|DAN\s+mode|my\s+(?:new|real)\s+(?:instructions?|prompts?|system)|system\s+prompt\s*[:=]|role-play\s+as\s+(?:an?\s+)?(?:unrestricted|evil))/i',
        'upload-malicious-encoded' => '/\.(?:php|phtml|phar)\s*(?:$|%00)/i',
    ],

    /*
    |--------------------------------------------------------------------------
    | User-Agent Scanner
    |--------------------------------------------------------------------------
    */

    'bad_user_agents' => [
        'sqlmap',
        'nikto',
        'nessus',
        'acunetix',
        'openvas',
        'metasploit',
        'masscan',
        'zgrab',
        'dirbuster',
        'gobuster',
        'wpscan',
        'joomscan',
        'arachni',
        'skipfish',
        'hydra',
        'ffuf',
        'nuclei',
        'w3af',
        'wafw00f',
        'sqliv',
        'havij',
        'wascan',
        'netsparker',
        'netsparker Cloud',
        'OpenVAS',
        'Burp',
        'BurpSuite',
        'ZAP',
        'OWASP',
        'Arachni',
        'Fuzz Faster U Fool',
        'DirBuster',
        'go lang akamai',
        'HTTrack',
    ],
];