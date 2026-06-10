/**
 * Seeds the knowledge base with sample help-center documents.
 * Run after the backend is started: node scripts/seed-knowledge.js
 */
const http = require('http');

const BACKEND_PORT = process.env.PORT || 3001;

const docs = [
  {
    title: 'Password Reset Guide',
    source: 'help-center',
    content: `
# How to Reset Your Password

To reset your password, follow these steps:
1. Go to the login page and click "Forgot Password".
2. Enter the email address associated with your account.
3. Check your inbox for a reset link (valid for 30 minutes).
4. Click the link and enter a new password (minimum 8 characters, must include one uppercase letter and one number).
5. Log in with your new credentials.

If you do not receive the email within 5 minutes, check your spam folder.
If the problem persists, contact support@minestech.com.
Password reset links expire after 30 minutes. You can only request 3 resets per hour.
    `.trim(),
  },
  {
    title: 'Billing & Subscription FAQ',
    source: 'help-center',
    content: `
# Billing & Subscription FAQ

When am I charged?
Subscriptions renew automatically on the same day each month. You will receive an invoice via email 3 days before your renewal date.

How do I upgrade my plan?
Navigate to Settings > Billing > Change Plan. Upgrades take effect immediately and are prorated. Downgrades take effect at the next renewal.

Can I get a refund?
We offer a 14-day money-back guarantee on all new subscriptions. After 14 days, refunds are evaluated case-by-case. Contact billing@minestech.com.

What payment methods are accepted?
We accept Visa, MasterCard, American Express, and PayPal. Bank transfers are available for annual Enterprise plans.

What happens if my payment fails?
You will receive an email notification. We retry the charge after 3 days and again after 7 days. After two failed retries your account is downgraded to the free tier but data is preserved for 30 days.

How do I cancel?
Go to Settings > Billing > Cancel Subscription. Your access continues until the end of the current billing period.
    `.trim(),
  },
  {
    title: 'API Rate Limits and Quotas',
    source: 'developer-docs',
    content: `
# API Rate Limits and Quotas

Default Limits:
- Free tier: 100 requests/hour, 1,000 requests/day
- Starter: 1,000 requests/hour, 10,000 requests/day
- Pro: 10,000 requests/hour, 100,000 requests/day
- Enterprise: Custom limits

Rate Limit Headers:
Every API response includes:
- X-RateLimit-Limit: your hourly limit
- X-RateLimit-Remaining: requests left in current window
- X-RateLimit-Reset: UTC timestamp when the window resets

Handling 429 Responses:
When you receive a 429 Too Many Requests error, implement exponential backoff: wait 1s, then 2s, 4s, 8s up to a maximum of 60s. The Retry-After header tells you the exact wait time.

Increasing Limits:
To request a higher rate limit, submit a request via the developer portal. Enterprise customers can negotiate custom SLAs.
    `.trim(),
  },
  {
    title: 'Two-Factor Authentication Setup',
    source: 'help-center',
    content: `
# Setting Up Two-Factor Authentication (2FA)

Enabling 2FA:
1. Go to Settings > Security > Two-Factor Authentication.
2. Click "Enable 2FA".
3. Choose: Authenticator App (recommended) or SMS.
4. For Authenticator App: scan the QR code with Google Authenticator, Authy, or any TOTP app.
5. Enter the 6-digit code to confirm setup.
6. Save your backup codes — these are one-time-use codes if you lose access to your device.

Logging in with 2FA:
After entering your password, you will be prompted for your 6-digit code. Codes expire every 30 seconds.

If You Lose Access to Your 2FA Device:
Use one of your backup codes to log in, then disable and re-enable 2FA. If you have no backup codes, contact support with proof of identity.

Disabling 2FA:
Go to Settings > Security > Two-Factor Authentication > Disable. You will need to enter your current 2FA code to confirm.
    `.trim(),
  },
  {
    title: 'Data Export and Account Deletion',
    source: 'help-center',
    content: `
# Data Export and Account Deletion

Exporting Your Data:
1. Go to Settings > Privacy > Export Data.
2. Select the data types you want (files, messages, analytics, etc.).
3. Click "Request Export". You will receive a download link via email within 24 hours.
4. The export is a ZIP file. Download links expire after 7 days.

Account Deletion:
1. Go to Settings > Privacy > Delete Account.
2. Read the consequences — deletion is permanent and cannot be undone.
3. Enter your password to confirm.
4. Your account and all data will be deleted within 30 days in compliance with GDPR.

Note: Cancel any active subscription first. No refunds are issued for unused time unless within the 14-day guarantee window.

Data Retention Policy:
- Deleted account data is purged within 30 days.
- Backup data may be retained for up to 90 days.
- Aggregated, anonymized analytics are retained indefinitely.
    `.trim(),
  },
];

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Seeding knowledge base via http://localhost:${BACKEND_PORT}/api/knowledge ...`);
  for (const doc of docs) {
    try {
      const result = await post('/api/knowledge', doc);
      console.log(`  ✓ "${doc.title}" — ${result.chunkCount ?? '?'} chunks`);
    } catch (err) {
      console.error(`  ✗ "${doc.title}":`, err.message);
    }
  }
  console.log('Done. Refresh the Assistant page to start asking questions.');
}

main();
