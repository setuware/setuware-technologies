# Zoho CRM: website enquiries as Leads

Every enquiry from the contact form, enquiry pop-up, chat assistant,
estimator and booking page creates a **Lead** in Zoho CRM (Zoho CRM Plus
includes it). Newsletter sign-ups are not sent.

| Lead field  | Filled with |
| ----------- | ----------- |
| First / Last Name | the visitor's name |
| Email, Phone | as entered |
| Company | company if given, otherwise the visitor's name |
| Lead Source | `Website` (change with `ZOHO_LEAD_SOURCE`) |
| Description | source (form, pop-up, chat, estimator, booking), service, budget, estimate shown, booked slot, website reference and the message |

If Email is set as a unique field and the visitor is already a Lead, the
enquiry is added as a **Note** on that Lead instead of creating a duplicate.
Workflows, assignment rules and blueprints run as for a manual lead.

E-mail delivery keeps working as before; the CRM is an extra channel, and a
CRM error never stops a visitor's submission.

## Setup (about 10 minutes)

**1. Add the Lead Source value.** Zoho CRM → Setup → Modules and Fields →
Leads → Fields → **Lead Source** → add `Website`. (If you skip this, leads are
still created with the source left blank.)

**2. Create a Self Client.** Open <https://api-console.zoho.in> (India
account) → **Add Client** → **Self Client** → Create. Copy the **Client ID**
and **Client Secret**.

**3. Add them on the server** in `/home/ubuntu/setuware-technologies/.env.production.local`:

```bash
ZOHO_CLIENT_ID=1000.XXXXXXXX
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxx
ZOHO_ACCOUNTS_URL=https://accounts.zoho.in
ZOHO_API_DOMAIN=https://www.zohoapis.in
ZOHO_LEAD_SOURCE=Website
```

**4. Generate a grant code.** In the Self Client → **Generate Code** tab:

- Scope: `ZohoCRM.modules.leads.ALL,ZohoCRM.modules.notes.CREATE,ZohoCRM.users.READ`
- Time duration: 10 minutes
- Description: `Setuware website`

Click Create and copy the code. It works **once** and expires in minutes.

**5. Exchange it for a refresh token** on the server, straight away:

```bash
cd /home/ubuntu/setuware-technologies
npm run crm:token -- 1000.paste-the-code-here
```

Add the printed `ZOHO_REFRESH_TOKEN=…` line to `.env.production.local`.

**6. Restart and test:**

```bash
pm2 restart setuware --update-env
npm run crm:test -- --create
```

You should see `✔ Signed in`, your CRM user, and `✔ Test Lead created`.
Delete the test lead in Zoho CRM → Leads, then submit a real enquiry on the
site and check Leads. The server log shows `[lead] zoho lead created …`
(`pm2 logs setuware`).

## Troubleshooting

| Message | Fix |
| ------- | --- |
| `invalid_code` | The grant code expired or was used. Generate a new one and run step 5 immediately. |
| `invalid_client` | Wrong client ID/secret, or the account is not on the India data centre (`accounts.zoho.com` for .com). |
| `OAUTH_SCOPE_MISMATCH` | Regenerate the grant code with the scope in step 4. |
| `MANDATORY_NOT_FOUND` | A custom field is required in your Leads layout. Make it optional or tell us its API name to fill it. |
| `[lead] zoho: add the Lead Source value` | Do step 1. |
