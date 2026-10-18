<?php
/**
 * POST /api/brief.php — the contact form's first-party endpoint.
 *
 * Saves the brief as a lead, then sends the Telegram and email alerts.
 * Response: {"ok": true, "notified": bool}. When nothing could be notified
 * (or this endpoint fails outright) the form also sends the brief through
 * Web3Forms, so an enquiry is never silently lost.
 */
declare(strict_types=1);

require __DIR__ . '/../server/bootstrap.php';
require __DIR__ . '/../server/notify.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private, max-age=0');
header('X-LiteSpeed-Cache-Control: no-cache');
header('X-Robots-Tag: noindex');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method']);
}

// Same-site only: browsers always send Origin on a cross-site POST.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== parse_url('//' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) {
    respond(403, ['ok' => false, 'error' => 'origin']);
}

$raw = file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) respond(400, ['ok' => false, 'error' => 'json']);

$str = fn (string $k, int $max) => is_string($in[$k] ?? null) ? mb_substr(trim($in[$k]), 0, $max) : '';
$lead = [
    'name' => pt_one_line($str('name', 120), 120),
    'email' => $str('email', 254),
    'company' => pt_one_line($str('company', 160), 160),
    'project_type' => pt_one_line($str('projectType', 80), 80),
    'budget' => pt_one_line($str('budget', 80), 80),
    'preferred_contact' => pt_one_line($str('preferredContact', 80), 80),
    'message' => $str('message', 4000),
    'page' => pt_one_line($str('page', 300), 300),
];

// Honeypot: bots get a cheerful nothing.
if ($str('pt_hp', 200) !== '') respond(200, ['ok' => true, 'notified' => true]);

if ($lead['name'] === '' || !filter_var($lead['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($lead['message']) < 10) {
    respond(422, ['ok' => false, 'error' => 'invalid']);
}

$saved = false;
try {
    if (pt_count_hit('brief', pt_ip_key(), 600) > 5) respond(429, ['ok' => false, 'error' => 'rate']);
    $now = pt_now();
    pt_db()->prepare(
        'INSERT INTO leads (created_at, updated_at, source, status, name, email, company, project_type, budget, preferred_contact, message, page)
         VALUES (?, ?, \'website\', \'new\', ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$now, $now, $lead['name'], $lead['email'], $lead['company'], $lead['project_type'], $lead['budget'], $lead['preferred_contact'], $lead['message'], $lead['page']]);
    $lead['id'] = (int) pt_db()->lastInsertId();
    $saved = true;
} catch (Throwable $e) {
    error_log('[pabloch] saving lead failed: ' . $e->getMessage());
    $lead['id'] = 0;
}

$results = pt_notify_lead($lead);
$notified = in_array(true, $results, true);

if ($saved) {
    try {
        $summary = implode(', ', array_map(fn ($k, $v) => $k . ($v ? ' ✓' : ' ✗'), array_keys($results), $results));
        pt_db()->prepare('UPDATE leads SET notified = ? WHERE id = ?')->execute([$summary, $lead['id']]);
    } catch (Throwable) {
    }
}

if (!$saved && !$notified) respond(500, ['ok' => false, 'error' => 'unavailable']);
respond(200, ['ok' => true, 'notified' => $notified]);
