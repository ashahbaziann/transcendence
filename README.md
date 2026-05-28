*This project has been created as part of the 42 curriculum by ashahbaz, hakarape, mmosoyan, iserobya, gmelikya.*

---

# 🏓 Transcendence

A full-stack, real-time multiplayer Pong web application built as the final project of the 42 curriculum. Transcendence brings the classic Pong experience to the browser with modern features: user authentication, 2FA, OAuth, friend management, live WebSocket gameplay, game customization, and a full DevOps monitoring stack.

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Instructions](#instructions)
- [Individual Contributions](#individual-contributions)
- [Resources](#resources)

---

## Description

**Transcendence** is a browser-based real-time Pong game platform supporting multiple concurrent users. Players can register, authenticate securely (including via 42 OAuth and 2FA), manage their profiles, add friends, and challenge them to live Pong matches.

### Key Features

- Real-time multiplayer Pong over WebSockets
- Secure authentication with email/password, 42 OAuth, and optional 2FA (TOTP)
- Friend system with online/offline status
- Player profiles with avatars, match history, and win/loss stats
- Game customization: winning score, background themes, power-ups
- Microservices backend (auth, user, game services behind a gateway)
- Full monitoring stack with Prometheus and Grafana dashboards
- Health check system with automated status page
- Single-command Docker deployment

---

## Team Information

| 42 Login   | Role              | Responsibilities |
|------------|-------------------|-----------------|
| hakarape   | Product Owner     | Product vision, requirements, priorities, game engine (WebSocket server, game loop, power-ups, room management) |
| mmosoyan   | Project Manager   | Task distribution, sprint planning, team coordination, backend contributions |
| iserobya   | Tech Lead         | Architecture decisions, frontend (React pages, components, CSS modules, routing) |
| gmelikya   | Backend Developer | Auth service, user service, 2FA, OAuth, REST API design, Prisma ORM |
| ashahbaz   | DevOps            | Docker Compose, nginx reverse proxy, HTTPS/TLS, Prometheus, Grafana, healthcheck system |

---

## Project Management

### Work Organisation

The team followed an agile-style workflow with weekly sync meetings. Tasks were broken down by service/feature and assigned by role. The Tech Lead (iserobya) made architectural decisions; the Product Owner (hakarape) validated features against requirements; the Project Manager (mmosoyan) tracked progress and resolved blockers.

### Tools

- **Version control:** Git / GitHub — feature branches per developer, pull requests for review before merging to `main`
- **Communication:** Discord (daily async updates, voice calls for pair programming and reviews)
- **Task tracking:** GitHub Issues and a shared task board

---

## Technical Stack

### Frontend
- **React** (with React Router v6) — component-based SPA with protected routes
- **CSS Modules** — scoped styling per component, no global class conflicts
- **Vite** — fast dev server and build tooling

### Backend
- **Express.js** (Node.js) — REST API framework for auth-service and user-service
- **ws** (Node.js WebSocket library) — real-time game server in game-service
- **Passport.js** — OAuth 2.0 strategy for 42 intra authentication
- **Prisma ORM** — type-safe database access for auth-service; raw `pg` pool for user-service

### Database
- **PostgreSQL 15** — chosen for its reliability, strong ACID guarantees, and excellent support for relational data (users, friends, stats). Prisma ORM provides a clear schema definition and migration system.

### Infrastructure & DevOps
- **Docker & Docker Compose** — all services containerised, single-command startup
- **nginx** — reverse proxy, TLS termination (HTTPS on port 8443), routing to microservices
- **Prometheus** — metrics collection from all services via `/metrics` endpoints
- **Grafana** — dashboards for service health and performance visualisation
- **prom-client** (Node.js) — exposes Prometheus metrics from each service

### Why these choices?

- **Microservices** separate concerns clearly: auth, user management, and game logic can be developed, deployed, and scaled independently.
- **WebSockets** are the natural fit for real-time bidirectional game state synchronisation.
- **PostgreSQL** over NoSQL because our data is highly relational (users ↔ friends ↔ stats) and benefits from schema enforcement.
- **Prisma** reduces boilerplate and prevents SQL injection by design in the auth layer.
- **React** provides a component model well-suited to a multi-view SPA with protected routes and real-time UI updates.

---

## Database Schema

### Tables

#### `users` (user-service)
| Column       | Type        | Notes                          |
|--------------|-------------|-------------------------------|
| id           | SERIAL PK   | Internal row ID                |
| user_id      | INT UNIQUE  | Shared key across services     |
| username     | TEXT UNIQUE | Display name                   |
| email        | TEXT UNIQUE |                                |
| avatar       | TEXT        | URL or path to avatar image    |
| wins         | INT         | Default 0                      |
| losses       | INT         | Default 0                      |
| draws        | INT         | Default 0                      |
| online       | BOOLEAN     | Live presence status           |
| created_at   | TIMESTAMP   |                                |

#### `friends` (user-service)
| Column     | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | SERIAL PK |                              |
| user_id    | INT       | The user who added           |
| friend_id  | INT       | The user who was added       |
| created_at | TIMESTAMP |                              |
| —          | UNIQUE(user_id, friend_id) | Prevents duplicates |

#### `User` (auth-service — Prisma)
| Column       | Type    | Notes                        |
|--------------|---------|------------------------------|
| id           | Int PK  | Auto-increment               |
| email        | String  | Unique                       |
| username     | String  | Unique                       |
| password     | String? | Hashed (bcrypt), null for OAuth users |
| oauthId      | String? | 42 intra user ID             |
| createdAt    | DateTime|                              |

#### `TwoFactorSecret` (auth-service — Prisma)
| Column     | Type    | Notes                          |
|------------|---------|-------------------------------|
| id         | Int PK  |                               |
| userId     | Int FK  | → User.id, unique             |
| secret     | String  | TOTP secret (encrypted)       |
| isVerified | Boolean | True once user confirms setup |

### Relationships

```
User (auth-service)
  └── TwoFactorSecret (1:1)

users (user-service)
  └── friends (1:many, self-referential via user_id / friend_id)
```

> Note: `user_id` in user-service corresponds to `User.id` in auth-service, acting as the shared cross-service key. Services communicate via internal HTTP calls rather than shared database access.

---

## Features List

| Feature                          | Description                                                                 | Team Member(s)        |
|----------------------------------|-----------------------------------------------------------------------------|----------------------|
| User registration                | Email + password signup with validation                                     | gmelikya             |
| Email/password login             | JWT-based session, bcrypt hashed passwords                                  | gmelikya             |
| 42 OAuth login                   | Passport.js OAuth 2.0 flow via 42 intra API                                 | gmelikya             |
| Two-factor authentication (2FA)  | TOTP-based 2FA with QR code setup and login verification                    | gmelikya             |
| User profiles                    | Avatar upload, username display, win/loss/draw stats                        | gmelikya, iserobya   |
| Friend system                    | Add friends by username, view online/offline status, friend list            | gmelikya, iserobya   |
| Real-time multiplayer Pong       | WebSocket-based game with room matchmaking, roles, and live state sync      | hakarape             |
| Game customisation               | Winning score slider, background themes, power-ups toggle                   | hakarape, iserobya   |
| Power-ups                        | Speed boost, slow, and big paddle power-ups during gameplay                 | hakarape             |
| Local multiplayer                | Two players on the same keyboard                                             | hakarape, iserobya   |
| Friend vs friend mode            | Player 2 authenticates in-lobby before match starts                         | iserobya             |
| Game lobby UI                    | Mode selector, friend picker, customisation panel, start flow               | iserobya             |
| Microservices architecture       | Auth, user, and game as independent services behind a gateway               | ashahbaz, gmelikya   |
| nginx reverse proxy + HTTPS      | TLS termination, service routing via nginx on port 8443                     | ashahbaz             |
| Docker Compose deployment        | All services containerised, runs with a single command                      | ashahbaz             |
| Prometheus metrics               | Each service exposes `/metrics`; Prometheus scrapes and stores them         | ashahbaz             |
| Grafana dashboards               | Visual monitoring of service health and performance                         | ashahbaz             |
| Health check & status page       | Automated service health polling with a public status dashboard             | ashahbaz             |
| Privacy Policy & Terms of Service| Accessible legal pages linked from the application footer                  | iserobya             |

---

## Modules

| Module                                              | Type  | Points | Implemented by     |
|-----------------------------------------------------|-------|--------|--------------------|
| Use a framework for frontend and backend            | Major | 2      | iserobya, gmelikya |
| Real-time features with WebSockets                  | Major | 2      | hakarape           |
| Use an ORM for the database                         | Major | 2      | gmelikya           |
| Standard user management and authentication         | Major | 2      | gmelikya           |
| Remote authentication with OAuth 2.0 (42 intra)    | Major | 2      | gmelikya           |
| Two-Factor Authentication (2FA)                     | Major | 2      | gmelikya           |
| Web-based Pong game (remote players)                | Major | 2      | hakarape           |
| Backend as microservices                            | Major | 2      | ashahbaz, gmelikya |
| Health check, status page & disaster recovery       | Minor | 1      | ashahbaz           |
| Monitoring with Prometheus and Grafana              | Minor | 1      | ashahbaz           |
| Game customisation options                          | Minor | 1      | hakarape, iserobya |

**Total: 8 Major modules (16 pts) + 3 Minor modules (3 pts) = 19 points**

---

## Instructions

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed
- A 42 intra OAuth application configured (for OAuth login)
- Google Chrome (latest stable) for evaluation

### 1. Clone the repository

```bash
git clone https://github.com/ashahbaziann/transcendence.git
cd transcendence
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=transcendence

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin
GF_USERS_ALLOW_SIGN_UP=false
GF_SERVER_ROOT_URL=https://localhost:8443/grafana
GF_SERVER_SERVE_FROM_SUB_PATH=true
```

The auth-service also has its own `.env` at `backend/auth-service/.env` — see `backend/auth-service/.env.example` for required keys (42 OAuth client ID/secret, JWT secret, database URL).

### 3. Run the project

```bash
make
```

or equivalently:

```bash
docker compose up --build
```

### 4. Access the application

| Service        | URL                              |
|----------------|----------------------------------|
| Application    | https://localhost:8443           |
| Grafana        | https://localhost:8443/grafana   |
| Status page    | http://localhost:3007            |
| Prometheus     | http://localhost:9090            |

> **Note:** The app uses a self-signed TLS certificate. Your browser will show a security warning — click "Advanced" → "Proceed" to continue.

### 5. Stop the project

```bash
docker compose down
```

To also remove volumes (database data):

```bash
docker compose down -v
```

---

## Individual Contributions

### ashahbaz — DevOps
- Wrote and maintained the full `docker-compose.yml` for all services
- Configured nginx as a reverse proxy with TLS/HTTPS termination
- Set up Prometheus scraping configuration and alert rules
- Integrated Grafana with provisioned dashboards and datasources
- Built the healthcheck service-checker and status-page services
- Managed the Makefile for single-command builds

### hakarape — Product Owner & Game Engineer
- Defined product requirements and validated features
- Built the entire game-service: WebSocket server, room matchmaking, player role assignment
- Implemented the game loop, ball physics, paddle collision, and win detection
- Designed and implemented power-ups (speed, slow, big paddle)
- Handled player disconnection and room cleanup logic

### mmosoyan — Project Manager
- Coordinated task distribution and sprint planning across the team
- Managed communication between frontend and backend developers
- Tracked progress and facilitated resolution of blockers
- Contributed to backend development and testing

### iserobya — Tech Lead & Frontend
- Defined the overall system architecture and service boundaries
- Built all React pages: Landing, Home, Game, Profile, Callback, Privacy Policy, Terms
- Implemented React Router with protected routes and OAuth callback handling
- Built the Game Lobby UI: mode selector, friend picker, player 2 login flow, customisation panel
- Wrote all CSS Module stylesheets for a responsive, consistent UI
- Integrated frontend with all backend API endpoints

### gmelikya — Backend Developer
- Built the auth-service: registration, login, JWT issuance, logout
- Implemented Prisma schema and database migrations
- Integrated Passport.js for 42 OAuth 2.0 authentication
- Implemented the complete 2FA system: TOTP secret generation, QR code, verification, and login flow
- Built the user-service: profile management, avatar upload, stats, friend system, online status
- Secured all endpoints with JWT middleware

---

## Resources

### Documentation
- [React documentation](https://react.dev/)
- [React Router v6](https://reactrouter.com/en/main)
- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs)
- [ws — WebSocket library](https://github.com/websockets/ws)
- [Passport.js](https://www.passportjs.org/)
- [PostgreSQL 15 docs](https://www.postgresql.org/docs/15/)
- [Docker Compose](https://docs.docker.com/compose/)
- [nginx docs](https://nginx.org/en/docs/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)
- [TOTP / RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [42 OAuth API](https://api.intra.42.fr/apidoc)

### Articles & Tutorials
- [JWT best practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [WebSocket game architecture](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [Docker multi-service networking](https://docs.docker.com/network/)
- [Microservices with Node.js](https://nodejs.org/en/docs/guides)

### AI Usage

AI tools (Claude by Anthropic) were used during this project for the following tasks:

- **Debugging:** identifying root causes of WebSocket connection issues, JWT token mismatch errors, and nginx routing problems
- **Code review:** reviewing logic in the game loop and auth middleware for edge cases

All AI-generated code was reviewed, understood, and adapted by the relevant team member before being committed. No AI tool had direct access to the repository.