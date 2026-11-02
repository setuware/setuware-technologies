# Deploying on Oracle Cloud (Ubuntu)

Production runs on an Ubuntu VM in Oracle Cloud behind Cloudflare. Every push
to `main` triggers `.github/workflows/deploy.yml`, which connects over SSH and
runs `/home/ubuntu/deploy-setuware.sh`. The reference version of that script,
the systemd service, the nginx site and an example settings file are in
[`deploy/`](../deploy).

## 1. One-time server setup

```bash
# Node.js 22 LTS, nginx, certbot
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx git

# Small VMs (1–2 GB RAM) need swap for `next build`
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Open ports 80 and 443** in two places:

1. Oracle Console → Networking → Virtual cloud network → Security list →
   add ingress rules for TCP 80 and 443 from `0.0.0.0/0`.
2. On the VM (Oracle's Ubuntu images block them in iptables):

   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

**Settings file:**

```bash
sudo cp deploy/setuware.env.example /etc/setuware.env
sudo chown root:ubuntu /etc/setuware.env && sudo chmod 640 /etc/setuware.env
sudo nano /etc/setuware.env   # set NEXT_PUBLIC_SITE_URL=https://setuware.in and SMTP_*
```

**Service, deploy script and nginx:**

```bash
git clone https://github.com/setuware/setuware-technologies.git /tmp/setuware
sudo cp /tmp/setuware/deploy/setuware.service /etc/systemd/system/setuware.service
cp /tmp/setuware/deploy/deploy-setuware.sh /home/ubuntu/deploy-setuware.sh
chmod +x /home/ubuntu/deploy-setuware.sh
bash /home/ubuntu/deploy-setuware.sh          # first build
sudo systemctl daemon-reload && sudo systemctl enable --now setuware

sudo cp /tmp/setuware/deploy/nginx-setuware.conf /etc/nginx/sites-available/setuware
sudo ln -sf /etc/nginx/sites-available/setuware /etc/nginx/sites-enabled/setuware
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

**HTTPS:** if Cloudflare proxies the domain (orange cloud), set SSL/TLS mode to
**Full (strict)** and either install a Cloudflare Origin Certificate in nginx
or run `sudo certbot --nginx -d setuware.in -d www.setuware.in` (temporarily
switch the records to "DNS only" while Certbot runs).

## 2. GitHub Actions secrets

Repository → Settings → Secrets and variables → Actions:

| Secret | Value |
| --- | --- |
| `SERVER_HOST` | the VM's public IP |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | private key whose public key is in `/home/ubuntu/.ssh/authorized_keys` |

## 3. Everyday operations

| Task | Command |
| --- | --- |
| Live logs | `sudo journalctl -u setuware -f` |
| Restart | `sudo systemctl restart setuware` |
| Health | `curl -s http://127.0.0.1:3000/api/health` |
| Manual deploy | `bash /home/ubuntu/deploy-setuware.sh` |
| Roll back | `ln -sfn /home/ubuntu/setuware/releases/<old-sha> /home/ubuntu/setuware/current && sudo systemctl restart setuware` |

The deploy script builds each release in its own folder, switches only after a
successful build, checks `/api/health` and rolls back automatically if the new
release does not come up.

## 4. Enquiry delivery (important)

Contact-form, chatbot, pop-up and estimator enquiries are delivered only if a
channel is configured in `/etc/setuware.env`:

- **E-mail:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (an app
  password) and `LEAD_EMAIL_TO=sales@setuware.in`. Zoho Mail India uses
  `smtp.zoho.in:465`; Google Workspace uses `smtp.gmail.com:465`.
- **Webhook (optional):** `LEAD_WEBHOOK_URL` receives each enquiry as JSON.

Without either, enquiries are only written (redacted) to the server log. After
changing the file: `sudo systemctl restart setuware`.

## 5. Google search

`NEXT_PUBLIC_SITE_URL` must be `https://setuware.in`. It sets the canonical
URLs, the sitemap and the structured data; a wrong value tells Google the site
lives elsewhere. Because it is built into the site, redeploy after changing
it. Then follow [`docs/seo.md`](./seo.md) (Search Console, sitemap, Google
Business Profile).
