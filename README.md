# Full-Stack Microservice System: Ticketing App

This project is a complete full-stack application built from scratch to demonstrate a **microservice architecture**. The system includes five main components: three independent backend services (Authentication, CRUD, and Logging), a central API Gateway to manage requests, and a React frontend client.

## 🏛️ Architecture

The client (React) communicates **only** with the API Gateway. The Gateway is responsible for authenticating requests (using JWT) and routing them to the appropriate downstream service. Services can also communicate with each other internally.

Each service is fully decoupled and maintains its own dedicated PostgreSQL database.

---

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React.js, React Router, Axios, Bootstrap |
| **Backend** | Node.js, Express.js |
| **Databases** | PostgreSQL (x3 separate instances) |
| **Architecture** | Microservices, API Gateway (`express-http-proxy`) |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` for hashing |
| **Communication** | REST API (HTTP) |

---

## ✨ Features

* **User Authentication:** Secure user registration and login.
* **JWT-Based Security:** All protected endpoints are secured using JWTs, verified at the API Gateway.
* **Centralized Routing:** A single API Gateway (`:3000`) acts as the entry point for all client requests.
* **Full CRUD Functionality:** Authenticated users can Create, Read, Update, and Delete their own "Tickets".
* **Decoupled Services:** Three distinct microservices, each with its own responsibilities and database:
    * **Auth Service (`:3001`):** Manages user accounts and issues tokens.
    * **CRUD Service (`:3002`):** Manages all ticket-related operations.
    * **Log Service (`:3003`):** Receives and stores logs from other services (e.g., "User X created ticket Y").
* **System Log Viewer:** A dedicated page in the frontend for authenticated users to view system-wide logs.

---

## 🛠️ Getting Started

Follow these instructions to get the complete system up and running on your local machine.

### 📜 **Prerequisites**
* **Node.js** (v18.0.0 or higher)
* **PostgreSQL:** A running instance. You must have privileges to create new databases.

### 🔗 Clone the Repository

```bash
git clone https://github.com/GxbrielZ/microservice-ticketing-system.git
cd microservice-ticketing-system
```

### 🗃️ Database Setup

You must create three separate databases in PostgreSQL: `auth_db`, `crud_db`, `log_db`.
After creating the databases, run the following SQL scripts to create the required tables.

`auth_db:`

```
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
```

`crud_db:`

```
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Nowe',
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

`log_db:`

```
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    level VARCHAR(20) NOT NULL,
    service VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    context JSONB
);
```

### 🔧 Backend Configuration

You must configure and run all four backend services. For each of the four backend folders: `api-gateway`, `auth-service`, `crud-service`, `log-service`:

**1. Navigate into the directory (e.g.** ```cd auth-service```**)**

**2. Install dependencies:** ```npm install```

**3. Create a** ```.env``` **file. You can copy the** ```.env.example``` **file:** ```cp .env.example .env```

**4. Edit the** ```.env``` **file and fill in your details:** Your PostgreSQL credentials (USER, PASSWORD, HOST, PORT) and secure, random ```JWT_SECRET```. This secret must be identical in ```auth-service``` and ```api-gateway```

### 🎨 Frontend Configuration
**1. Navigate into the client directory:** ```cd client```

**2. Install dependencies:** ```npm install```

### ▶️ Running the Application

You must have five separate terminals open to run the entire system.

**Terminal 1 (API Gateway):**

```
cd api-gateway
node index.js
```

**Terminal 2 (Auth Service):**

```
cd auth-service
node index.js
```

**Terminal 3 (CRUD Service):**

```
cd crud-service
node index.js
```

**Terminal 4 (Log Service):**

```
cd log-service
node index.js
```

**Terminal 5 (React Client):**

```
cd client
npm start
```

You can now access the application in your browser