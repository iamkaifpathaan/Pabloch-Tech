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
    $generated = null;
    $err = null;
    if ($action === 'hash') {
        $pw = (string) ($_POST['password'] ?? '');
        if (mb_strlen($pw) < 12) $err = 'Use at least 12 characters — a few random words works well.';
        elseif ($pw !== (string) ($_POST['confirm'] ?? '')) $err = 'The two passwords don’t match.';
        else $generated = password_hash($pw, PASSWORD_DEFAULT);
    }
    render_setup($generated, $err);
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
            if (!$results) flash('No alert channel is set up yet — add Telegram or email settings to config.php.', 'error');
            else foreach ($results as $channel => $ok) flash(ucfirst($channel) . ($ok ? ': sent ✓' : ': failed ✗ — check the settings and your server error log'), $ok ? 'ok' : 'error');
            redirect('./?view=settings');

        case 'chat_ids':
            $_SESSION['chats'] = [];
            try {
                foreach ((array) pt_telegram_api('getUpdates') as $u) {
                    $chat = $u['message']['chat'] ?? $u['my_chat_member']['chat'] ?? $u['channel_post']['chat'] ?? null;
                    if (is_array($chat) && isset($chat['id'])) {
                        $_SESSION['chats'][(string) $chat['id']] = trim(($chat['title'] ?? '') . ' ' . ($chat['first_name'] ?? '') . ' ' . ($chat['last_name'] ?? '') . (isset($chat['username']) ? ' @' . $chat['username'] : ''));
                    }
                }
                if (!$_SESSION['chats']) flash('No messages found. Open your bot in Telegram, press Start (or send “hi”), then try again.', 'error');
            } catch (Throwable $e) {
                flash($e->getMessage(), 'error');
            }
            redirect('./?view=settings');

        case 'hash':
            $pw = (string) ($_POST['password'] ?? '');
            if (mb_strlen($pw) < 12) flash('Use at least 12 characters.', 'error');
            else $_SESSION['new_hash'] = password_hash($pw, PASSWORD_DEFAULT);
            redirect('./?view=settings#password');
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
        . '<link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="admin.css?v=2">'
        . '<script src="admin.js?v=1" defer></script></head><body>'
        . '<header class="top"><a class="top__brand" href="./"><span class="dot" aria-hidden="true"></span>Pabloch <em>admin</em></a>' . $nav . '</header>'
        . '<main class="wrap">' . $flash . $body . '</main></body></html>';
}

/* ================================================================== views */

function render_setup(?string $generated, ?string $err): void
{
    $dir = pt_private_dir();
    $hasConfig = is_file("$dir/config.php");
    $body = '<section class="card narrow"><p class="eyebrow">First-time setup</p><h1>Choose your admin password</h1>'
        . '<p class="muted">Nothing is saved here. This page turns your password into a hash; you paste that line into your private config file, and from then on only that password opens this page.</p>';
    if ($err) $body .= '<p class="flash flash--error">' . h($err) . '</p>';
    if ($generated) {
        $body .= '<p>Paste this line into <code>' . h($dir) . '/config.php</code>, replacing the empty <code>ADMIN_PASSWORD_HASH</code> line, then reload this page:</p>'
            . '<pre class="copy" data-copy>\'ADMIN_PASSWORD_HASH\' => \'' . h($generated) . '\',</pre>';
    } else {
        $body .= '<form method="post" class="stack"><input type="hidden" name="action" value="hash">'
            . '<label>Password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label>'
            . '<label>Same again<input type="password" name="confirm" autocomplete="new-password" minlength="12" required></label>'
            . '<button class="btn">Generate the line to paste</button></form>';
    }
    $body .= '<p class="muted small">' . ($hasConfig ? 'Config file found at ' : 'No config file yet. Copy <code>server/config.sample.php</code> to ') . '<code>' . h("$dir/config.php") . '</code>.</p></section>';
    layout('Setup', $body, false);
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
    $check = fn (bool $ok, string $label, string $detail = '') => '<li class="' . ($ok ? 'ok' : 'off') . '"><span aria-hidden="true">' . ($ok ? '✓' : '○') . '</span><div><strong>' . h($label) . '</strong>' . ($detail !== '' ? '<p class="muted small">' . $detail . '</p>' : '') . '</div></li>';
    $leadCount = (int) pt_db()->query('SELECT COUNT(*) FROM leads')->fetchColumn();
    $smtp = $cfg['SMTP_HOST'] !== '' && $cfg['SMTP_USER'] !== '' && $cfg['SMTP_PASS'] !== '';

    $body = '<h1>Settings</h1><div class="grid2">'
        . '<section class="card"><h2 class="label">Alerts</h2><ul class="checks">'
        . $check((bool) $cfg['TELEGRAM_CHAT_IDS'] && $cfg['TELEGRAM_BOT_TOKEN'] !== '', 'Telegram', $cfg['TELEGRAM_BOT_TOKEN'] === '' ? 'Add TELEGRAM_BOT_TOKEN to config.php (create a bot with @BotFather).' : ($cfg['TELEGRAM_CHAT_IDS'] ? 'Sending to chat ' . h(implode(', ', $cfg['TELEGRAM_CHAT_IDS'])) : 'Token set — now find your chat ID below.'))
        . $check((bool) $cfg['NOTIFY_EMAILS'], 'Email', $cfg['NOTIFY_EMAILS'] ? 'Sending to ' . h(implode(', ', $cfg['NOTIFY_EMAILS'])) . ($smtp ? ' via ' . h($cfg['SMTP_HOST']) : ' via PHP mail() — set SMTP for better inbox placement') : 'Add addresses to NOTIFY_EMAILS in config.php.')
        . '</ul><form method="post">' . pt_csrf_field() . '<input type="hidden" name="action" value="test"><button class="btn">Send a test alert</button></form></section>'

        . '<section class="card"><h2 class="label">Telegram chat ID</h2>'
        . '<p class="muted">Open your bot in Telegram and press <strong>Start</strong> (for a group: add the bot and send a message). Then:</p>'
        . '<form method="post">' . pt_csrf_field() . '<input type="hidden" name="action" value="chat_ids"><button class="btn btn--ghost"' . ($cfg['TELEGRAM_BOT_TOKEN'] === '' ? ' disabled' : '') . '>Find my chat ID</button></form>';
    foreach ($_SESSION['chats'] ?? [] as $chatId => $name) {
        $body .= '<pre class="copy" data-copy>\'' . h((string) $chatId) . '\',</pre><p class="muted small">' . h($name) . '</p>';
    }
    unset($_SESSION['chats']);
    $body .= '<p class="muted small">Paste the number into TELEGRAM_CHAT_IDS in config.php.</p></section>'

        . '<section class="card" id="password"><h2 class="label">Change password</h2>';
    if (!empty($_SESSION['new_hash'])) {
        $body .= '<p>Replace the ADMIN_PASSWORD_HASH line in config.php with:</p><pre class="copy" data-copy>\'ADMIN_PASSWORD_HASH\' => \'' . h($_SESSION['new_hash']) . '\',</pre>';
        unset($_SESSION['new_hash']);
    }
    $body .= '<form method="post" class="stack">' . pt_csrf_field() . '<input type="hidden" name="action" value="hash">'
        . '<label>New password<input type="password" name="password" autocomplete="new-password" minlength="12" required></label>'
        . '<button class="btn btn--ghost">Generate the line to paste</button></form></section>'

        . '<section class="card"><h2 class="label">Storage</h2><ul class="checks">'
        . $check(is_writable($dir), 'Private folder', '<code>' . h($dir) . '</code>' . (str_starts_with($dir, dirname(__DIR__)) ? '<br>Inside the site folder (protected). Moving it to <code>' . h(dirname(dirname(__DIR__))) . '/pabloch-private</code> is safer.' : ''))
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
