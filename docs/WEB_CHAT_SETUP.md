# Website chat: first-time setup

The website chat widget lets a business's visitors talk to its AI agent from a chat bubble on any website.
Everything they say lands in the Inbox.

## One-time backend steps (do these before first use)
1. Deploy the backend files from this round, then run `npm test`.
2. If you have not yet: `node scripts/migrate-owner-role-and-customer-index.js` (dry run), then `--apply`.
   The widget creates one customer record per visitor, which needs the new customer email index.
3. Set these environment variables on the server:
   - `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` for real replies. Without them the default is a mock that returns canned text.
   - `PUBLIC_API_URL=https://api.campusify.net` so the embed code shows the right address.
   - `TRUST_PROXY=1` when running behind a load balancer (AWS ALB / Elastic Beanstalk) so rate limits apply per visitor.
   - Optional: `WIDGET_TOKEN_SECRET` (a long random string) to sign visitor sessions independently of your login secrets.

## Create an active AI agent
Open **AI Agents** in the dashboard and press **Add agent**:
1. Give it a name and write its instructions (who it is, what it may help with, when to hand over to a person).
2. Choose the provider and model. "Test mode" returns canned replies and needs no key; "OpenAI" needs `OPENAI_API_KEY` on the server, and the screen warns you while it is missing.
3. Optionally tick the knowledge bases it may use.
4. Save, then press **Activate**. Only an active agent can answer visitors.

(Command-line alternative: POST /api/v1/agents with `"status":"active"`, `"provider"`, `"model"` and `"promptTemplate"`.)

## Teach the assistant about the business
Open **Knowledge**, create a knowledge base, and **Add document**: paste policies, prices, opening hours and common answers (text only; file upload is not available yet). Keep documents **Published**: only published documents are used in answers. Use **Test what your assistant can find** with the "Keywords" search to check that a customer question finds the right document. Then edit your agent and tick the knowledge base. Indexing is optional for website chat; it is only needed for meaning-based search.

## Turn the widget on
1. Open **Channels** in the dashboard, click **Set up website chat**.
2. Choose the agent, enter your website address (for example `https://www.yourshop.com`), switch the chat on, save.
3. Copy the embed code and paste it before `</body>` on your site.

## Try it locally
Serve `docs/widget-demo.html` from a local web server (opening it as a file will not work because browsers send no usable origin):

    cd docs && python3 -m http.server 8080

Add `http://localhost:8080` as an allowed website, put your embed code into the file, open http://localhost:8080/widget-demo.html.

## How it is protected
- Each visitor gets a signed session limited to their own conversation; it cannot read anyone else's.
- Only websites you list can call the chat from a browser; everything else is refused.
- Starting chats, sending and polling are rate limited; AI calls also share the company-wide AI limit.
- The public key identifies the business; it is not a secret, and you can replace it any time from the Channels page.
- Visitor text is always displayed as plain text.

## Handing a chat to a person
In the Inbox, open the conversation and press **Take over**. The AI stops answering that visitor, you can type replies (they appear in the visitor's chat within a few seconds), and you can assign it to a teammate. **Hand back to AI** lets the assistant carry on. Replying marks the conversation "waiting" until the visitor writes again.

## Known limits
- Rate limit counters live in server memory, so with several server instances each keeps its own counts.
- No file or image uploads, no typing indicator from the server, no chat transcripts by email.
