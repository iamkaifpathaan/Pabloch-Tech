<?php
/**
 * New-enquiry alerts: Telegram (instant, on your phone) and email (a record in
 * every inbox listed in NOTIFY_EMAILS). Each channel fails on its own — one
 * being down never stops the other, and the lead is already saved either way.
 */
declare(strict_types=1);

/** Sends every configured alert for a lead. Returns e.g. ['telegram' => true, 'email' => false]. */
function pt_notify_lead(array $lead): array
{
    $cfg = pt_config();
    $result = [];
    if ($cfg['TELEGRAM_BOT_TOKEN'] !== '' && $cfg['TELEGRAM_CHAT_IDS']) {
        $result['telegram'] = pt_safely(fn () => pt_telegram_all(pt_lead_telegram_text($lead), pt_admin_url((int) $lead['id'])));
    }
    if ($cfg['NOTIFY_EMAILS']) {
        $result['email'] = pt_safely(fn () => pt_send_lead_email($lead));
    }
    return $result;
}

function pt_safely(callable $fn): bool
{
    try {
        $fn();
        return true;
    } catch (Throwable $e) {
        error_log('[pabloch] ' . $e->getMessage());
        return false;
    }
}

/* ---------------------------------------------------------------- Telegram */

function pt_lead_fields(array $lead): array
{
    return [
        'Email' => $lead['email'],
        'Phone' => $lead['phone'] ?? '',
        'Company' => $lead['company'],
        'Project type' => $lead['project_type'],
        'Budget' => $lead['budget'],
        'Preferred contact' => $lead['preferred_contact'],
    ];
}

function pt_lead_telegram_text(array $lead): string
{
    $e = fn (string $s) => htmlspecialchars($s, ENT_NOQUOTES, 'UTF-8');
    $lines = ['🔔 <b>New enquiry</b> — ' . $e($lead['name'])];
    foreach (pt_lead_fields($lead) as $label => $value) {
        if ($value !== '' && $value !== '—') $lines[] = "<b>$label:</b> " . $e($value);
    }
    $message = mb_strlen($lead['message']) > 1500 ? mb_substr($lead['message'], 0, 1500) . '…' : $lead['message'];
    $lines[] = '';
    $lines[] = $e($message);
    return implode("\n", $lines);
}

function pt_telegram_all(string $html, ?string $buttonUrl = null): void
{
    $failures = [];
    foreach (pt_config()['TELEGRAM_CHAT_IDS'] as $chatId) {
        try {
            pt_telegram_send($chatId, $html, $buttonUrl);
        } catch (Throwable $e) {
            $failures[] = $e->getMessage();
        }
    }
    if ($failures) throw new RuntimeException(implode('; ', $failures));
}

function pt_telegram_send(string $chatId, string $html, ?string $buttonUrl = null): void
{
    $payload = [
        'chat_id' => $chatId,
        'text' => $html,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ];
    // Telegram only accepts public https links on buttons.
    if ($buttonUrl && str_starts_with($buttonUrl, 'https://')) {
        $payload['reply_markup'] = ['inline_keyboard' => [[['text' => 'Open in admin', 'url' => $buttonUrl]]]];
    }
    pt_telegram_api('sendMessage', $payload);
}

/** Calls the Bot API and returns its `result`. */
function pt_telegram_api(string $method, array $payload = []): mixed
{
    $token = pt_config()['TELEGRAM_BOT_TOKEN'];
    $res = pt_http_post_json("https://api.telegram.org/bot$token/$method", $payload, 8);
    $data = json_decode($res['body'], true);
    if (!is_array($data) || ($data['ok'] ?? false) !== true) {
        $why = is_array($data) ? (string) ($data['description'] ?? 'unknown error') : "HTTP {$res['status']}";
        throw new RuntimeException("Telegram $method failed: $why");
    }
    return $data['result'] ?? null;
}

/** @return array{status:int, body:string} */
function pt_http_post_json(string $url, array $payload, int $timeout): array
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $json,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($body === false) throw new RuntimeException("Request failed: $err");
        return ['status' => $status, 'body' => (string) $body];
    }
    $ctx = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $json,
        'timeout' => $timeout,
        'ignore_errors' => true,
    ]]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) throw new RuntimeException('Request failed');
    $status = isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m) ? (int) $m[1] : 0;
    return ['status' => $status, 'body' => $body];
}

/* ------------------------------------------------------------------- Email */

function pt_send_lead_email(array $lead): void
{
    $who = pt_one_line($lead['company'] !== '' && $lead['company'] !== '—' ? "{$lead['name']} ({$lead['company']})" : $lead['name'], 120);
    $link = pt_admin_url((int) $lead['id']);

    $text = "New enquiry from {$lead['name']}\n\n";
    $rows = '';
    foreach (pt_lead_fields($lead) as $label => $value) {
        if ($value === '') continue;
        $text .= "$label: $value\n";
        $rows .= '<tr><td style="padding:4px 16px 4px 0;color:#69645c;white-space:nowrap;vertical-align:top">' . h($label) . '</td><td style="padding:4px 0">' . h($value) . '</td></tr>';
    }
    $text .= "\n{$lead['message']}\n\nPage: {$lead['page']}\nOpen in admin: $link\n\nHit Reply to answer {$lead['name']} directly.\n";

    $html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#141312;max-width:600px">'
        . '<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7a5410">New enquiry</p>'
        . '<h1 style="margin:0 0 16px;font-size:22px">' . h($lead['name']) . '</h1>'
        . '<table style="border-collapse:collapse;margin:0 0 16px">' . $rows . '</table>'
        . '<div style="white-space:pre-wrap;background:#f4f1eb;border-radius:8px;padding:16px;margin:0 0 16px">' . h($lead['message']) . '</div>'
        . '<p style="margin:0 0 16px"><a href="' . h($link) . '" style="display:inline-block;background:#e9b44c;color:#0b0b0c;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:999px">Open in admin</a></p>'
        . '<p style="margin:0;font-size:13px;color:#69645c">Sent from ' . h($lead['page']) . '. Hit Reply to answer ' . h($lead['name']) . ' directly.</p>'
        . '</div>';

    $replyTo = filter_var($lead['email'], FILTER_VALIDATE_EMAIL) ? $lead['email'] : null;
    pt_send_mail(pt_config()['NOTIFY_EMAILS'], "New enquiry — $who", $text, $html, $replyTo, $lead['name']);
}

/**
 * Sends one message to every address in $to. Uses SMTP when SMTP_HOST is set
 * (best: mail is signed by your own mailbox and lands in the inbox), otherwise
 * PHP's mail().
 */
function pt_send_mail(array $to, string $subject, string $text, string $html, ?string $replyTo = null, string $replyName = ''): void
{
    $cfg = pt_config();
    if (!$to) throw new RuntimeException('No NOTIFY_EMAILS configured');
    $from = $cfg['MAIL_FROM'] ?: $cfg['SMTP_USER'];
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('MAIL_FROM is not a valid address');

    $boundary = 'pt_' . bin2hex(random_bytes(12));
    $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
    $headers = [
        'Date' => date(DATE_RFC2822),
        'From' => pt_mime_addr($from, (string) $cfg['MAIL_FROM_NAME']),
        'To' => implode(', ', $to),
        'Subject' => pt_mime_header(pt_one_line($subject)),
        'Message-ID' => '<' . bin2hex(random_bytes(16)) . "@$domain>",
        'MIME-Version' => '1.0',
        'Content-Type' => "multipart/alternative; boundary=\"$boundary\"",
    ];
    if ($replyTo) $headers['Reply-To'] = pt_mime_addr($replyTo, pt_one_line($replyName, 80));

    $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text))
        . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--$boundary--\r\n";

    if ($cfg['SMTP_HOST'] !== '') {
        $raw = '';
        foreach ($headers as $k => $v) $raw .= "$k: $v\r\n";
        pt_smtp_send($from, $to, $raw . "\r\n" . $body);
        return;
    }

    // mail() takes To and Subject separately.
    $subjectHeader = $headers['Subject'];
    unset($headers['To'], $headers['Subject']);
    $extra = '';
    foreach ($headers as $k => $v) $extra .= "$k: $v\r\n";
    if (!mail(implode(', ', $to), $subjectHeader, $body, rtrim($extra), '-f' . $from)) {
        throw new RuntimeException('mail() refused the message');
    }
}

function pt_mime_header(string $s): string
{
    return preg_match('/[^\x20-\x7e]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
}

function pt_mime_addr(string $email, string $name): string
{
    $name = trim(str_replace(['"', '\\', "\r", "\n"], '', $name));
    return $name === '' ? "<$email>" : pt_mime_header($name) . " <$email>";
}

/** A minimal SMTP client (AUTH LOGIN over implicit TLS on 465, or STARTTLS on 587). */
function pt_smtp_send(string $from, array $to, string $message): void
{
    $cfg = pt_config();
    $secure = strtolower((string) $cfg['SMTP_SECURE']);
    $host = (string) $cfg['SMTP_HOST'];
    $port = (int) $cfg['SMTP_PORT'];
    $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . "$host:$port";
    $sock = @stream_socket_client($remote, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, stream_context_create(['ssl' => ['peer_name' => $host]]));
    if (!$sock) throw new RuntimeException("SMTP connect to $host:$port failed: $errstr");
    stream_set_timeout($sock, 15);

    $read = function () use ($sock): array {
        $text = '';
        while (($line = fgets($sock, 2048)) !== false) {
            $text .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') break;
        }
        return [(int) substr($text, 0, 3), trim($text)];
    };
    $cmd = function (?string $line, array $expect) use ($sock, $read): string {
        if ($line !== null) fwrite($sock, $line . "\r\n");
        [$code, $text] = $read();
        if (!in_array($code, $expect, true)) {
            $shown = $line !== null && str_starts_with($line, 'AUTH') ? 'AUTH' : ($line ?? 'greeting');
            throw new RuntimeException("SMTP $shown → $text");
        }
        return $text;
    };

    try {
        $ehlo = 'EHLO ' . (parse_url(pt_config()['SITE_URL'], PHP_URL_HOST) ?: 'localhost');
        $cmd(null, [220]);
        $cmd($ehlo, [250]);
        if ($secure === 'tls') {
            $cmd('STARTTLS', [220]);
            if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                throw new RuntimeException('SMTP STARTTLS failed');
            }
            $cmd($ehlo, [250]);
        }
        if ($cfg['SMTP_USER'] !== '') {
            $cmd('AUTH LOGIN', [334]);
            $cmd(base64_encode((string) $cfg['SMTP_USER']), [334]);
            $cmd(base64_encode((string) $cfg['SMTP_PASS']), [235]);
        }
        $cmd("MAIL FROM:<$from>", [250]);
        foreach ($to as $rcpt) $cmd("RCPT TO:<$rcpt>", [250, 251]);
        $cmd('DATA', [354]);
        // Normalise line endings and dot-stuff lines that start with ".".
        $data = preg_replace('/^\./m', '..', preg_replace("/\r?\n/", "\r\n", $message));
        $cmd(rtrim($data, "\r\n") . "\r\n.", [250]);
        $cmd('QUIT', [221]);
    } finally {
        fclose($sock);
    }
}
