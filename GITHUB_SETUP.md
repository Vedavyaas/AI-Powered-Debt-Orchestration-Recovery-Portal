# GitHub Repository Setup Guide

This guide will help you prepare and push this project to GitHub.

## Pre-Push Checklist

### ✅ Completed Tasks

1. **Removed sensitive data**:
   - Email credentials moved to environment variables
   - Database passwords use defaults (override with env vars)
   - No hardcoded secrets in code

2. **Updated configuration files**:
   - `application.properties` uses environment variables
   - `docker-compose.yml` supports `.env` file
   - Created `.env.example` template

3. **Cleaned up files**:
   - Removed test files (`test_service.py`, `test_curl.sh`)
   - Updated `.gitignore` to exclude:
     - Python model files (`*.h5`, `*.pkl`)
     - Environment files (`.env`, `.env.local`)
     - Log files
     - Build artifacts
     - IDE files

4. **Documentation**:
   - Updated README with comprehensive setup instructions
   - Added Python AI service documentation
   - Included email configuration guide

## Steps to Push to GitHub

### 1. Verify .gitignore

Check that sensitive files are ignored:
```bash
git status
```

You should NOT see:
- `.env` files
- `python-service/models/*.h5` or `*.pkl`
- `*.log` files
- IDE configuration files

### 2. Create .env File (Local Only)

Create a `.env` file from the template:
```bash
cp .env.example .env
```

**⚠️ IMPORTANT**: The `.env` file is gitignored and will NOT be committed. Each developer/user must create their own.

### 3. Stage Changes

```bash
git add .
```

### 4. Review Changes

```bash
git status
git diff --cached
```

Verify:
- No sensitive data is being committed
- Only necessary files are staged
- Test files are removed

### 5. Commit

```bash
git commit -m "feat: Add Python AI service integration and production-ready configuration

- Add TensorFlow-based Python AI service for debt propensity scoring
- Update configuration to use environment variables for sensitive data
- Add comprehensive setup documentation
- Remove test files and update .gitignore
- Add .env.example template for configuration"
```

### 6. Create GitHub Repository

1. Go to GitHub and create a new repository
2. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 7. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 8. Add Repository Secrets (Optional - for CI/CD)

If you plan to use GitHub Actions or other CI/CD:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `SPRING_MAIL_USERNAME`
   - `SPRING_MAIL_PASSWORD`
   - `SPRING_DATASOURCE_PASSWORD` (if different from default)

## Post-Push Tasks

### Update README

If you have a deployed URL, update the first line of README.md:
```markdown
Deployed URL: https://your-deployed-url.com
```

### Add License

If you want to add a license:
```bash
# Choose appropriate license (MIT, Apache 2.0, etc.)
# Add LICENSE file
```

### Add GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run tests
        run: ./mvnw test
```

## Security Reminders

- ✅ Never commit `.env` files
- ✅ Never commit model files (they can be large and may contain training data)
- ✅ Never commit credentials or API keys
- ✅ Use GitHub Secrets for CI/CD
- ✅ Review all commits before pushing
- ✅ Use `.env.example` as a template only (no real values)

## Troubleshooting

### "Large files" error

If you get errors about large files:
```bash
# Check for large files
find . -type f -size +50M -not -path "./.git/*"

# If model files are tracked, remove them
git rm --cached python-service/models/*.h5
git rm --cached python-service/models/*.pkl
```

### "Sensitive data" warnings

GitHub may warn about potential secrets. If you see warnings:
1. Review the flagged content
2. If it's a false positive, you can ignore it
3. If real secrets were committed, rotate them immediately

## Next Steps

1. ✅ Push to GitHub
2. ✅ Add collaborators (if needed)
3. ✅ Set up branch protection rules
4. ✅ Configure GitHub Actions (optional)
5. ✅ Add project description and topics
6. ✅ Create initial release/tag

