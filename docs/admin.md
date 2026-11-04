# Admin portal

`https://setuware.in/admin` is where the team publishes blog posts and jobs,
reviews job applications and works through website enquiries. Changes go live
on the site immediately; no redeploy needed.

## What is in it

| Section | Who | What it does |
| ------- | --- | ------------ |
| Dashboard | everyone | Workload summary, follow-ups due, upcoming interviews, enquiry pipeline, latest items, team activity |
| Search | everyone | One search across enquiries, applicants, posts and jobs (only what your role can see) |
| Analytics | Owner, Sales | Enquiries per day (30 days), sources, services, win rate, most-read articles, applications per role, subscribers |
| CRM leads | Owner, Sales | Leads synced from Zoho CRM (own or all, per role); status, owner, notes and emails written back to Zoho; Sync now (see docs/zoho-crm.md) |
| Enquiries | Owner, Sales | Every form, pop-up, chat, estimate and booking. Owner, follow-up date, status pipeline, timeline of notes, emails and changes, email from the admin with templates, bulk status, CSV |
| Bookings | Owner, Sales | Upcoming and past consultation calls by day |
| Subscribers | Owner, Sales | Newsletter sign-ups, search, remove, CSV export |
| Blog posts | Owner, Editor | Markdown editor with live preview, images, drafts, scheduling, SEO preview, duplicate |
| Jobs | Owner, HR | Create, open, close, duplicate roles; application counts |
| Media | Owner, Editor | Every uploaded image, where it is used, copy link, delete unused |
| Applications | Owner, HR | CV download, 1–5 rating, interview date, owner, status pipeline, timeline, email with templates, bulk status, CSV |
| Team | Owner | Invite people, set roles, disable access, reset passwords and 2-step, unlock |
| Roles & access | Owner | Custom roles with per-section permissions and own/all record access |
| Email templates | Owner, Sales, HR | Saved replies with placeholders ({{first_name}}, {{service}}, {{job}}, {{sender}}) |
| Site settings | Owner | Announcement bar above the website navigation |
| My account | everyone | Password, 2-step verification, signed-in devices |

Emails sent from the admin go out through the site's SMTP mailbox under the
sender's name (e.g. "Satyam Raj | Setuware Technologies"), with replies going
to the sender's own address, and are recorded on the record's timeline.

The site's existing articles and roles were imported automatically on first
start, so everything is editable from day one.

## First-time setup (server)

1. Add to `/home/ubuntu/setuware-technologies/.env.production.local`:

   ```bash
   ADMIN_EMAIL=satyam.raj@setuware.in
   ADMIN_PASSWORD=choose-a-strong-password-123
   ADMIN_NAME=Satyam Raj
   HR_EMAIL_TO=hr@setuware.in
   ```

2. Restart: `pm2 restart setuware --update-env`
3. Open `https://setuware.in/admin` and sign in with that email and password.
   This creates the owner account. Then change the password under **My account**
   and add your team under **Team**. (After the first sign-in the
   `ADMIN_PASSWORD` value is no longer used; you may remove it.)

If nginx sits in front of the app, uploads need `client_max_body_size 8m;` in
the server block (see `deploy/nginx-setuware.conf`), then `sudo nginx -s reload`.

## Where the data lives

- Database: `data/cms.db` (SQLite) in the project folder.
- Uploads: `data/uploads/media` (public blog images, served at `/media/…`)
  and `data/uploads/resumes` (private CVs, only for signed-in HR/owner).

`data/` is not in git and is untouched by deploys. **Back it up:**

```bash
cd /home/ubuntu/setuware-technologies && npm run cms:backup
```

That writes `~/backups/setuware-<date>/` (database + uploads) and keeps the
last 14. To run it daily at 2 am, add this with `crontab -e`:

```
0 2 * * * cd /home/ubuntu/setuware-technologies && npm run cms:backup >> ~/backups/backup.log 2>&1
```

## Staff accounts

- **Invite** (Team → Add a team member → Email an invite): they get an email
  with a link to choose their password (valid 3 days, works once). If SMTP is
  not set up, copy the link shown and send it on WhatsApp.
- **Temporary password**: they must choose their own at first sign-in.
- **Forgot password?** on the sign-in page emails a reset link (1 hour).
  Owners can also send a reset link from the Team page.
- **2-step verification** (My account): scan the QR code with Google
  Authenticator, Microsoft Authenticator or 1Password; sign-in then asks for
  the 6-digit code. 8 one-time recovery codes are shown once. An owner can
  reset it for someone who lost their phone.
- **Lockout**: 5 wrong passwords lock the account for 15 minutes; owners can
  unlock it from Team.
- **Devices**: My account lists where you are signed in; sign out any of them.
  Owners can sign a person out everywhere.

## Roles and access

Team → **Roles & access** lists the roles. Built-in roles: Owner (everything),
Sales Manager, Sales Executive, HR and Content Editor; all except Owner can be
edited, and you can create your own.

- Tick what each role may do per section: view, create, edit, publish, delete,
  assign, export, and so on.
- For leads, enquiries and applications choose **All records** or **Own
  records only** (only those assigned to the person).
- Change a person's role on the Team page; it applies at their next page load.
- A role that is still given to someone cannot be deleted.

## Install as an app

The admin can be installed on phones and computers like an app (it opens in
its own window, with its own icon):

- **Android / Chrome / Edge**: the **Install app** button in the sidebar, or
  the browser menu → *Install app* / *Add to Home screen*.
- **iPhone / iPad (Safari)**: Share → *Add to Home Screen*.

Admin data is never stored on the device; without internet the app shows an
offline page and reloads when the connection is back.

## Security

- Passwords are hashed with scrypt; sessions are random tokens in an
  httpOnly cookie, stored only as a hash, valid for 7 days.
- Sign-in attempts are rate-limited; every sign-in and change is logged
  (Dashboard → Recent activity).
- Each role only sees its own sections; CV downloads and exports check the
  role on every request.
- Uploaded files are checked by their content (not their name) and saved
  under random names.
- `/admin` is excluded from search engines (`robots.txt` and `noindex`).

## Writing posts (Markdown)

| Write | Shows as |
| ----- | -------- |
| `## Heading` / `### Subheading` | section headings |
| `**bold**`, `*italic*`, `` `code` `` | inline styles |
| `[text](https://…)` | link |
| `- item` / `1. item` | bullet / numbered list |
| `> quote` then `> — Name` | quote with citation |
| `> [!NOTE]` / `> [!WARNING]` then `> text` | info / warning callout |
| ```` ```ts ```` … ```` ``` ```` | code block |
| toolbar image button | uploads and inserts an image |

Leave a blank line between paragraphs. Use **Preview** to check before
publishing. A future publish date schedules the post (it appears within a
minute of that date).
