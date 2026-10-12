# Contributing to SkyShield AI (VarshDristhi)

Thank you for your interest in contributing to **SkyShield AI**! We welcome contributions from developers, meteorologists, data scientists, and disaster response specialists.

---

## Code of Conduct

Please treat everyone with respect and kindness. We are committed to providing a welcoming, inclusive, and harassment-free environment for all participants.

---

## Getting Started

### 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or 20.x LTS
- **Git**
- Optional: **Docker & Docker Compose** (for containerized PostgreSQL + PostGIS testing)

### 2. Fork and Clone
```bash
git clone https://github.com/<your-username>/SkyShield-AI.git
cd SkyShield-AI
```

### 3. Setup Backend
```bash
cd backend
python -m venv .venv

# On Linux/macOS:
source .venv/bin/activate
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env
python -m alembic upgrade head
python -m app.seed
```

### 4. Setup Frontend
```bash
# In the repository root
npm install
cp .env.example .env
npm run dev
```

---

## Development Workflow

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Commit Style**:
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add Doppler radar color ramp customization`
   - `fix: resolve polygon coordinate reversal in risk zone ingestion`
   - `docs: update deployment guidelines for AWS ECS`
   - `test: add unit tests for convective cloudburst calculation`

3. **Running Backend Tests**:
   Always verify tests before opening a pull request:
   ```bash
   cd backend
   python -m pytest -v
   ```

4. **Running Frontend Build & Lint**:
   ```bash
   npm run build
   ```

---

## Submitting a Pull Request (PR)

1. Ensure all tests pass.
2. Push your feature branch to your fork.
3. Open a Pull Request against the `main` branch.
4. Describe your changes clearly using the PR template.
5. Link any related issues (`Fixes #12`).

---

## Reporting Bugs and Feature Requests

- Use GitHub Issues to submit bug reports and feature requests.
- Provide minimal reproduction steps and error logs where applicable.
