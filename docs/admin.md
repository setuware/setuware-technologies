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
| Enquiries | Owner, Sales | Every form, pop-up, chat, estimate and booking. Owner, follow-up date, status pipeline, timeline of notes, emails and changes, email from the admin with templates, bulk status, CSV |
| Bookings | Owner, Sales | Upcoming and past consultation calls by day |
| Subscribers | Owner, Sales | Newsletter sign-ups, search, remove, CSV export |
| Blog posts | Owner, Editor | Markdown editor with live preview, images, drafts, scheduling, SEO preview, duplicate |
| Jobs | Owner, HR | Create, open, close, duplicate roles; application counts |
| Media | Owner, Editor | Every uploaded image, where it is used, copy link, delete unused |
| Applications | Owner, HR | CV download, 1–5 rating, interview date, owner, status pipeline, timeline, email with templates, bulk status, CSV |
| Team | Owner | Add people, set roles, disable access, reset passwords |
| Email templates | Owner, Sales, HR | Saved replies with placeholders ({{first_name}}, {{service}}, {{job}}, {{sender}}) |
| Site settings | Owner | Announcement bar above the website navigation |
| My account | everyone | Change your own password |

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
