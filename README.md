# VectorMindAi

Static site for VectorMind AI — a small static landing page.

- Repo: https://github.com/josephbickley33-web/VectorMindAi

Live deploy options
- Vercel: import this repository in your Vercel dashboard (Project → Import Git Repository). After import the site will get a Vercel subdomain. `vercel.json` is included to help Vercel detect the static site.
- GitHub Pages: this repo contains a GitHub Actions workflow that will publish the `main` branch to GitHub Pages automatically. The pages URL will be:

  https://josephbickley33-web.github.io/VectorMindAi

Quick local commands
```bash
npm install
npm start   # serves at http://localhost:8080
``` 

If you want me to connect and configure the Vercel project or add a custom domain, tell me the domain name and whether you want me to add DNS instructions to this README.

Vercel — connect & custom domain
---------------------------------

1. Import repository to Vercel
   - Go to https://vercel.com/import and sign in with GitHub.
   - Select `josephbickley33-web/VectorMindAi` and import the project.
   - Framework: **None**, Root: `./`. The provided `vercel.json` will make this a static site.

2. Custom domain (optional)
   - In your Vercel project, go to Settings → Domains → Add.
   - Enter your domain (e.g. vectormindai.com) and follow the prompts.
   - Update DNS at your registrar:
     - For apex/root domains (example.com): add two A records pointing to Vercel's IPs (as shown in Vercel UI).
     - For subdomains (www.example.com): add a CNAME to cname.vercel-dns.com (Vercel will show exact values).
   - Once DNS propagates, Vercel will provision HTTPS automatically.

3. If you want me to finish the Vercel import for you
   - I cannot access your Vercel account without credentials. If you'd like, either:
     - Invite my Vercel account/email to your Vercel team and tell me the project name, or
     - Complete the import yourself and send me the Vercel project URL; I can verify settings and add README DNS instructions.

GitHub Pages (optional backup)
------------------------------

- The repo includes a GitHub Actions workflow (`.github/workflows/pages.yml`) that will publish the repository root on pushes to `main`.
- Enable Pages in the repository Settings → Pages if you prefer to manage Pages settings manually.

Status & verification
---------------------
- After you import to Vercel, share the Vercel project URL and I will verify the deployment and HTTPS.
- After Pages workflow runs, the site will be available at:

  https://josephbickley33-web.github.io/VectorMindAi

