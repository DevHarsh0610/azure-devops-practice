# Azure DevOps Pipeline - Task Manager

## 1. Project Overview
A production-grade Node.js backend application designed for task management, orchestrated using Azure DevOps pipelines. The project emphasizes a modular pipeline architecture, explicitly separating application CI/CD from database migrations to ensure robust and safe deployments across multiple environments.

## 2. Technical Stack
- **Runtime Environment:** Node.js (LTS version 24.x)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma (`@prisma/client` v5.x)
- **Validation:** Zod
- **Testing:** Jest + Supertest (Unit & Integration tests)
- **Logging:** Winston (with daily log rotation)
- **API Documentation:** Swagger UI Express / swagger-jsdoc
- **Security & Middleware:** Helmet, CORS, Express Rate Limit, bcryptjs, jsonwebtoken (JWT)
- **CI/CD:** Azure DevOps (YAML Pipelines)

## 3. Project Architecture & Directory Structure
- `backend/`: Contains the main application code, tests, and Prisma generation logic.
  - `src/`: Core backend logic partitioned into routes, controllers, services, middlewares, types, etc.
- `database/`: Dedicated directory for the Prisma schema (`schema.prisma`) defining data models and relationships.
- `pipelines/`: Contains Azure DevOps YAML pipeline definitions and modular templates.
  - `azure-pipelines.yml`: Main CI/CD orchestrator for the backend container application.
  - `database-pipeline.yml`: Dedicated pipeline for managing database migrations securely.
  - `templates/`: Modular YAML templates for reusable jobs (e.g., test validation, building images, deploying web apps, database migrations).

## 4. Application Functionality & Data Models
The system is built to handle user authorization and task assignment operations.

### Data Models
- **User**: Stores user attributes including email, password hash, role (`ADMIN`, `MANAGER`, `USER`), status, and timestamp records.
- **RefreshToken**: Manages secure session token generation, tracking, and revocation.
- **Task**: Tracks task data including title, description, status (`TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), due dates, assignee, and creator tracking.

### Exposed APIs
**Task Management (`/tasks`)**
- `GET /tasks`: List all tasks (with optional filtering)
- `POST /tasks`: Create a new task
- `GET /tasks/stats`: Retrieve aggregated task statistics
- `GET /tasks/:id`: Retrieve a specific task by ID
- `PATCH /tasks/:id`: Update an existing task
- `DELETE /tasks/:id`: Delete a task (soft/hard deletion support based on Prisma schema)

**Health Checks (`/health`)**
- `GET /health/`: Standard general health check endpoint
- `GET /health/database`: Verifies current database connectivity and status
- `GET /health/application`: Extensive application-level health and metrics

*(Note: While User/RefreshToken models exist in the DB schema, the explicit routing logic for authentication might be structured in future updates as they aren't currently bound in the primary API router endpoints listed in `app.ts`)*

## 5. CI/CD & DevOps Implementation
The DevOps strategy utilizes multi-stage YAML pipelines configured natively for Azure DevOps.

### Main Application Pipeline (`azure-pipelines.yml`)
Responsible for application integration, Dockerization, and deployment.
1. **CI Validation**: Runs on PR and pushes. Tests the codebase, checks Node.js LTS, and runs formatting validations.
2. **Build & Push**: Runs on `develop`, `release/*`, and `main` branches. Builds the Docker image and pushes it to a container registry (`dockerharsh10/devops-practice-backend`).
3. **Environment Deployments**: Sequential deployments targeting Azure Web App Containers using dynamic ADO Variable Groups (`backend-release-vars`):
   - **Develop** (from `develop` branch)
   - **QA & UAT** (from `release/*` branches)
   - **Staging, Production & DR** (from `main` branch)

### Database Pipeline (`database-pipeline.yml`)
A decoupled CI/CD flow that ensures database changes are applied safely without directly hooking into application pushes.
1. **Validation**: Validates Prisma schema on any PR or push affecting the `database/` or `backend/prisma/` directories.
2. **Migrate Dev**: Auto-applies schema migrations to the development database on `develop` branch merges.
3. **Migrate Prod**: Applies migrations to the production database on `main` branch merges. This stage explicitly incorporates an **approval gate** required in the Azure DevOps `db-production` Environment before execution.
