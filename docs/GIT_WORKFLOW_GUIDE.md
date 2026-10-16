# Guide: Updating the Remote GitHub Repository

Remote repo: `https://github.com/CRAJKUMARSINGH/Legal-Correspondence_Manager`

> **Environment:** Local Windows dev → GitHub → Netlify auto-deploy. Uses **npm** (not pnpm).

---

## First-Time Setup (do once)

### 1. Open a terminal in the project folder

Use PowerShell, VS Code terminal, or any shell, from the project root:
```
e:\Rajkumar\Legal-Correspondence_Manager
```

### 2. Configure your Git identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 3. Add the remote (if not already set)

```bash
git remote add origin https://github.com/CRAJKUMARSINGH/Legal-Correspondence_Manager.git
```

Check that it was added:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/CRAJKUMARSINGH/Legal-Correspondence_Manager.git (fetch)
origin  https://github.com/CRAJKUMARSINGH/Legal-Correspondence_Manager.git (push)
```

### 4. Authenticate with GitHub

GitHub no longer accepts passwords over HTTPS. Use a **Personal Access Token (PAT)**:

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name, set expiry, and check the **repo** scope
4. Copy the token — you won't see it again

When Git asks for your password during a push, **paste the token** instead of your password.

To avoid entering it every time, cache it:

```bash
git config --global credential.helper store
```

Then push once — Git will save the token for future use.

---

## Routine: Push Changes to GitHub

```bash
# 1. Check what has changed
git status

# 2. Stage specific files (preferred) or all changes
git add src/components/MyFile.tsx
# or: git add .

# 3. Commit with a meaningful message
git commit -m "feat: add print/PDF export and reply auto-fill"

# 4. Push to the main branch
git push origin main
```

---

## Sync Changes FROM GitHub (Pull)

If you or a collaborator made changes directly on GitHub:

```bash
git pull origin main
```

After pulling, restore dependencies if `package.json` or `package-lock.json` changed:

```bash
npm install
```

> **Note:** This project uses **npm** (not pnpm). There is no monorepo workspace and no database
> schema to push — all data is stored client-side in IndexedDB (no `DATABASE_URL` needed).

---

## Local Development

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build (tsc + vite build)
npm run preview    # preview the production build locally
```

---

## Common Scenarios

### Push a specific file only

```bash
git add src/components/CorrList.tsx
git commit -m "fix: auto-fill ref number from incoming despatch"
git push origin main
```

### Undo last commit (before pushing)

```bash
git reset --soft HEAD~1
```

### View commit history

```bash
git log --oneline -10
```

### Check which branch you are on

```bash
git branch
```

---

## Branch Workflow (for larger features)

```bash
# Create and switch to a new branch
git checkout -b feature/despatch-register

# Work and commit...
git add .
git commit -m "feat: despatch register"

# Push the branch to GitHub
git push -u origin feature/despatch-register

# Then open a Pull Request on GitHub to merge into main
```

---

## Netlify Deployment

Netlify is connected to the `main` branch and auto-deploys on every push.

Build settings (defined in `netlify.toml`):
- **Build command:** `npm run build`
- **Publish directory:** `dist`

No manual deploy step is needed — just push to `main`.

---

## Important Notes

- The `.gitignore` excludes `node_modules/`, `dist/`, `.env`, `.env.local`, `__pycache__/`, and Word temp files.
- There is **no** `DATABASE_URL` or backend database — all app data is stored in the user's browser IndexedDB.
- Never commit `.env` or `.env.local` files — API keys are entered by users at runtime in the Settings modal.
