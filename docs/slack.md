# Slack notifications

The site posts what happens on it to Slack, one channel per topic. Nothing is
sent until `SLACK_BOT_TOKEN` is set; a slow or failing Slack never fails a form
or an admin action.

| Channel (default) | Setting | What arrives |
|---|---|---|
| `#leads` | `SLACK_CHANNEL_LEADS` | Contact form, estimate requests (budget, estimate shown), consultation bookings (slot, mode), with "Open in admin" and WhatsApp buttons |
| `#hiring` | `SLACK_CHANNEL_HIRING` | Job applications (name, role, phone, links, note, "Review application"), a role opened or closed |
| `#team-ops` | `SLACK_CHANNEL_TEAM` | Leave and attendance-correction requests and decisions, team member added or removed |
| `#site-alerts` | `SLACK_CHANNEL_ALERTS` | Server errors, failed enquiry email / CRM delivery, failed HR email, Zoho CRM sync errors, deploy succeeded or failed |
| `#security` | `SLACK_CHANNEL_SECURITY` | Sign-in from a new device, account locked, password resets and changes, temporary passwords, 2-step verification turned off or reset, role changes, access disabled, accounts created or removed |
| `#marketing` | `SLACK_CHANNEL_MARKETING` | Newsletter sign-ups, blog post published |
| `#wins` | `SLACK_CHANNEL_WINS` | An enquiry or CRM lead marked as won (service and who closed it, no customer details) |
| `#announcements` | `SLACK_CHANNEL_ANNOUNCEMENTS` | "Please welcome …" for every team member added in the admin |
| same as `#team-ops` | `SLACK_CHANNEL_DIGEST` | Daily summary at 9:00 IST: yesterday's enquiries, bookings, applications, sign-ups, page views, attendance, and what is waiting (uncontacted enquiries, applications to review, pending approvals, overdue tasks, who is on leave) |

Each setting takes a channel ID (`C0123ABCD`) or name (`#leads`). Set it to
`off` to stop that channel. Alerts of the same kind are sent at most once every
15 minutes.

## Set up (about 5 minutes)

1. **Create the app.** Open <https://api.slack.com/apps?new_app=1>, choose
   **From a manifest**, pick the Setuware workspace, paste the manifest below
   and click **Create**.

   ```yaml
   display_information:
     name: Setuware Website
     description: Leads, applications, team and site alerts from setuware.in
     background_color: "#0b2a4a"
   features:
     bot_user:
       display_name: Setuware Website
       always_online: true
   oauth_config:
     scopes:
       bot:
         - chat:write
         - chat:write.public
         - channels:read
         - groups:read
         - channels:join
         - channels:manage
         - groups:write
         - pins:read
         - pins:write
         - users:read
         - users:read.email
         - im:write
   settings:
     org_deploy_enabled: false
     socket_mode_enabled: false
     token_rotation_enabled: false
   ```

2. **Install it.** In the app, open **Install App → Install to Workspace →
   Allow**, then copy the **Bot User OAuth Token** (`xoxb-…`).
3. **Create the channels** listed above. Make `#leads`, `#hiring` and
   `#security` **private**: their messages carry visitors' and applicants'
   contact details, so only people who would see them in the admin should be
   in them. A private channel needs the app invited: type
   `/invite @Setuware Website` in it. Public channels need no invite.
4. **Add the token on the server** (`/home/ubuntu/setuware-technologies`):

   ```bash
   echo 'SLACK_BOT_TOKEN=xoxb-…' >> .env.production.local
   npm run slack:test          # posts a test message to every channel
   pm2 restart setuware --update-env
   ```

5. **Channel setup is automatic.** Every deploy runs `npm run slack:setup`
   (also safe to run by hand): the bot joins each public channel, sets its
   topic and description, and pins a "How we use #channel" guide with the
   house rules. Edit the wording in `scripts/slack.mjs` (`GUIDES`).
6. **Daily summary:** it rides on the existing reminders cron
   (`/api/cron/daily`, every 15 minutes, see [admin.md](./admin.md)); nothing
   else to schedule.

Deploy messages come from `deploy/deploy-pm2.sh` via `scripts/slack.mjs`,
which reads the same `.env.production.local`.

## Code

- `src/lib/slack.ts`: channel settings, `chat.postMessage`, and the Block Kit card builder.
- `src/lib/slack-events.ts`: one function per event, and the daily summary.
- `src/instrumentation.ts`: server errors to `#site-alerts`.
- `src/lib/slack-onboarding.ts`: adds new Slack members to their channels.
- `scripts/slack.mjs`: `setup` (topics, pinned guides), `test`, `post`.

## New team members

1. In Slack, open **Invite people → Copy invite link** (set it to never
   expire) and add it on the server as `SLACK_INVITE_URL=…`.
2. Add the person in **Admin → People** as usual. The welcome email now
   includes the Slack link, and `#announcements` gets a "Please welcome …"
   post.
3. Once they join Slack with the same email, the cron (every 15 minutes)
   adds them to their channels and sends them a welcome DM:

   | Permission | Channels |
   |---|---|
   | everyone | team-ops, announcements, wins |
   | sees all enquiries or all CRM leads | leads |
   | sees all applications | hiring |
   | posts or subscribers | marketing |
   | settings, users or roles | site-alerts, security |

   Change the mapping in `src/lib/slack-onboarding.ts` (`channelsFor`).
   When someone's role changes, their access is disabled or the account is
   removed, the next run takes them out of the channels they no longer
   qualify for (only channels the bot added them to).
