<?php
/**
 * Admin login: one password (hashed in config.php), a hardened session cookie
 * scoped to /admin/, CSRF tokens on every form, and lockouts after repeated
 * wrong passwords.
 */
declare(strict_types=1);

const PT_IDLE_SECONDS = 60 * 60 * 12;
const PT_MAX_FAILS_PER_IP = 5;    // per 15 minutes
const PT_MAX_FAILS_GLOBAL = 50;   // per hour, across every IP

function pt_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $dir = pt_private_dir() . '/sessions';
    if (is_dir($dir) || @mkdir($dir, 0700, true)) session_save_path($dir);
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $local = preg_match('/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/', $host) === 1;
    session_name('pt_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/admin/',
        // Hostinger terminates TLS at a proxy, so PHP can't reliably see HTTPS.
        // The browser is on https (Force HTTPS), so mark the cookie Secure anyway.
        'secure' => !$local,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) PT_IDLE_SECONDS);
    session_start();
}

function pt_is_logged_in(): bool
{
    pt_session_start();
    if (empty($_SESSION['admin'])) return false;
    if (time() - (int) ($_SESSION['seen'] ?? 0) > PT_IDLE_SECONDS) {
        pt_logout();
        return false;
    }
    $_SESSION['seen'] = time();
    return true;
}

/** Returns null on success, or a message to show. */
function pt_attempt_login(string $password): ?string
{
    $hash = (string) pt_config()['ADMIN_PASSWORD_HASH'];
    $ip = pt_ip_key();
    if (pt_count_hit('login-fail', $ip, 900, false) >= PT_MAX_FAILS_PER_IP || pt_count_hit('login-fail', '*', 3600, false) >= PT_MAX_FAILS_GLOBAL) {
        return 'Too many wrong attempts. Wait 15 minutes and try again.';
    }
    if ($hash === '' || !password_verify($password, $hash)) {
        pt_count_hit('login-fail', $ip, 900);
        pt_count_hit('login-fail', '*', 3600);
        return 'That password isn’t right.';
    }
    pt_session_start();
    session_regenerate_id(true);
    $_SESSION = ['admin' => true, 'seen' => time(), 'csrf' => bin2hex(random_bytes(32))];
    return null;
}

function pt_logout(): void
{
    pt_session_start();
    $_SESSION = [];
    $p = session_get_cookie_params();
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Strict']);
    session_destroy();
}

function pt_csrf_token(): string
{
    pt_session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return (string) $_SESSION['csrf'];
}

function pt_csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . h(pt_csrf_token()) . '">';
}

function pt_csrf_ok(): bool
{
    return is_string($_POST['csrf'] ?? null) && hash_equals(pt_csrf_token(), $_POST['csrf']);
}
