**Tech Stack (Full-Stack + AI): Java 17 • Spring Boot • Spring Security (JWT RBAC) • Spring Data JPA/Hibernate • MySQL 8 • React (Vite) • Docker/Docker Compose • Python (TensorFlow) for AI/ML scoring**

# FedEx Phoenix | DCA Management (Digital + AI)

This project is a full-stack prototype that reimagines FedEx Debt Collection Agency (DCA) management with a centralized workflow, role-based portals, automated tracking, and AI-assisted prioritization.

It targets the key pain points of spreadsheet/email-driven operations by providing a single system for:
- Case ingestion, allocation, tracking, and reporting
- Clear role-based access (Admin / DCA Manager / DCA Agent)
- Audit and operational logging for governance
- AI "propensity to pay" scoring to support prioritization

## What's implemented (mapped to the challenge)

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
- **Python AI service** with TensorFlow-based neural network for propensity scoring
- Scheduled batch scoring of unscored cases (runs every 90 seconds)
- Manual "score this invoice" and batch scoring endpoints used by the UI
- Automatic model training and fallback to default model if no trained model exists

If the AI service is unavailable, the system remains usable; scoring is skipped gracefully.

## Architecture (high level)

- **Frontend**: React (Vite) single-page app in [frontend/](frontend/)
- **Backend**: Spring Boot (Java 17) REST API + JWT auth
- **Database**: MySQL 8
- **AI service**: Python HTTP service with TensorFlow (Flask + Gunicorn) at `http://localhost:8000` (predict + health endpoints)

In Docker, the frontend is built and packaged into the backend image and served as static assets by Spring Boot. The Python AI service runs as a separate container.

The Python AI service image uses a multi-stage build (wheels built in a builder stage, installed into a slim runtime stage) for faster rebuilds and a smaller runtime image.

## Roles (demo accounts)

Sample data is automatically initialized on backend startup (safe to restart).

- **FEDEX_ADMIN**: `admin@fedex.local`
- **DCA_MANAGER**: `manager@dca.local`
- **DCA_AGENT**: `agent1@dca.local`
- **DCA_AGENT**: `agent2@dca.local`

**Password for all sample users**: `Password@123`

Sample invoice numbers: `INV-10001` … `INV-10005`

## Prerequisites

- Docker and Docker Compose installed
- For local development: Java 17, Maven, Node.js 18+, Python 3.11+

## Development note (mail)

For **testing/development purposes**, the **mail service is suspended/disabled** in this repo.

### Database Configuration

Default database settings:
- Database: `nexus_db`
- Username: `root`
- Password: `password`

Override with environment variables:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Python AI Service Configuration

The Python AI service URL is automatically configured in Docker. For local development, set:
- `PYTHON_AI_URL=http://localhost:8000` (default)

## How to run

### Option A: Docker Compose (Recommended)

This starts MySQL, Python AI service, and the Spring Boot app (serving the built frontend).

0. **Install Docker and run Docker Desktop** (ensure Docker is running)

1. **Start all services**:
```bash
docker compose up --build
```

2. **Access the application**:
   - Open `http://localhost:8080` in your browser
   - Login with demo credentials (see Roles section)

**Services**:
- Application: `http://localhost:8080`
- Python AI Service: `http://localhost:8000`
- MySQL: `localhost:3306`

### Option B: Local Development

#### 1. Start MySQL

Using Docker:
```bash
docker run -d --name mysql-dev -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=nexus_db -p 3306:3306 mysql:8.0
```

Or use your local MySQL instance.

#### 2. Start Python AI Service

```bash
cd python-service
pip install -r requirements.txt

# Train model (optional - service will create default model if none exists)
python train_model.py

# Start service
python app.py
# Or with gunicorn: gunicorn --bind 0.0.0.0:8000 app:app
```

#### 3. Start Backend
Run:
```bash
./mvnw spring-boot:run
```

#### 4. Start Frontend (Development Server)

```bash
cd frontend
npm install
npm run dev
```

Access at `http://localhost:5173` (or the port shown in terminal)

## Python AI Service

The Python AI service provides machine learning-based propensity scoring for debt cases.

### Features

- **TensorFlow Neural Network**: Predicts debt collection propensity (0-1 score)
- **Automatic Model Training**: Trains on synthetic data if no model exists
- **REST API**: `/predict` and `/health` endpoints
- **Batch Processing**: Handles single or multiple cases per request

### Model Training

To train a custom model:

```bash
cd python-service
python train_model.py
```

This generates:
- `models/propensity_model.h5` - Trained TensorFlow model
- `models/preprocessor.pkl` - Feature preprocessor

**Note**: Replace synthetic data generation in `train_model.py` with real historical data for production use.

### API Endpoints

- `GET /health` - Health check
- `POST /predict` - Score debt cases

See [python-service/README.md](python-service/README.md) for detailed API documentation.

## Project Structure

```
.
├── frontend/              # React frontend application
├── src/                   # Spring Boot backend
│   ├── main/java/        # Java source code
│   └── main/resources/   # Configuration files
├── python-service/       # Python AI service
│   ├── app.py           # Flask API service
│   ├── train_model.py   # Model training script
│   └── models/          # Trained models (gitignored)
├── docker-compose.yml    # Docker services configuration
└── Dockerfile           # Main application Dockerfile
```

## KPIs you can demonstrate with this app

- Assignment rate: % of cases assigned vs unassigned
- Recovery prioritization: average/median propensity score and top-priority cases
- Agent throughput: actions per agent, stage progression
- Governance: audit/backlog logs per module/action over time

## Troubleshooting

### Email not sending

- In this repo’s current dev/testing setup, **mail is intentionally disabled**.

### Python AI service not responding

- Check if service is running: `curl http://localhost:8000/health`
- View logs: `docker compose logs python-ai`
- Service will create a default model if no trained model exists

### Database connection issues

- Ensure MySQL is running and accessible
- Check database credentials in environment variables
- Verify network connectivity between containers

## Known gaps (future enhancements)

- SLA timers, escalation workflows, and policy-driven SOP enforcement
- Richer collaboration (threads, attachments, internal/external notes)
- Stronger governance controls (approval chains, immutable case history)
- Production security hardening (secrets management, key rotation, PII redaction)
- Real-time model retraining with production data