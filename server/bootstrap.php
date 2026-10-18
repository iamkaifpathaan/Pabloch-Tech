<?php
/**
 * Shared setup for /api/brief.php and /admin/.
 *
 * Everything private lives in ONE folder outside the git repo, so a deploy can
 * never overwrite or publish it:
 *
 *   pabloch-private/
 *     config.php      ← your settings and secrets (copy server/config.sample.php)
 *     leads.sqlite    ← every enquiry (created automatically)
 *     sessions/       ← admin login sessions (created automatically)
 *
 * The folder is looked for, in order:
 *   1. the PABLOCH_PRIVATE_DIR environment variable
 *   2. pabloch-private/ next to the site folder (one level above public_html) ← recommended
 *   3. server/private/ inside the site (git-ignored, and blocked by server/.htaccess)
 */
declare(strict_types=1);

const PT_STATUSES = [
    'new' => 'New',
    'contacted' => 'Contacted',
    'talking' => 'In talks',
    'future' => 'Future lead',
    'won' => 'Won',
    'lost' => 'Lost',
];

const PT_SOURCES = [
    'website' => 'Website form',
    'email' => 'Email',
    'telegram' => 'Telegram',
    'instagram' => 'Instagram',
    'facebook' => 'Facebook',
    'referral' => 'Referral',
    'other' => 'Other',
];

function pt_private_dir(): string
{
    static $dir = null;
    if ($dir !== null) return $dir;
    $env = getenv('PABLOCH_PRIVATE_DIR');
    if (is_string($env) && $env !== '') return $dir = rtrim($env, '/');
    $siteRoot = dirname(__DIR__);
    $outside = dirname($siteRoot) . '/pabloch-private';
    if (is_dir($outside)) return $dir = $outside;
    return $dir = __DIR__ . '/private';
}

/** Settings from pabloch-private/config.php, merged over safe defaults. */
function pt_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $defaults = [
        'ADMIN_PASSWORD_HASH' => '',
        'SITE_URL' => 'https://projects.pablochtech.com',
        'TIMEZONE' => 'Asia/Kolkata',
        'NOTIFY_EMAILS' => [],
        'MAIL_FROM' => '',
        'MAIL_FROM_NAME' => 'Pabloch Tech enquiries',
        'SMTP_HOST' => '',
        'SMTP_PORT' => 465,
        'SMTP_SECURE' => 'ssl',
        'SMTP_USER' => '',
        'SMTP_PASS' => '',
        'TELEGRAM_BOT_TOKEN' => '',
        'TELEGRAM_CHAT_IDS' => [],
        'SECRET' => '',
    ];
    $file = pt_private_dir() . '/config.php';
    $loaded = is_file($file) ? require $file : [];
    $cfg = array_merge($defaults, is_array($loaded) ? $loaded : []);
    $cfg['NOTIFY_EMAILS'] = array_values(array_filter((array) $cfg['NOTIFY_EMAILS'], fn ($e) => is_string($e) && filter_var($e, FILTER_VALIDATE_EMAIL)));
    $cfg['TELEGRAM_CHAT_IDS'] = array_values(array_filter(array_map('strval', (array) $cfg['TELEGRAM_CHAT_IDS']), fn ($id) => preg_match('/^-?\d{3,20}$/', $id) === 1));
    $cfg['SITE_URL'] = rtrim((string) $cfg['SITE_URL'], '/');
    // Used to salt IP hashes. Falls back to something stable but install-specific.
    if ($cfg['SECRET'] === '') $cfg['SECRET'] = hash('sha256', $file . (string) $cfg['ADMIN_PASSWORD_HASH']);
    @date_default_timezone_set((string) $cfg['TIMEZONE']) || date_default_timezone_set('Asia/Kolkata');
    return $cfg;
}

function pt_ensure_private_dir(): void
{
    $dir = pt_private_dir();
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException("Can't create the private folder: $dir");
    }
}

function pt_db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    pt_ensure_private_dir();
    $pdo = new PDO('sqlite:' . pt_private_dir() . '/leads.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'website',
            status TEXT NOT NULL DEFAULT 'new',
            name TEXT NOT NULL,
            email TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            company TEXT NOT NULL DEFAULT '',
            project_type TEXT NOT NULL DEFAULT '',
            budget TEXT NOT NULL DEFAULT '',
            preferred_contact TEXT NOT NULL DEFAULT '',
            message TEXT NOT NULL DEFAULT '',
            page TEXT NOT NULL DEFAULT '',
            follow_up_on TEXT,
            value TEXT NOT NULL DEFAULT '',
            notified TEXT NOT NULL DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS leads_status ON leads (status, created_at);
        CREATE TABLE IF NOT EXISTS lead_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
            created_at TEXT NOT NULL,
            body TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS hits (
            kind TEXT NOT NULL,
            key TEXT NOT NULL,
            at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS hits_lookup ON hits (kind, key, at);
        SQL);
    return $pdo;
}

function pt_now(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

/** HTML-escape. */
function h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function pt_one_line(string $s, int $max = 200): string
{
    return mb_substr(trim(preg_replace('/[\r\n\t]+/', ' ', $s) ?? ''), 0, $max);
}

function pt_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '');
}

/** IPs are only ever stored hashed, for rate limits. */
function pt_ip_key(): string
{
    return hash_hmac('sha256', pt_client_ip(), pt_config()['SECRET']);
}

/** Records a hit and returns how many of this kind/key happened inside the window (including this one). */
function pt_count_hit(string $kind, string $key, int $windowSeconds, bool $record = true): int
{
    $db = pt_db();
    $now = time();
    $db->prepare('DELETE FROM hits WHERE at < ?')->execute([$now - 86400]);
    if ($record) $db->prepare('INSERT INTO hits (kind, key, at) VALUES (?, ?, ?)')->execute([$kind, $key, $now]);
    $q = $db->prepare('SELECT COUNT(*) FROM hits WHERE kind = ? AND key = ? AND at >= ?');
    $q->execute([$kind, $key, $now - $windowSeconds]);
    return (int) $q->fetchColumn();
}

function pt_admin_url(?int $leadId = null): string
{
    return pt_config()['SITE_URL'] . '/admin/' . ($leadId ? '?lead=' . $leadId : '');
}

/** "18 Oct 2026, 4:05 pm" in the configured timezone. */
function pt_format_time(?string $utc, string $format = 'j M Y, g:i a'): string
{
    if (!$utc) return '';
    try {
        $d = new DateTimeImmutable($utc);
        return $d->setTimezone(new DateTimeZone(date_default_timezone_get()))->format($format);
    } catch (Exception) {
        return $utc;
    }
}

function pt_ago(string $utc): string
{
    $s = time() - strtotime($utc);
    if ($s < 60) return 'just now';
    if ($s < 3600) return intdiv($s, 60) . ' min ago';
    if ($s < 86400) return intdiv($s, 3600) . ' h ago';
    if ($s < 86400 * 7) return intdiv($s, 86400) . ' d ago';
    return pt_format_time($utc, 'j M Y');
}
