# Connecting WhatsApp, Messenger, Instagram, SMS and email

IMPORTANT: this code is written against each provider's published API and is tested with simulated network calls only. Nothing here has been run against a real WhatsApp, Meta, Twilio or Resend account yet. Expect to fix small provider-specific details the first time you connect each one, and test with your own accounts first.

## One-time server settings
- `CHANNEL_CREDENTIAL_KEY`: a random string of at least 32 characters. Credentials are encrypted with it. If you change it later, saved credentials cannot be read and must be entered again. Keep it out of Git.
- `PUBLIC_API_URL`: for example `https://api.campusify.net`. Webhook addresses shown in the dashboard are built from it (and Twilio's signature check needs the exact public address).
- `TRUST_PROXY=1` behind a load balancer.
- Run the migration script from round 2 if you have not (customers created from messages may have no email).
- Create an ACTIVE AI agent and (optionally) a knowledge base first.

## In the dashboard (Channels page)
1. Press **Set up** on a provider, then **Manage**.
2. Enter the credentials, choose the AI agent (or turn AI replies off so your team answers), press **Save settings**, then **Test connection**.
3. Copy the **webhook address** (and, for Meta, the **verify token**) into the provider.
4. Switch the channel on and save. Only a channel that is switched on processes incoming messages.

## WhatsApp (Cloud API)
Needs a Meta developer app with WhatsApp, a phone number, a permanent access token, and the app secret. In the app: WhatsApp > Configuration > Webhook: paste the webhook address and verify token, then subscribe to `messages`. Free-form replies only work within 24 hours of the customer's last message; after that WhatsApp requires approved template messages, which Corvanta does not send yet (the message is saved and marked "Not delivered" with the reason). Delivery receipts (sent, delivered, read) are applied automatically.

## Facebook Messenger and Instagram
Needs a Meta app, a Facebook Page (linked to the Instagram professional account for Instagram), a Page access token with messaging permissions, and the app secret. Add the webhook in Messenger / Instagram settings with the address and verify token, and subscribe to `messages`. Meta requires app review before the public can message you; until then only app testers can. The same 24-hour rule applies.

## SMS (Twilio)
Needs the Account SID, Auth token and a Twilio number. In the Twilio console, set the number's "A message comes in" webhook to the webhook address (HTTP POST). "Sent" means Twilio accepted the message; it does not prove the phone received it.

## Email
Replies are sent with Resend from the address you enter (the domain must be verified in Resend). Corvanta cannot receive email by itself: forward incoming email to the webhook address as JSON `{ "from": "Name <a@b.com>", "subject": "...", "text": "...", "messageId": "..." }` with the header `X-Corvanta-Signature: sha256=<HMAC-SHA256 of the raw body using your signing secret>`. Zapier, Make, Postmark, Mailgun routes or a small function can do this. The signing secret is shown once when you first save; create a new one from the panel if you lose it. Example (shell):
    BODY='{"from":"Ada <ada@shop.com>","subject":"Order","text":"Where is it?","messageId":"abc1"}'
    SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "YOUR_SIGNING_SECRET" | sed 's/^.* //')
    curl -X POST "WEBHOOK_ADDRESS" -H "Content-Type: application/json" -H "X-Corvanta-Signature: sha256=$SIG" -d "$BODY"

## What is not built
X (Twitter) and TikTok (need approved business API access); attachments and images (shown as a placeholder); WhatsApp template messages; email threading and attachments; phone calls.
