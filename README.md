Deployed URL: 

**Tech Stack (Full-Stack + AI): Java 17 • Spring Boot • Spring Security (JWT RBAC) • Spring Data JPA/Hibernate • MySQL 8 • React (Vite) • Docker/Docker Compose • Python (TensorFlow) for AI/ML scoring**

# FedEx Phoenix | DCA Management (Digital + AI)

This project is a full-stack prototype that reimagines FedEx Debt Collection Agency (DCA) management with a centralized workflow, role-based portals, automated tracking, and AI-assisted prioritization.

It targets the key pain points of spreadsheet/email-driven operations by providing a single system for:
- Case ingestion, allocation, tracking, and reporting
- Clear role-based access (Admin / DCA Manager / DCA Agent)
- Audit and operational logging for governance
- AI “propensity to pay” scoring to support prioritization

## What’s implemented (mapped to the challenge)

### Centralized allocation, tracking, closure
- Debt case registry (invoice-centric)
- Assignment flows (manager-to-agent)
- Case progress captured via status and investigation stage/message
- Bulk operations (bulk assign, bulk status updates, bulk stage updates)

### SOP/workflow foundations
- Case status and investigation stage fields are implemented
- The UI guides evaluators through workflows per page

Note: Full SLA/SOP enforcement (timers, breach detection, escalations, approval gates) is not yet implemented.

### Real-time dashboards and analytics
- Admin analytics endpoints and UI pages for collections and agent performance
- Debt statistics (assigned vs unassigned, totals)

### Structured collaboration and accountability
- Agent message/notes per case (investigation record)
- Automatic backlog/action tracking via an AOP aspect for controller activity
- Audit log views for user/entity history

### AI/ML prioritization and recovery prediction
- Optional Python AI service integration
- Scheduled batch scoring of unscored cases (runs periodically)
- Manual “score this invoice” and batch scoring endpoints used by the UI

If the AI service is unavailable, the system remains usable; scoring is skipped gracefully.

## Architecture (high level)

- Frontend: React (Vite) single-page app in [frontend/](frontend/)
- Backend: Spring Boot (Java 17) REST API + JWT auth
- Database: MySQL 8
- AI service (optional): Python HTTP service at `http://localhost:8000` (predict + health)

In Docker, the frontend is built and packaged into the backend image and served as static assets by Spring Boot.

## Roles (demo accounts)

Sample data is automatically initialized on backend startup (safe to restart).

- FEDEX_ADMIN: `admin@fedex.local`
- DCA_MANAGER: `manager@dca.local`
- DCA_AGENT: `agent1@dca.local`
- DCA_AGENT: `agent2@dca.local`

Password for all sample users: `Password@123`

Sample invoice numbers: `INV-10001` … `INV-10005`

## How to run

### Option A: Docker Compose (recommended)

This starts MySQL + the Spring Boot app (serving the built frontend).

```bash
docker compose up --build
```

Then open:
- `http://localhost:8080`

### Option B: Local development

1) Start MySQL (or use Docker just for DB)

2) Run backend:
```bash
./mvnw spring-boot:run
```

3) Run frontend dev server:
```bash
cd frontend
npm install
npm run dev
```

## Configuration notes

- Database name used by default is `nexus_db` (see [docker-compose.yml](docker-compose.yml) and [src/main/resources/application.properties](src/main/resources/application.properties)).
- Mail settings exist for assignment notifications. For production, configure SMTP via environment variables/secrets (avoid committing real credentials).
- JWT signing keys are generated at runtime in this prototype.

## KPIs you can demonstrate with this app

- Assignment rate: % of cases assigned vs unassigned
- Recovery prioritization: average/median propensity score and top-priority cases
- Agent throughput: actions per agent, stage progression
- Governance: audit/backlog logs per module/action over time

## Known gaps (future enhancements)

- SLA timers, escalation workflows, and policy-driven SOP enforcement
- Richer collaboration (threads, attachments, internal/external notes)
- Stronger governance controls (approval chains, immutable case history)
- Production security hardening (secrets management, key rotation, PII redaction)