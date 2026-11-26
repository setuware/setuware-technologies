# Admin portal

`https://setuware.in/admin` is where the team publishes blog posts and jobs,
reviews job applications and works through website enquiries. Changes go live
on the site immediately; no redeploy needed.

## What is in it

| Section | Who | What it does |
| ------- | --- | ------------ |
| Dashboard | everyone | Workload summary, follow-ups due, upcoming interviews, enquiry pipeline, latest items, team activity |
| Projects | everyone | Client projects: progress, hours vs budget, deadline, overdue tasks, hours per person |
| Team directory | everyone | People by department, designation, contacts, reporting manager, who's in today; profiles |
| Notifications | everyone | The bell: assignments, reviews, approvals, comments, reminders |
| Tasks | everyone | Board (drag between To do / In progress / In review / Done), list, weekly timesheet; checklist, comments, due dates, priorities, projects, timers and logged time; link a task to a lead, enquiry or applicant |
| My attendance | everyone | Check in / break / check out (office, remote or on-site, with location), daily work summary, month calendar, leave balance, leave and correction requests |
| Team attendance | Owner, HR | Who is in today, late arrivals, approvals, monthly register with CSV, daily logs, fix a record, settings and holidays |
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

- **Add a team member** (Team → Add member): enter name, work email, role
  and optional job details (designation, department, manager, joining date).
  - **Email login details** (default): a temporary password is generated (or
    type your own) and emailed with the sign-in page; they must choose their
    own password at first sign-in.
  - **Email an invite link**: a link to choose their password (valid 3 days,
    works once).
  - **Welcome email** (on by default): their role, manager, joining date and a
    first-day checklist.
  If SMTP is not set up, the account is still created and the password or link
  is shown to copy and send yourself.
- Each member on the Team page also has **Email login details** (new temporary
  password, emailed), **Send welcome email**, **Resend invite** / **Send reset
  link** and **Set temporary password**.
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

## Tasks

- **Create** from Tasks → New task, with "Add a task" on the board, or from a
  lead, enquiry or applicant page (the task stays linked to it).
- **Board**: drag cards between columns; on phones use "Move to" on the card.
  Done tasks stay on the board for 14 days. Overdue cards have a red edge,
  urgent ones an orange edge, and each column shows how many are overdue.
- **Quick filters**: Overdue, Due today, Next 7 days, No due date, In review
  and (for "All records") Unassigned, plus a status filter and "Show older
  done" for tasks finished more than 14 days ago.
- **List**: tasks grouped into Overdue / Due today / Next 7 days / Later /
  No due date / Done. Tick tasks to change status, priority, due date or
  assignee, or delete them, in one go. The same rules apply as for one task:
  you can only change tasks you can see, only "Assign to others" roles can
  assign colleagues, and only the creator (or "All records" roles) can delete.
- **Team** (roles with "All records"): each person's open, overdue, next-7-day
  and in-review tasks and estimated hours left, plus the unassigned queue.
  Click a name to see their tasks.
- **Repeat**: a task can repeat daily, weekly or monthly. When it's done, the
  next copy is created once, with the due date moved on (skipping dates that
  have already passed) and the checklist unticked.
- **Who sees what**: everyone sees tasks assigned to them or created by them.
  "Assign to others" lets a role give tasks to colleagues; "All records" shows
  everyone's tasks.
- **Who assigns**: roles with "Assign to others" (Owner, Sales Manager, HR,
  Tech Lead, Developer, QA, Designer) can give tasks to colleagues and choose
  the reviewer; others create tasks for themselves.
- **Who reviews**: roles with "Review & approve work" (Owner, Tech Lead, QA,
  Sales Manager) can be picked as a task's reviewer. When the assignee moves
  a reviewed task to Done it goes to **In review** instead; the reviewer gets
  an email and either **approves** (task done) or **requests changes** (back
  to In progress with their comments). Tasks waiting for you are under
  Tasks → "Waiting for my review" and on the dashboard.
- **Time**: start a timer on a task (one at a time; starting another stops the
  first, and checking out stops it) or log time by hand.
- **Emails** (when SMTP is set up): assignment, comments, and "done" to the
  person who created the task.

## Timesheets

- **My timesheet**: a weekly grid of tasks × days. Timer and manual time
  appear automatically; type hours (1.5 or 1:30) to fill the rest, add rows
  for other tasks, compare with your attendance hours, then **Submit week**.
- A submitted week is locked (no timers or time logs) until it is approved
  or sent back.
- **Team timesheets** (Owner, Tech Lead, HR to view; Owner and Tech Lead to
  approve): hours logged vs expected vs at work, each person's grid,
  **Approve** / **Send back** with a comment, **Reopen** an approved week,
  CSV export. Approvers get an email when someone submits.

## Attendance and leave

- **Check in / out** from My attendance or the status button at the top of
  every page. Choose Office, Remote or On-site.
- **Location**: the browser's GPS location (with accuracy) is saved at
  check-in and at check-out. With an office location set, managers see
  "at office" or the distance (highlighted when outside the radius), with a
  Google Maps link. Turn on **Require location** in Attendance settings to
  stop check-ins without it. If someone blocked location, the app tells them
  how to allow it. At check-out people write what they worked on; managers see it
  under Team attendance.
- **Breaks** are subtracted from worked hours. Checking in again after
  checking out resumes the day (the gap counts as a break).
- **Day codes**: P present (full-day hours), HD half day, S short day,
  MC missed check-out, L leave, HL half-day leave, WFH, H holiday, WO weekly
  off, A absent. Late = after office start + grace minutes.
- **Leave**: people request it; anyone with "Approve leave" gets an email and
  approves under Team attendance. Balances use the yearly allowance in
  Attendance settings and count working days only.
- **Corrections**: a forgotten check-out is fixed by a correction request, or
  a manager can set the times directly ("Fix a record"; marked as edited).
- **Settings** (Team attendance → Settings & holidays): office start, grace,
  full/half-day hours, weekly offs, office location and radius, leave
  allowances, holidays.
- Times use India time. Export the monthly register as CSV for payroll.

## Projects

Tasks → **Projects** groups tasks by their project name. Create a project to
add the client, project manager, start date, deadline, budget (hours) and
scope; tasks with that project name join it automatically. Each project shows
progress, hours against budget, overdue tasks, hours per person and its task
list. Renaming a project moves its tasks; completed and cancelled projects
drop out of the task form's suggestions. People who can assign tasks can edit
projects.

## Team directory and reporting lines

**People → Team directory** lists everyone by department with designation,
contact details, who they report to and whether they're in today. Owners set
designation, department, joining date and **Reports to** on a person's page;
everyone can update their own phone and birthday.

A person's manager (directly, or further up) can see their team under Team
attendance and Team timesheets and **approve their leave, corrections and
timesheets**, even without the wider HR or Tech Lead permissions. Nobody
approves their own requests (except the Owner).

## Notifications and reminders

The **bell** at the top shows assignments, reviews, approvals, comments and
reminders; they're also emailed when SMTP is set up. Scheduled reminders
(each sent once):

- not checked in an hour after office start (working days, not on leave);
- still checked in at 9 pm;
- overdue tasks (morning);
- timesheet not submitted (Friday 5 pm for the week, Monday 10 am for last week);
- approvals waiting (morning, to managers and approvers);
- birthdays and work anniversaries (to the team).

Timers left running are stopped after 10 hours so they can't inflate
timesheets.

## Scheduled jobs (server crontab)

Set `CRON_SECRET` in `.env.production.local` (`openssl rand -hex 24`), restart
pm2, then `crontab -e`:

```cron
# Reminders and clean-up (safe to run often)
*/15 * * * * curl -fsS "http://127.0.0.1:3000/api/cron/daily?key=YOUR_CRON_SECRET" >/dev/null
# Zoho CRM lead sync
*/5 * * * * curl -fsS "http://127.0.0.1:3000/api/cron/crm-sync?key=YOUR_CRON_SECRET" >/dev/null
# Nightly backup of the admin database and uploads (keeps 14)
30 2 * * * cd /home/ubuntu/setuware-technologies && npm run cms:backup >/dev/null 2>&1
```

For uptime monitoring use `https://setuware.in/api/health` (fast) and, every
few minutes, `https://setuware.in/api/health?deep=1` (also checks the
database).

## Roles and access

Team → **Roles & access** lists the roles. Everyone, whatever their role,
can use their own tasks, check in and out, and request leave.

| Role | For | Extra access |
| ---- | --- | ------------ |
| Owner | Founders | Everything |
| Sales Manager | Sales head | All leads and enquiries, assigning, bookings, subscribers, analytics, assigning tasks |
| Sales Executive | Sales team | Leads and enquiries assigned to them |
| Tech Lead / Project Manager | Engineering lead, PM | Assigns tasks, sees everyone's tasks and the timesheet, team attendance, reads client enquiries |
| Software Developer | Developers | Hands tasks to QA, designers or other developers |
| QA Tester | Testers | Files bugs as tasks for developers |
| UI/UX Designer | Designers | Hands tasks on; uploads images to the media library |
| Intern | Interns | Only their own tasks and attendance |
| HR | HR | Jobs, applications, team attendance, leave approvals, attendance settings |
| Content Editor | Marketing | Blog posts and media |

All roles except Owner can be edited, and you can create your own.

- Tick what each role may do per section: view, create, edit, publish, delete,
  assign, export, and so on.
- For leads, enquiries, applications and tasks choose **All records** or
  **Own records only** (only those assigned to the person).
- HR has "See team attendance" and "Approve leave, fix records, settings";
  Sales Manager and HR can assign tasks to others.
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
