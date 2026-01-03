# PHOENIX | AI-Driven Debt Recovery Orchestration

**PHOENIX** is a high-performance, enterprise-grade debt management ecosystem designed to automate the lifecycle of overdue invoices. By bridging **FedEx Corporate**, **Debt Collection Agencies (DCA)**, and **Recovery Agents**, the platform replaces fragmented spreadsheets with a unified, AI-prioritized workflow.



## 🌟 Project Overview

### The Problem
Traditional debt recovery is hindered by manual assignments, a lack of transparency between agencies, and "blind" calling. FedEx needs a real-time method to track debt movement and prioritize which customers are actually likely to pay based on data.

### The Solution
The **PHOENIX** platform uses a **tri-portal architecture** linked by a shared MySQL database and a parallel Python AI engine.

* **Asynchronous AI Scoring:** A Java-based batch scheduler calls a Python ML service every 15 minutes to calculate "Propensity to Pay" scores without blocking the main thread.
* **Relational Integrity:** Foreign-key linked entities ensure a "Single Source of Truth" as cases move from FedEx → Agency → Agent.
* **Disposition State Machine:** A robust workflow tracking status transitions (e.g., `PENDING` to `PROMISE_TO_PAY`).
* **Automated Communication:** JavaMailSender integration for instant agent notification upon task assignment.

---

## 🏗️ Technical Architecture



### Tech Stack
* **Backend:** Java 17, Spring Boot, Spring Data JPA, Hibernate.
* **AI Service:** Python (Flask/FastAPI), Scikit-Learn.
* **Database:** MySQL 8.0 (Optimized with Foreign Key Indexes).
* **Messaging:** Spring Mail (SMTP).
* **Security:** JWT-based Role-Based Access Control (RBAC).

---

## 🛠️ Roles & Workflows

### 1. FedEx Manager
* **Bulk Ingestion:** Uploads debt CSVs into the system.
* **Strategic Allocation:** Assigns large debt pools to specific DCAs.
* **Monitoring:** Views recovery leaderboards to compare agency efficiency and total funds recovered.

### 2. DCA Manager
* **Workload Delegation:** Splits agency pools and assigns them to specific Agents via unique keys.
* **Settlement Approval:** Reviews and approves/rejects debt discount offers made by agents in real-time.
* **Performance Tracking:** Monitors agent-specific recovery rates and "Promise to Pay" success.

### 3. DCA Agent
* **Task Management:** Views a personalized workspace filtered by their unique Agent ID.
* **Action Logging:** Records call notes and updates case statuses during debtor interaction.
* **Disposition Updates:** Moves cases to `PROMISE_TO_PAY`, `DISPUTED`, or `SETTLED`.

---

## 🚀 Execution Flow

| Stage | Action | Process |
| :--- | :--- | :--- |
| **Ingestion** | FedEx uploads CSV | Java parses and saves to `debt_cases` table. |
| **Scoring** | AI Pulse (15 mins) | Java Scheduler sends batch to Python; updates `propensity_score`. |
| **Assignment** | Manager → Agent | `assigned_agent_id` is linked; email notification sent to agent via PHOENIX. |
| **Outreach** | Agent → Debtor | Agent logs call results and sets a "Promise to Pay" date. |
| **Resolution** | Recovery | Status updated to `SETTLED` and reflected on FedEx Dashboard. |



---

## 💻 Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/phoenix-recovery-portal.git](https://github.com/your-username/phoenix-recovery-portal.git)
    ```

2.  **Database Setup**
    * Create a MySQL database: `CREATE DATABASE phoenix_db;`
    * Update `src/main/resources/application.properties` with your credentials.

3.  **Run AI Service (Python)**
    ```bash
    cd ai-service
    pip install -r requirements.txt
    python app.py
    ```

4.  **Run Backend (Java)**
    ```bash
    mvn spring-boot:run
    ```

---

## 💡 Engineering Highlights
* **Parallelism:** The Python integration is decoupled; if the AI service goes down, the core PHOENIX recovery logic remains functional.
* **Scalability:** Batch processing reduces network overhead by grouping 100+ cases into a single HTTP request.
* **Clean Architecture:** Separated repositories for Manager and Agent roles ensure strict data privacy and efficient querying.