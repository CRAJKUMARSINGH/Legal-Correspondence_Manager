# Guide: Updating the Remote GitHub Repository

Remote repo: `https://github.com/CRAJKUMARSINGH/Legal-Correspondence_Manager`

---

## First-Time Setup (do once)

### 1. Open the Replit Shell

In your Replit project, open the **Shell** tab at the bottom.

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

After making changes in Replit (the agent or you):

```bash
# 1. Check what has changed
git status

# 2. Stage all changes
git add .

# 3. Commit with a meaningful message
git commit -m "feat: add print/PDF export and reply auto-fill"

# 4. Push to the main branch
git push origin main
```

If your default branch is `master`:

```bash
git push origin master
```

---

## Sync Changes FROM GitHub to Replit (Pull)

If you or a collaborator made changes directly on GitHub:

```bash
git pull origin main
```

---

## Common Scenarios

### Push a specific file only

```bash
git add artifacts/legal-correspondence/src/pages/reply-letter.tsx
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
git push origin feature/despatch-register

# Then open a Pull Request on GitHub to merge into main
```

---

## Important Notes

- **Do not** run `pnpm dev` at the workspace root — use the Replit workflow buttons instead.
- The `DATABASE_URL` secret is Replit-only and is **not** pushed to GitHub — keep it in Replit Secrets.
- The `.gitignore` already excludes `node_modules/`, `dist/`, and `.env` files.
- After pulling changes from GitHub, run:
  ```bash
  pnpm install
  pnpm --filter @workspace/db run push
  ```
  to restore dependencies and apply any new DB schema changes.
