<?php
/**
 * /admin/ — the private leads inbox. One password, server-rendered, works
 * without JavaScript. Every website enquiry lands here as a lead; leads you
 * get elsewhere (Telegram, Instagram, referrals) can be added by hand.
 *
 *   /admin/                    leads list (tabs + search)
 *   /admin/?lead=12            one lead: details, pipeline, notes
 *   /admin/?view=new           add a lead by hand
 *   /admin/?view=settings      alerts status, test alert, Telegram chat ID
 *   /admin/?view=export        CSV of every lead
 */
declare(strict_types=1);

require __DIR__ . '/../server/bootstrap.php';
require __DIR__ . '/../server/auth.php';
require __DIR__ . '/../server/notify.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'");

$cfg = pt_config();
$post = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
$action = $post ? (string) ($_POST['action'] ?? '') : '';

/* ------------------------------------------------------------- not set up */

if ($cfg['ADMIN_PASSWORD_HASH'] === '') {
    handle_setup($action);
    exit;
}

/* ------------------------------------------------------------------ login */

if ($action === 'login') {
    $err = pt_csrf_ok() ? pt_attempt_login((string) ($_POST['password'] ?? '')) : 'Your session expired. Please try again.';
    if ($err === null) {
        pt_safely(function () use ($cfg) {
            if ($cfg['TELEGRAM_BOT_TOKEN'] !== '' && $cfg['TELEGRAM_CHAT_IDS']) {
                pt_telegram_all('🔐 Admin login · ' . htmlspecialchars(pt_format_time(pt_now()), ENT_NOQUOTES) . "\nNot you? Change ADMIN_PASSWORD_HASH now.");
            }
        });
        redirect('./');
    }
    render_login($err);
    exit;
}

if (!pt_is_logged_in()) {
    render_login(null);
    exit;
}

/* ---------------------------------------------------------------- actions */

if ($post) {
    if (!pt_csrf_ok()) {
        flash('Your session expired — please try that again.', 'error');
        redirect('./');
    }
    $id = (int) ($_POST['id'] ?? 0);
    $db = pt_db();
    switch ($action) {
        case 'logout':
            pt_logout();
            redirect('./');

        case 'pipeline':
            $status = (string) ($_POST['status'] ?? '');
            if (!isset(PT_STATUSES[$status])) $status = 'new';
            $db->prepare('UPDATE leads SET status = ?, follow_up_on = ?, value = ?, updated_at = ? WHERE id = ?')
                ->execute([$status, valid_date($_POST['follow_up_on'] ?? ''), field('value', 80), pt_now(), $id]);
            flash('Saved.');
            redirect("./?lead=$id");

        case 'quick':
            $status = (string) ($_POST['status'] ?? '');
            if (isset(PT_STATUSES[$status])) {
                $db->prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?')->execute([$status, pt_now(), $id]);
                flash('Moved to ' . PT_STATUSES[$status] . '.');
            }
            redirect("./?lead=$id");

        case 'details':
        case 'create':
            $data = lead_form_data();
            if ($data['name'] === '') {
                flash('A name is needed.', 'error');
                redirect($action === 'create' ? './?view=new' : "./?lead=$id");
            }
            $now = pt_now();
            if ($action === 'create') {
                $db->prepare('INSERT INTO leads (created_at, updated_at, source, status, name, email, phone, company, project_type, budget, preferred_contact, message, follow_up_on)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                    ->execute([$now, $now, $data['source'], $data['status'], $data['name'], $data['email'], $data['phone'], $data['company'], $data['project_type'], $data['budget'], $data['preferred_contact'], $data['message'], valid_date($_POST['follow_up_on'] ?? '')]);
                $id = (int) $db->lastInsertId();
                flash('Lead added.');
            } else {
                $db->prepare('UPDATE leads SET source = ?, name = ?, email = ?, phone = ?, company = ?, project_type = ?, budget = ?, preferred_contact = ?, message = ?, updated_at = ? WHERE id = ?')
                    ->execute([$data['source'], $data['name'], $data['email'], $data['phone'], $data['company'], $data['project_type'], $data['budget'], $data['preferred_contact'], $data['message'], $now, $id]);
                flash('Details updated.');
            }
            redirect("./?lead=$id");

        case 'note':
            $body = trim(mb_substr((string) ($_POST['body'] ?? ''), 0, 4000));
            if ($body !== '') {
                $db->prepare('INSERT INTO lead_notes (lead_id, created_at, body) VALUES (?, ?, ?)')->execute([$id, pt_now(), $body]);
                $db->prepare('UPDATE leads SET updated_at = ? WHERE id = ?')->execute([pt_now(), $id]);
            }
            redirect("./?lead=$id#notes");

        case 'delete_note':
            $db->prepare('DELETE FROM lead_notes WHERE id = ? AND lead_id = ?')->execute([(int) ($_POST['note'] ?? 0), $id]);
            redirect("./?lead=$id#notes");

        case 'delete':
            $db->prepare('DELETE FROM leads WHERE id = ?')->execute([$id]);
            flash('Lead deleted.');
            redirect('./');

        case 'test':
            $results = pt_notify_lead([
                'id' => 0, 'name' => 'Test enquiry', 'email' => $cfg['NOTIFY_EMAILS'][0] ?? 'test@example.com', 'phone' => '',
                'company' => 'Pabloch Tech', 'project_type' => 'Test', 'budget' => '—', 'preferred_contact' => 'Email is fine',
                'message' => 'This is a test alert from your admin page. If you can read this, alerts work.', 'page' => pt_admin_url(),
            ]);
            if (!$results) flash('No alert channel is set up yet — add an email or connect Telegram above.', 'error');
            else foreach ($results as $channel => $ok) flash(ucfirst($channel) . ($ok ? ': sent ✓' : ': failed ✗ — check the settings and your server error log'), $ok ? 'ok' : 'error');
            redirect('./?view=settings');

        case 'connect_telegram':
            try {
                $chats = [];
                foreach ((array) pt_telegram_api('getUpdates') as $u) {
                    $chat = $u['message']['chat'] ?? $u['my_chat_member']['chat'] ?? null;
                    if (is_array($chat) && isset($chat['id'])) $chats[(string) $chat['id']] = true;
                }
                if (!$chats) {
                    flash('Telegram hasn’t seen a message yet. Open your bot, press Start (or send “hi”), then click Connect again.', 'error');
                    redirect('./?view=settings');
                }
                pt_save_config(['TELEGRAM_CHAT_IDS' => array_keys($chats)]);
                pt_telegram_all('✅ <b>Connected.</b> New enquiries from your website will arrive here.', pt_admin_url());
                flash('Telegram connected — check your phone for a message.');
            } catch (Throwable $e) {
                flash($e->getMessage(), 'error');
            }
            redirect('./?view=settings');

        case 'save_alerts':
            $changes = ['NOTIFY_EMAILS' => parse_emails((string) ($_POST['emails'] ?? ''))];
            $token = trim((string) ($_POST['bot_token'] ?? ''));
            if ($token !== '' && $token !== $cfg['TELEGRAM_BOT_TOKEN']) {
                $err = check_bot_token($token, $name);
                if ($err) {
                    flash($err, 'error');
                    redirect('./?view=settings');
                }
                $changes += ['TELEGRAM_BOT_TOKEN' => $token, 'TELEGRAM_BOT_NAME' => $name, 'TELEGRAM_CHAT_IDS' => []];
            }
            $pass = (string) ($_POST['smtp_pass'] ?? '');
            if ($pass !== '') $changes['SMTP_PASS'] = $pass;
            if (!empty($_POST['clear_smtp'])) $changes['SMTP_PASS'] = '';
            pt_save_config($changes);
            flash('Saved.');
            redirect('./?view=settings');

        case 'change_password':
            $new = (string) ($_POST['new_password'] ?? '');
            if (!password_verify((string) ($_POST['current_password'] ?? ''), $cfg['ADMIN_PASSWORD_HASH'])) flash('Your current password isn’t right.', 'error');
            elseif (mb_strlen($new) < 12) flash('Use at least 12 characters for the new password.', 'error');
            else {
                pt_save_config(['ADMIN_PASSWORD_HASH' => password_hash($new, PASSWORD_DEFAULT)]);
                flash('Password changed.');
            }
            redirect('./?view=settings');
    }
    redirect('./');
}

/* ------------------------------------------------------------------ views */

$view = (string) ($_GET['view'] ?? '');
if (isset($_GET['lead'])) render_lead((int) $_GET['lead']);
elseif ($view === 'new') render_new();
elseif ($view === 'settings') render_settings();
elseif ($view === 'export') export_csv();
else render_list();
exit;

/* ================================================================ helpers */

function redirect(string $to): never
{
    if (str_starts_with($to, './')) $to = '/admin/' . substr($to, 2);
    header('Location: ' . $to, true, 303);
    exit;
}

function flash(string $msg, string $kind = 'ok'): void
{
    $_SESSION['flash'][] = [$kind, $msg];
}

function field(string $name, int $max): string
{
    return pt_one_line(is_string($_POST[$name] ?? null) ? $_POST[$name] : '', $max);
}

function valid_date(mixed $v): ?string
{
    return is_string($v) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : null;
}

function lead_form_data(): array
{
    $source = (string) ($_POST['source'] ?? 'other');
    $status = (string) ($_POST['status'] ?? 'new');
    return [
        'source' => isset(PT_SOURCES[$source]) ? $source : 'other',
        'status' => isset(PT_STATUSES[$status]) ? $status : 'new',
        'name' => field('name', 120),
        'email' => field('email', 254),
        'phone' => field('phone', 40),
        'company' => field('company', 160),
        'project_type' => field('project_type', 80),
        'budget' => field('budget', 80),
        'preferred_contact' => field('preferred_contact', 80),
        'message' => trim(mb_substr(is_string($_POST['message'] ?? null) ? $_POST['message'] : '', 0, 8000)),
    ];
}

function today(): string
{
    return date('Y-m-d');
}

function status_pill(string $status): string
{
    return '<span class="pill pill--' . h($status) . '">' . h(PT_STATUSES[$status] ?? $status) . '</span>';
}

function select(string $name, array $options, string $current): string
{
    $out = '<select name="' . h($name) . '" id="f-' . h($name) . '">';
    foreach ($options as $value => $label) {
        $out .= '<option value="' . h((string) $value) . '"' . ((string) $value === $current ? ' selected' : '') . '>' . h($label) . '</option>';
    }
    return $out . '</select>';
}

function blank(string $v): bool
{
    return $v === '' || $v === '—';
}

function layout(string $title, string $body, bool $chrome = true): void
{
    $flash = '';
    foreach ($_SESSION['flash'] ?? [] as [$kind, $msg]) {
        $flash .= '<p class="flash flash--' . h($kind) . '" role="status">' . h($msg) . '</p>';
    }
    unset($_SESSION['flash']);
    $nav = '';
    if ($chrome) {
        $view = (string) ($_GET['view'] ?? '');
        $cur = fn (bool $on) => $on ? ' aria-current="page"' : '';
        $nav = '<nav class="top__nav" aria-label="Admin">'
            . '<a href="./"' . $cur($view === '' && !isset($_GET['lead'])) . '>Leads</a>'
            . '<a href="./?view=new"' . $cur($view === 'new') . '>Add lead</a>'
            . '<a href="./?view=settings"' . $cur($view === 'settings') . '>Settings</a>'
            . '<form method="post" class="inline">' . pt_csrf_field() . '<input type="hidden" name="action" value="logout"><button class="linkish">Log out</button></form>'
            . '</nav>';
    }
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex, nofollow"><title>' . h($title) . ' · Pabloch admin</title>'
        . '<link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="admin.css?v=3">'
        . '<script src="admin.js?v=1" defer></script></head><body>'
        . '<header class="top"><a class="top__brand" href="./"><span class="dot" aria-hidden="true"></span>Pabloch <em>admin</em></a>' . $nav . '</header>'
        . '<main class="wrap">' . $flash . $body . '</main></body></html>';
}

/* ================================================================== views */

/**
 * First run. Whoever opens /admin/ first can't simply claim it: a one-time
 * code goes to the studio mailbox (PT_OWNER_EMAIL), and only that code
 * unlocks setup. Setup then writes the private config itself.
 */
function handle_setup(string $action): void
{
    $codeFile = pt_private_dir() . '/setup-code.json';
    $err = null;
    if ($action !== '' && !pt_csrf_ok()) {
        $err = 'Your session expired. Please try again.';
    } elseif ($action === 'send_code') {
        try {
            if (pt_count_hit('setup-code', '*', 3600) > 5) throw new RuntimeException('Too many codes sent. Try again in an hour.');
            $code = (string) random_int(100000, 999999);
            pt_ensure_private_dir();
            file_put_contents($codeFile, json_encode(['hash' => password_hash($code, PASSWORD_DEFAULT), 'expires' => time() + 1800, 'tries' => 0]), LOCK_EX);
            pt_send_mail([PT_OWNER_EMAIL], "Your Pabloch admin setup code: $code", "Your setup code is $code\n\nIt works for 30 minutes. If you didn't ask for it, ignore this email.\n",
                '<p style="font-family:Arial,sans-serif;font-size:15px">Your Pabloch admin setup code is</p><p style="font-family:Arial,sans-serif;font-size:32px;font-weight:bold;letter-spacing:4px">' . $code . '</p><p style="font-family:Arial,sans-serif;font-size:13px;color:#69645c">It works for 30 minutes. If you didn’t ask for it, ignore this email.</p>');
            $_SESSION['setup_sent'] = true;
            redirect('./');
        } catch (Throwable $e) {
            error_log('[pabloch] setup code: ' . $e->getMessage());
            $err = 'Couldn’t send the code: ' . $e->getMessage();
        }
    } elseif ($action === 'setup') {
        $saved = is_file($codeFile) ? json_decode((string) file_get_contents($codeFile), true) : null;
        $pw = (string) ($_POST['password'] ?? '');
        $token = trim((string) ($_POST['bot_token'] ?? ''));
        $botName = '';
        if (!is_array($saved) || $saved['expires'] < time() || $saved['tries'] >= 5) {
            @unlink($codeFile);
            unset($_SESSION['setup_sent']);
            $err = 'That code has expired. Send a new one.';
        } elseif (!password_verify(preg_replace('/\D/', '', (string) ($_POST['code'] ?? '')), $saved['hash'])) {
            $saved['tries']++;
            file_put_contents($codeFile, json_encode($saved), LOCK_EX);
            $err = 'That code isn’t right.';
        } elseif (mb_strlen($pw) < 12) {
            $err = 'Use at least 12 characters for your password — a few random words works well.';
        } elseif ($pw !== (string) ($_POST['confirm'] ?? '')) {
            $err = 'The two passwords don’t match.';
        } elseif ($token !== '' && ($err = check_bot_token($token, $botName))) {
            // $err is set
        } else {
            pt_save_config([
                'ADMIN_PASSWORD_HASH' => password_hash($pw, PASSWORD_DEFAULT),
                'SECRET' => bin2hex(random_bytes(24)),
                'NOTIFY_EMAILS' => parse_emails((string) ($_POST['emails'] ?? '')),
                'SMTP_PASS' => (string) ($_POST['smtp_pass'] ?? ''),
                'TELEGRAM_BOT_TOKEN' => $token,
                'TELEGRAM_BOT_NAME' => $botName,
            ]);
            @unlink($codeFile);
            pt_attempt_login($pw);
            flash('You’re set up. ' . ($token !== '' ? 'Last step: connect Telegram below.' : 'Add Telegram any time below.'));
            redirect('./?view=settings');
        }
    }
    render_setup(!empty($_SESSION['setup_sent']) && is_file($codeFile), $err);
}

function render_setup(bool $codeSent, ?string $err): void
{
    $csrf = pt_csrf_field();
    $body = '<section class="card narrow"><p class="eyebrow">First-time setup</p><h1>Set up your admin</h1>'
        . ($err ? '<p class="flash flash--error" role="alert">' . h($err) . '</p>' : '');
    if (!$codeSent) {
        $body .= '<p class="muted">To prove it’s you, we’ll email a 6-digit code to <strong>' . h(PT_OWNER_EMAIL) . '</strong>.</p>'
            . '<form method="post">' . $csrf . '<input type="hidden" name="action" value="send_code"><button class="btn">Email me a setup code</button></form>';
    } else {
        $body .= '<p class="muted">We sent a code to <strong>' . h(PT_OWNER_EMAIL) . '</strong> (check spam too).</p>'
            . '<form method="post" class="stack">' . $csrf . '<input type="hidden" name="action" value="setup">'
            . '<label>6-digit code<input name="code" inputmode="numeric" autocomplete="one-time-code" required></label>'
            . '<input type="text" name="username" value="admin" autocomplete="username" hidden>'
            . '<label>Choose a password (12+ characters)<input type="password" name="password" autocomplete="new-password" minlength="12" required></label>'
            . '<label>Same again<input type="password" name="confirm" autocomplete="new-password" minlength="12" required></label>'
            . '<label>Send alerts to (one email per line)<textarea name="emails" rows="2">' . h(PT_OWNER_EMAIL) . "\n" . '</textarea></label>'
            . '<label>Telegram bot token <span class="muted">(from @BotFather — optional, can add later)</span><input name="bot_token" autocomplete="off" placeholder="123456789:AA…"></label>'
            . '<label>Password of ' . h(PT_OWNER_EMAIL) . ' <span class="muted">(optional — alert emails are less likely to land in spam)</span><input type="password" name="smtp_pass" autocomplete="off"></label>'
            . '<button class="btn">Finish setup</button></form>'
            . '<form method="post" class="resend">' . $csrf . '<input type="hidden" name="action" value="send_code"><button class="linkish small">Send a new code</button></form>';
    }
    layout('Setup', $body . '</section>', false);
}

function parse_emails(string $raw): array
{
    $list = array_values(array_unique(array_filter(array_map('trim', preg_split('/[\s,;]+/', $raw) ?: []), fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))));
    return $list ?: [PT_OWNER_EMAIL];
}

/** Checks a bot token with Telegram. Returns an error message, or null and sets $name. */
function check_bot_token(string $token, ?string &$name): ?string
{
    if (!preg_match('/^\d{5,15}:[A-Za-z0-9_-]{30,60}$/', $token)) return 'That doesn’t look like a bot token. It looks like 123456789:AAE… — copy it again from @BotFather.';
    try {
        $res = pt_http_post_json("https://api.telegram.org/bot$token/getMe", [], 8);
        $data = json_decode($res['body'], true);
        if (!is_array($data) || ($data['ok'] ?? false) !== true) return 'Telegram didn’t accept that bot token.';
        $name = (string) ($data['result']['username'] ?? '');
        return null;
    } catch (Throwable $e) {
        return 'Couldn’t reach Telegram to check the token: ' . $e->getMessage();
    }
}

function render_login(?string $err): void
{
    $body = '<section class="card narrow"><p class="eyebrow">Private</p><h1>Log in</h1>'
        . ($err ? '<p class="flash flash--error" role="alert">' . h($err) . '</p>' : '')
        . '<form method="post" class="stack">' . pt_csrf_field() . '<input type="hidden" name="action" value="login">'
        . '<input type="text" name="username" value="admin" autocomplete="username" hidden>'
        . '<label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>'
        . '<button class="btn">Log in</button></form></section>';
    layout('Log in', $body, false);
}

function render_list(): void
{
    $db = pt_db();
    $today = today();
    $counts = array_fill_keys(array_keys(PT_STATUSES), 0);
    foreach ($db->query('SELECT status, COUNT(*) n FROM leads GROUP BY status') as $r) $counts[$r['status']] = (int) $r['n'];
    $dueQ = $db->prepare("SELECT COUNT(*) FROM leads WHERE follow_up_on IS NOT NULL AND follow_up_on <= ? AND status NOT IN ('won','lost')");
    $dueQ->execute([$today]);
    $due = (int) $dueQ->fetchColumn();

    $tabs = [
        'open' => ['Open', "status IN ('new','contacted','talking')", $counts['new'] + $counts['contacted'] + $counts['talking']],
        'new' => ['New', "status = 'new'", $counts['new']],
        'due' => ['Follow-ups due', "follow_up_on IS NOT NULL AND follow_up_on <= :today AND status NOT IN ('won','lost')", $due],
        'future' => ['Future leads', "status = 'future'", $counts['future']],
        'won' => ['Won', "status = 'won'", $counts['won']],
        'lost' => ['Lost', "status = 'lost'", $counts['lost']],
        'all' => ['All', '1 = 1', array_sum($counts)],
    ];
    $tab = (string) ($_GET['f'] ?? 'open');
    if (!isset($tabs[$tab])) $tab = 'open';
    $q = trim((string) ($_GET['q'] ?? ''));

    $where = $tabs[$tab][1];
    $params = str_contains($where, ':today') ? [':today' => $today] : [];
    if ($q !== '') {
        $where = "($where) AND (name LIKE :q OR email LIKE :q OR company LIKE :q OR message LIKE :q OR phone LIKE :q)";
        $params[':q'] = '%' . $q . '%';
    }
    $order = $tab === 'due' ? 'follow_up_on ASC' : 'created_at DESC';
    $st = $db->prepare("SELECT l.*, (SELECT COUNT(*) FROM lead_notes n WHERE n.lead_id = l.id) notes FROM leads l WHERE $where ORDER BY $order LIMIT 500");
    $st->execute($params);
    $leads = $st->fetchAll();

    $stats = '<div class="stats">'
        . stat_tile('New', $counts['new'], './?f=new', $counts['new'] > 0)
        . stat_tile('Follow-ups due', $due, './?f=due', $due > 0)
        . stat_tile('In progress', $counts['contacted'] + $counts['talking'], './?f=open')
        . stat_tile('Future leads', $counts['future'], './?f=future')
        . stat_tile('Won', $counts['won'], './?f=won')
        . '</div>';

    $tabHtml = '<nav class="tabs" aria-label="Filter">';
    foreach ($tabs as $key => [$label, , $n]) {
        $tabHtml .= '<a href="./?f=' . $key . ($q !== '' ? '&amp;q=' . urlencode($q) : '') . '"' . ($key === $tab ? ' aria-current="page"' : '') . '>' . h($label) . ' <span>' . $n . '</span></a>';
    }
    $tabHtml .= '</nav>';

    $search = '<form class="search" method="get" role="search"><input type="hidden" name="f" value="' . h($tab) . '">'
        . '<input type="search" name="q" value="' . h($q) . '" placeholder="Search name, email, company, message…" aria-label="Search leads">'
        . '<button class="btn btn--ghost">Search</button>'
        . '<a class="btn btn--ghost" href="./?view=export">Export CSV</a></form>';

    if (!$leads) {
        $rows = '<p class="empty">' . ($q !== '' ? 'No leads match “' . h($q) . '”.' : 'Nothing here yet. New website enquiries appear the moment they’re sent.') . '</p>';
    } else {
        $rows = '<ul class="leads">';
        foreach ($leads as $l) {
            $overdue = $l['follow_up_on'] && $l['follow_up_on'] <= $today && !in_array($l['status'], ['won', 'lost'], true);
            $meta = array_filter([
                blank($l['company']) ? '' : $l['company'],
                blank($l['project_type']) ? '' : $l['project_type'],
                blank($l['budget']) ? '' : $l['budget'],
                $l['source'] !== 'website' ? (PT_SOURCES[$l['source']] ?? $l['source']) : '',
            ]);
            $rows .= '<li class="lead' . ($l['status'] === 'new' ? ' lead--new' : '') . '"><a href="./?lead=' . (int) $l['id'] . '">'
                . '<div class="lead__head"><strong>' . h($l['name']) . '</strong>' . status_pill($l['status']) . '</div>'
                . '<p class="lead__meta">' . h(implode(' · ', $meta) ?: $l['email']) . '</p>'
                . '<p class="lead__msg">' . h(mb_strimwidth(preg_replace('/\s+/', ' ', $l['message']) ?? '', 0, 180, '…')) . '</p>'
                . '<p class="lead__foot"><span title="' . h(pt_format_time($l['created_at'])) . '">' . h(pt_ago($l['created_at'])) . '</span>'
                . ($l['follow_up_on'] ? '<span class="' . ($overdue ? 'due' : '') . '">Follow up ' . h(pt_format_time($l['follow_up_on'] . 'T12:00:00', 'j M')) . '</span>' : '')
                . ((int) $l['notes'] ? '<span>' . (int) $l['notes'] . ' note' . ((int) $l['notes'] === 1 ? '' : 's') . '</span>' : '')
                . '</p></a></li>';
        }
        $rows .= '</ul>';
    }
    layout('Leads', '<h1 class="sr-only">Leads</h1>' . $stats . $tabHtml . $search . $rows);
}

function stat_tile(string $label, int $n, string $href, bool $hot = false): string
{
    return '<a class="stat' . ($hot ? ' stat--hot' : '') . '" href="' . h($href) . '"><span class="stat__n">' . $n . '</span><span class="stat__l">' . h($label) . '</span></a>';
}

function render_lead(int $id): void
{
    $st = pt_db()->prepare('SELECT * FROM leads WHERE id = ?');
    $st->execute([$id]);
    $l = $st->fetch();
    if (!$l) {
        http_response_code(404);
        layout('Not found', '<section class="card narrow"><h1>Lead not found</h1><p><a href="./">Back to leads</a></p></section>');
        return;
    }
    $notesQ = pt_db()->prepare('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC');
    $notesQ->execute([$id]);
    $notes = $notesQ->fetchAll();
    $csrf = pt_csrf_field();
    $idField = '<input type="hidden" name="id" value="' . $id . '">';

    // Contact actions
    $actions = [];
    if ($l['email'] !== '') {
        $subject = rawurlencode('Re: your project brief — Pabloch Tech');
        $actions[] = '<a class="btn" href="mailto:' . h($l['email']) . '?subject=' . $subject . '">Reply by email</a>';
        $actions[] = '<button class="btn btn--ghost" type="button" data-copy-text="' . h($l['email']) . '">Copy email</button>';
    }
    $digits = preg_replace('/\D+/', '', $l['phone']);
    if ($digits !== '' && strlen($digits) >= 8) {
        $actions[] = '<a class="btn btn--ghost" href="https://wa.me/' . h($digits) . '" target="_blank" rel="noopener">WhatsApp</a>';
        $actions[] = '<a class="btn btn--ghost" href="tel:+' . h($digits) . '">Call</a>';
    }
    $quick = '';
    foreach (['contacted' => 'Mark contacted', 'future' => 'Save as future lead', 'won' => 'Won', 'lost' => 'Lost'] as $s => $label) {
        if ($l['status'] === $s) continue;
        $quick .= '<form method="post" class="inline">' . $csrf . $idField . '<input type="hidden" name="action" value="quick"><input type="hidden" name="status" value="' . $s . '"><button class="chip">' . h($label) . '</button></form>';
    }

    $facts = '';
    $rows = [
        'Email' => $l['email'] !== '' ? '<a href="mailto:' . h($l['email']) . '">' . h($l['email']) . '</a>' : '',
        'Phone' => h($l['phone']),
        'Company' => blank($l['company']) ? '' : h($l['company']),
        'Project type' => blank($l['project_type']) ? '' : h($l['project_type']),
        'Budget' => blank($l['budget']) ? '' : h($l['budget']),
        'Preferred contact' => h($l['preferred_contact']),
        'Source' => h(PT_SOURCES[$l['source']] ?? $l['source']),
        'Received' => h(pt_format_time($l['created_at'])),
        'Page' => $l['page'] !== '' ? h($l['page']) : '',
        'Alerts' => h($l['notified']),
    ];
    foreach ($rows as $k => $v) if ($v !== '') $facts .= '<div><dt>' . h($k) . '</dt><dd>' . $v . '</dd></div>';

    $notesHtml = '';
    foreach ($notes as $n) {
        $notesHtml .= '<li><div class="note__head"><time>' . h(pt_format_time($n['created_at'])) . '</time>'
            . '<form method="post" class="inline" data-confirm="Delete this note?">' . $csrf . $idField . '<input type="hidden" name="action" value="delete_note"><input type="hidden" name="note" value="' . (int) $n['id'] . '"><button class="linkish small">Delete</button></form></div>'
            . '<p>' . nl2br(h($n['body'])) . '</p></li>';
    }

    $body = '<p class="back"><a href="./">← All leads</a></p>'
        . '<div class="lead-page">'
        . '<section class="card lead-main">'
        . '<div class="lead__head"><h1>' . h($l['name']) . '</h1>' . status_pill($l['status']) . '</div>'
        . ($actions ? '<div class="actions">' . implode('', $actions) . '</div>' : '')
        . '<h2 class="label">Message</h2><div class="message">' . nl2br(h($l['message'] !== '' ? $l['message'] : '—')) . '</div>'
        . '<dl class="facts">' . $facts . '</dl>'
        . '</section>'

        . '<aside class="lead-side">'
        . '<section class="card"><h2 class="label">Pipeline</h2><div class="chips">' . $quick . '</div>'
        . '<form method="post" class="stack">' . $csrf . $idField . '<input type="hidden" name="action" value="pipeline">'
        . '<label for="f-status">Status</label>' . select('status', PT_STATUSES, $l['status'])
        . '<label>Follow up on<input type="date" name="follow_up_on" value="' . h($l['follow_up_on']) . '"></label>'
        . '<label>Deal value<input type="text" name="value" value="' . h($l['value']) . '" placeholder="e.g. $600 or ₹8,000"></label>'
        . '<button class="btn">Save</button></form></section>'

        . '<section class="card" id="notes"><h2 class="label">Notes</h2>'
        . '<form method="post" class="stack">' . $csrf . $idField . '<input type="hidden" name="action" value="note">'
        . '<textarea name="body" rows="3" placeholder="Called, sent quote, asked for deadline…" aria-label="New note" required></textarea>'
        . '<button class="btn btn--ghost">Add note</button></form>'
        . ($notesHtml ? '<ul class="notes">' . $notesHtml . '</ul>' : '')
        . '</section>'

        . '<details class="card"><summary class="label">Edit details</summary>'
        . lead_form($l, 'details', $id)
        . '</details>'

        . '<form method="post" class="danger" data-confirm="Delete this lead and its notes for good?">' . $csrf . $idField . '<input type="hidden" name="action" value="delete"><button class="linkish">Delete lead</button></form>'
        . '</aside></div>';
    layout($l['name'], $body);
}

function lead_form(array $l, string $action, int $id = 0): string
{
    $input = fn (string $name, string $label, string $type = 'text', string $extra = '') => '<label>' . h($label) . '<input type="' . $type . '" name="' . $name . '" value="' . h($l[$name] ?? '') . '"' . $extra . '></label>';
    return '<form method="post" class="stack">' . pt_csrf_field() . '<input type="hidden" name="action" value="' . $action . '">'
        . ($id ? '<input type="hidden" name="id" value="' . $id . '">' : '')
        . $input('name', 'Name', 'text', ' required maxlength="120"')
        . '<div class="two">' . $input('email', 'Email', 'email') . $input('phone', 'Phone / WhatsApp', 'tel', ' placeholder="+91 98765 43210"') . '</div>'
        . '<div class="two">' . $input('company', 'Company') . $input('project_type', 'Project type') . '</div>'
        . '<div class="two">' . $input('budget', 'Budget') . $input('preferred_contact', 'Preferred contact') . '</div>'
        . '<div class="two"><div><label for="f-source">Source</label>' . select('source', PT_SOURCES, $l['source'] ?? 'other') . '</div>'
        . ($action === 'create' ? '<div><label for="f-status">Status</label>' . select('status', PT_STATUSES, 'new') . '</div>' : '') . '</div>'
        . ($action === 'create' ? '<label>Follow up on<input type="date" name="follow_up_on"></label>' : '')
        . '<label>Message / what they need<textarea name="message" rows="5">' . h($l['message'] ?? '') . '</textarea></label>'
        . '<button class="btn">' . ($action === 'create' ? 'Add lead' : 'Save details') . '</button></form>';
}

function render_new(): void
{
    layout('Add lead', '<section class="card narrow"><p class="eyebrow">Manual entry</p><h1>Add a lead</h1>'
        . '<p class="muted">For enquiries that came in by Telegram, Instagram, email or word of mouth — so every lead lives in one place.</p>'
        . lead_form(['source' => 'telegram'], 'create') . '</section>');
}

function render_settings(): void
{
    $cfg = pt_config();
    $dir = pt_private_dir();
    $csrf = pt_csrf_field();
    $check = fn (bool $ok, string $label, string $detail = '') => '<li class="' . ($ok ? 'ok' : 'off') . '"><span aria-hidden="true">' . ($ok ? '✓' : '○') . '</span><div><strong>' . h($label) . '</strong>' . ($detail !== '' ? '<p class="muted small">' . $detail . '</p>' : '') . '</div></li>';
    $leadCount = (int) pt_db()->query('SELECT COUNT(*) FROM leads')->fetchColumn();
    $smtp = $cfg['SMTP_PASS'] !== '';
    $hasToken = $cfg['TELEGRAM_BOT_TOKEN'] !== '';
    $telegramOn = $hasToken && $cfg['TELEGRAM_CHAT_IDS'];
    $bot = $cfg['TELEGRAM_BOT_NAME'] !== '' ? '@' . $cfg['TELEGRAM_BOT_NAME'] : 'your bot';
    $botLink = $cfg['TELEGRAM_BOT_NAME'] !== '' ? '<a href="https://t.me/' . h($cfg['TELEGRAM_BOT_NAME']) . '" target="_blank" rel="noopener">' . h($bot) . '</a>' : h($bot);

    $telegram = '<section class="card"><h2 class="label">Telegram</h2><ul class="checks">'
        . $check($telegramOn, $telegramOn ? 'Connected' : 'Not connected', $telegramOn ? 'Alerts go to ' . $botLink . '.' : ($hasToken ? 'Open ' . $botLink . ' in Telegram, press <strong>Start</strong>, then click Connect.' : 'Message @BotFather in Telegram, send /newbot, and paste the token under Alert settings.'))
        . '</ul>';
    if ($hasToken) {
        $telegram .= '<form method="post">' . $csrf . '<input type="hidden" name="action" value="connect_telegram"><button class="btn' . ($telegramOn ? ' btn--ghost' : '') . '">' . ($telegramOn ? 'Reconnect' : 'Connect Telegram') . '</button></form>';
    }
    $telegram .= '</section>';

    $body = '<h1>Settings</h1><div class="grid2">'
        . $telegram
        . '<section class="card"><h2 class="label">Email</h2><ul class="checks">'
        . $check((bool) $cfg['NOTIFY_EMAILS'], 'Sending to', h(implode(', ', $cfg['NOTIFY_EMAILS'])) . ($smtp ? ' — through your mailbox ' . h($cfg['SMTP_USER']) : ' — through the server (add your mailbox password below to keep alerts out of spam)'))
        . '</ul><form method="post">' . $csrf . '<input type="hidden" name="action" value="test"><button class="btn btn--ghost">Send a test alert</button></form></section>'

        . '<section class="card"><h2 class="label">Alert settings</h2><form method="post" class="stack">' . $csrf . '<input type="hidden" name="action" value="save_alerts">'
        . '<label>Send email alerts to (one per line)<textarea name="emails" rows="3">' . h(implode("\n", $cfg['NOTIFY_EMAILS'])) . '</textarea></label>'
        . '<label>Telegram bot token' . ($hasToken ? ' <span class="muted">(set — paste a new one to change bots)</span>' : '') . '<input name="bot_token" autocomplete="off" placeholder="' . ($hasToken ? '••••••••' : '123456789:AA…') . '"></label>'
        . '<label>Password of ' . h($cfg['SMTP_USER']) . ($smtp ? ' <span class="muted">(set — leave blank to keep)</span>' : '') . '<input type="password" name="smtp_pass" autocomplete="off"></label>'
        . ($smtp ? '<label class="tick"><input type="checkbox" name="clear_smtp" value="1"> Stop using the mailbox password</label>' : '')
        . '<button class="btn">Save</button></form></section>'

        . '<section class="card" id="password"><h2 class="label">Change password</h2><form method="post" class="stack">' . $csrf . '<input type="hidden" name="action" value="change_password">'
        . '<input type="text" name="username" value="admin" autocomplete="username" hidden>'
        . '<label>Current password<input type="password" name="current_password" autocomplete="current-password" required></label>'
        . '<label>New password (12+ characters)<input type="password" name="new_password" autocomplete="new-password" minlength="12" required></label>'
        . '<button class="btn btn--ghost">Change password</button></form></section>'

        . '<section class="card"><h2 class="label">Storage</h2><ul class="checks">'
        . $check(is_writable($dir), 'Private folder', '<code>' . h($dir) . '</code>')
        . $check(true, $leadCount . ' lead' . ($leadCount === 1 ? '' : 's') . ' saved', 'Times shown in ' . h(date_default_timezone_get()) . '.')
        . '</ul><p><a class="btn btn--ghost" href="./?view=export">Export all leads (CSV)</a></p></section>'
        . '</div>';
    layout('Settings', $body);
}

function export_csv(): void
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="pabloch-leads-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // so Excel reads UTF-8
    $cols = ['id', 'created_at', 'status', 'source', 'name', 'email', 'phone', 'company', 'project_type', 'budget', 'preferred_contact', 'value', 'follow_up_on', 'message', 'page'];
    fputcsv($out, array_merge($cols, ['notes']));
    $notes = pt_db()->prepare('SELECT created_at, body FROM lead_notes WHERE lead_id = ? ORDER BY created_at');
    foreach (pt_db()->query('SELECT * FROM leads ORDER BY created_at DESC') as $l) {
        $notes->execute([$l['id']]);
        $joined = implode("\n", array_map(fn ($n) => pt_format_time($n['created_at']) . ': ' . $n['body'], $notes->fetchAll()));
        $row = array_map(fn ($c) => (string) $l[$c], $cols);
        $row[1] = pt_format_time($l['created_at'], 'Y-m-d H:i');
        $row[] = $joined;
        // Stop spreadsheet apps from running anything typed into the form as a formula.
        fputcsv($out, array_map(fn ($v) => preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v, $row));
    }
    fclose($out);
}
