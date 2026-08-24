# AI-Powered Debt Orchestration & Recovery Portal

A microservice platform that automates debt case intake, ML-driven scoring, and agent assignment so recovery teams can focus on collection rather than coordination.

---

## Overview

Debt recovery operations traditionally rely on manual triage: someone reads a case, picks an agent, and hopes they are a good fit. This platform removes that overhead. A manager enters a debt case (individually or via CSV upload), the system dispatches it through Kafka, the ML service scores it against a trained neural network and queries a local LLM for an agent performance score, and the Assignment service automatically selects and assigns the best available agent. Managers and agents interact through role-separated dashboards; the system handles the rest.

---

## Features

- JWT-based authentication with three roles: `ADMIN`, `MANAGER`, `AGENT`
- Role-scoped dashboards: Admin manages users, Manager manages debt cases, Agent handles assigned cases
- Debt case creation, individual or bulk CSV ingestion
- Customer record management (create, update, paginate)
- Kafka event pipeline connecting all backend services
- Neural network inference (Deeplearning4j) scoring each debt case on recovery probability, trust score, and a "nice value" used for agent matching
- LLM-based agent performance scoring via Ollama (llama3.2:1b)
- Automatic agent assignment based on the ML-derived nice value
- Waiting queue for debt cases that arrive before any agent is registered
- Agent credit scoring engine that recalculates agent statistics on a schedule and sends them to the ML service for re-evaluation
- Debt status lifecycle management by agents
- Field notes recorded by agents on individual cases
- Manager override to reassign a debt to a different agent

---

## Architecture

The project is a Maven multi-module repo. Six Spring Boot services are independently runnable and communicate through a mix of REST (for client-facing operations) and Apache Kafka (for internal, asynchronous data flow). A Vite/React frontend talks exclusively to the Gateway.

### Services and their ports

| Service        | Port | Role |
|----------------|------|------|
| Discovery      | 8761 | Eureka server — all other services register here |
| Gateway        | 9000 | Single entry point; routes requests to downstream services via Eureka discovery |
| Authentication | 9001 | User management, JWT issuance |
| Orchestration  | 9002 | Debt and customer data management, triggers ML pipeline |
| Assignment     | 9003 | Agent assignment, debt case status, agent scoring |
| MLService      | 9004 | Neural network inference and LLM-based agent scoring |

### Request routing

All frontend traffic hits port 9000. The Gateway uses Eureka's service registry to forward requests to the correct downstream service by service name. It also handles CORS for the frontend origins (`localhost:5173`, `localhost:5174`).

### Kafka topics

Internal service communication happens exclusively over Kafka. No service calls another service directly over HTTP.

| Topic | Producer | Consumer | Purpose |
|---|---|---|---|
| `agent-topic` | Authentication | Assignment | Notify Assignment of a newly registered agent |
| `debt-topic` | Orchestration | Assignment | Notify Assignment of a new debt case |
| `debt-request-topic` | Orchestration | MLService | Send debt details for ML scoring |
| `debt-prediction-topic` | MLService | Assignment | Return ML scores for a debt case |
| `agent-prediction-topic` | Assignment | MLService | Send agent statistics for LLM scoring |
| `agent-score-topic` | MLService | Assignment | Return LLM-derived agent trust score and nice value |
| `debt-approval` | Orchestration | Assignment | Notify Assignment when a debt is closed or re-opened |

---

## Microservices

### Discovery
Netflix Eureka server. All services register here on startup; the Gateway uses it for routing. No business logic. Dashboard available at `localhost:8761`.

### Gateway
Spring Cloud Gateway (WebFlux) - the single entry point for all client traffic. Routes requests to downstream services via Eureka, handles CORS, and does not perform authentication itself.

### Authentication
Manages users, issues RSA-signed JWTs (BCrypt passwords), and publishes new agent names to Kafka so Assignment can register them. Three roles are supported - `ADMIN`, `MANAGER`, and `AGENT` - each with scoped access. A `DataSeeder` creates one user of each role on startup for development. Database: H2 in-memory (`auth_db`).

### Orchestration
Primary data intake service. Managers create and update customer records and debt cases, individually or via CSV bulk upload. On a 5-second schedule, new debts are published to Kafka for scoring. Closing or re-opening a debt sends a status event to Assignment. Database: H2 in-memory (`orc_db`). Debt statuses: `PENDING`, `ACTIVE`, `OVERDUE`, `IN_COLLECTION`, `PARTIALLY_SETTLED`, `SETTLED`, `CLOSED`.

### MLService
Kafka-only inference service - no REST endpoints. Scores incoming debt cases with a Deeplearning4j neural network (recovery probability, trust score, nice value) and scores agents using a local Ollama LLM (llama3.2:1b). Results are published back to Kafka. See the ML / AI section for model details.

### Assignment
Consumes all Kafka prediction events and drives the full assignment lifecycle: registers agents, assigns debts automatically by matching nice values, queues debts if no agents exist, updates agent scores from the LLM, and tracks case resolution times. Agents update status and add field notes; managers can override the assigned agent. Database: H2 in-memory (`assign_db`). Debt statuses: `PENDING`, `COMPLETED`, `APPROVED`.

---
## ML / AI

### Debt scoring
A 4-layer Deeplearning4j regression network (Adam, 2000 epochs, MSE loss) takes three inputs — `principalAmount`, `outstandingAmount`, and `daysDue` — and outputs `recoveryProbability` (0–1), `trustScore` (0–1), and `niceValue` (integer). Training data is a `sample.csv` on the classpath, 80/20 split, normalized with `NormalizerStandardize`. The trained model is saved to `models/loan-model.zip` and reloaded on subsequent startups. Inference is triggered by a Kafka message on `debt-request-topic`; results are published to `debt-prediction-topic`.

### Agent scoring
Agent performance statistics (cases pending/solved, success rate, average resolution time) are periodically computed by the Assignment service and sent via Kafka to the MLService, which forwards them to a local Ollama instance (llama3.2:1b via Spring AI). The LLM returns a `trust_score` and `nice_value` for each agent, which are applied to the agent's record and influence future debt assignments.

---

## Technology Stack

| Category | Technology |
|---|---|
| Language | Java 17 |
| Backend framework | Spring Boot 4.1.0 |
| Service discovery | Spring Cloud Netflix Eureka (2025.1.2) |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Authentication | Spring Security, OAuth2 Resource Server, RSA-signed JWT (Nimbus JOSE) |
| Messaging | Apache Kafka (Spring Kafka) |
| ML — neural network | Deeplearning4j 1.0.0-M2.1 (ND4J native) |
| ML — LLM | Spring AI 2.0.1, Ollama (llama3.2:1b) |
| CSV parsing | Apache Commons CSV 1.11.0 |
| Database | H2 in-memory (per service), Spring Data JPA |
| Frontend framework | React 19, Vite 8 |
| Frontend HTTP | Axios 1.19 |
| Build | Maven (multi-module) |

---

## Installation

### Prerequisites

- Java 17
- Maven 3.x
- Node.js 18+ and npm
- Apache Kafka running on `localhost:9092`
- Ollama running on `localhost:11434` with the `llama3.2:1b` model pulled

```bash
# Pull the Ollama model (first time only)
ollama pull llama3.2:1b
```

### Clone the repository

```bash
git clone <repo-url>
cd DCAManagement
```

### Build all backend services

```bash
mvn clean install -DskipTests
```

### Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Configuration

Each service reads its configuration from its own `application.properties`. The defaults work for local development. Key values to change for a non-local environment:

| Property | Default | Service |
|---|---|---|
| `eureka.client.service-url.defaultZone` | `http://localhost:8761/eureka` | All services |
| `spring.kafka.bootstrap-servers` | `localhost:9092` | Authentication, Orchestration, Assignment, MLService |
| `spring.ai.ollama.base-url` | `http://localhost:11434` | MLService |
| `spring.ai.ollama.chat.model` | `llama3.2:1b` | MLService |
| `spring.datasource.url` | `jdbc:h2:mem:<service>_db` | Authentication, Orchestration, Assignment |

> **Note:** The RSA key pair used for JWT signing is currently embedded as string constants in `Authentication/src/main/java/com/vedavyaas/authentication/config/JWTConfig.java`.

---

## Running the Project

Services must start in this order, as each later service depends on Eureka being available:

**1. Start Kafka** (if not already running)

```bash
# Example using a local Kafka install
bin/zookeeper-server-start.sh config/zookeeper.properties &
bin/kafka-server-start.sh config/server.properties &
```

**2. Start Ollama**

```bash
ollama serve
```

**3. Start Discovery (Eureka)**

```bash
cd Discovery
./mvnw spring-boot:run
```

**4. Start remaining backend services** (in any order after Discovery is up)

```bash
# Each in a separate terminal from its own directory
cd Gateway && ./mvnw spring-boot:run
cd Authentication && ./mvnw spring-boot:run
cd Orchestration && ./mvnw spring-boot:run
cd Assignment && ./mvnw spring-boot:run
cd MLService && ./mvnw spring-boot:run
```

**5. Start the frontend**

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173`. All API traffic goes through the Gateway at `http://localhost:9000`.

**Default development credentials** (seeded by `DataSeeder` on startup):

| Username | Password | Role |
|----------|----------|------|
| Admin | 123 | ADMIN |
| Manager | 123 | MANAGER |
| Agent | 123 | AGENT |

---

## Development

Each backend module is a standalone Spring Boot application. Run and debug any single service independently from IntelliJ IDEA or with `./mvnw spring-boot:run` from its directory.

The H2 console is enabled for all three data services at `/h2-console` on their respective ports, which is useful for inspecting in-memory state during development.

The frontend uses Vite's HMR for fast iteration. Update `frontend/src/services/` if the API base URL changes.

To retrain the neural network, delete `models/loan-model.zip` and restart the MLService. Training runs for 2000 epochs and saves the model automatically.

---

## Future Improvements

- Gather a larger, real-world labelled dataset for model training; the current `sample.csv` is synthetic and limits prediction accuracy
- Add caching (e.g. Redis) across services wherever redundant computation or repeated lookups are identified
- Replace in-memory H2 with a persistent database (PostgreSQL or MySQL) so data survives service restarts

---