<?php
/**
 * Pabloch Tech — private settings for the leads inbox and alerts.
 *
 * DON'T EDIT THIS SAMPLE IN PLACE. Copy it to:
 *     pabloch-private/config.php
 * in the folder ABOVE the site folder (next to public_html), and fill it in
 * there. That folder is never in git and never reachable from the web.
 * (Can't create a folder there? server/private/config.php also works.)
 *
 * Anything left blank is simply switched off.
 */
return [

    /* Your admin password, stored as a hash. Open /admin/ before this is set
       and the page generates the line to paste here. */
    'ADMIN_PASSWORD_HASH' => '',

    'SITE_URL' => 'https://projects.pablochtech.com',
    'TIMEZONE' => 'Asia/Kolkata',

    /* ---- Email alerts: every address here gets a copy of each enquiry ---- */
    'NOTIFY_EMAILS' => [
        // 'you@gmail.com',
        // 'you@yourdomain.com',
    ],

    /* Send through your own mailbox (best inbox placement). For a Hostinger
       mailbox: smtp.hostinger.com, port 465, 'ssl', and that mailbox's
       address and password. Leave SMTP_HOST blank to use PHP mail() instead. */
    'SMTP_HOST' => 'smtp.hostinger.com',
    'SMTP_PORT' => 465,
    'SMTP_SECURE' => 'ssl',          // 'ssl' for 465, 'tls' for 587
    'SMTP_USER' => '',               // e.g. 'you@yourdomain.com'
    'SMTP_PASS' => '',
    'MAIL_FROM' => '',               // defaults to SMTP_USER
    'MAIL_FROM_NAME' => 'Pabloch Tech enquiries',

    /* ---- Telegram alerts (instant, free) ----
       1. In Telegram, message @BotFather → /newbot → copy the token here.
       2. Open your new bot and press Start.
       3. Admin → Settings → "Find my chat ID" and paste the number below. */
    'TELEGRAM_BOT_TOKEN' => '',
    'TELEGRAM_CHAT_IDS' => [
        // '123456789',
    ],

    /* Any long random string. Salts the hashed IPs used for rate limits. */
    'SECRET' => '',
];
