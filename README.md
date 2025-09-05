# Grammar Checker

An intelligent grammar checking application built with React, Node.js, and LanguageTool API featuring real-time grammar analysis, user-friendly error highlighting, and usage analytics.

## 🚀 Features

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (Port 3000)
- **Backend**: Node.js + Fastify + Prisma + PostgreSQL (Port 3001)
- **Authentication**: JWT-based authentication with user sessions
- **Grammar Analysis**: Real-time grammar, spelling, and style checking
- **Error Highlighting**: Interactive text highlighting with click-to-fix suggestions
- **Usage Analytics**: Track grammar improvements and common error patterns
- **Export Reports**: Download detailed grammar analysis reports
- **Modern UI**: Clean, responsive design optimized for writing tasks

## 📁 Monorepo Structure

```
grammar-checker/ (root)
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── GrammarChecker.tsx
│   │   ├── api/
│   │   │   └── grammar.ts
│   │   ├── types/
│   │   │   └── grammar.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .gitignore
├── backend/           # Node.js + TypeScript API
│   ├── src/
│   │   ├── grammar/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── types/
│   │   ├── auth/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── models/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   └── .gitignore
├── docker-compose.grammar.yml  # Single environment setup
├── setup-grammar-checker.sh    # Quick setup script
├── .gitignore         # Root gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend (Port 3000)

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Icons** - Icon library

### Backend API (Node.js + TypeScript)

- **Node.js + TypeScript** - Runtime and type safety
- **Fastify** - Fast and efficient web framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure user authentication
- **LanguageTool API** - Grammar and spell checking service

### Grammar Analysis

- **LanguageTool** - Open-source grammar checking service
- **Real-time Analysis** - Instant feedback on text input
- **Multi-language Support** - Support for multiple languages
- **Usage Analytics** - Track user patterns and improvements

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** (for the easiest setup)
- **Node.js 20+** and **Yarn** (for local development only)

### Code Formatting

This project uses **Biome** for code formatting and linting. Biome is a fast formatter and linter that replaces both Prettier and ESLint.

**Available Commands:**

```bash
# Format all code
yarn format

# Check formatting without making changes
yarn format:check

# Fix linting issues
yarn lint:fix
```

**VS Code Setup:**

- Install the "Biome" extension
- Format on save is automatically enabled
- The project includes VS Code settings for optimal Biome integration

### Option 1: Docker Development (Recommended) 🐳

The easiest way to get started with a complete development environment including PostgreSQL database with seed data.

1. **Start Development Environment**:

   ```bash
   # Make sure Docker is running, then:
   ./dev.sh
   ```

   This will:

   - Start PostgreSQL database (no installation needed!)
   - Seed the database with demo data
   - Start backend and frontend services
   - Provide you with login credentials

### Database Configuration

The project supports different database configurations for each environment:

#### **Development (Local)**

- **Database**: Docker PostgreSQL container
- **Configuration**: `backend/.env.development`
- **Connection**: `postgresql://postgres:postgres123@localhost:5432/grammar_checker_dev`

#### **Staging (Render)**

- **Database**: Render managed PostgreSQL
- **Configuration**: `backend/.env.staging`
- **Connection**: `postgresql://username:password@host:port/database_name` (from Render)

#### **Production (Render)**

- **Database**: Render managed PostgreSQL
- **Configuration**: `backend/.env.production`
- **Connection**: `postgresql://username:password@host:port/database_name` (from Render)

**Environment Variables Required:**

```bash
# Required for all environments
DATABASE_URL="postgresql://username:password@host:port/database_name"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=3001
NODE_ENV=development|staging|production
CORS_ORIGIN="http://localhost:3000"
```

2. **Access the Application**:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432
   - **Demo Login**: `demo@demo.com` / `demo123456`

3. **Useful Commands**:

   ```bash
   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down

   # Reset database and re-seed
   docker-compose down -v && ./dev-setup.sh

   # Re-seed only (without reset)
   ./re-seed.sh

   # Start staging environment
   ./staging-setup.sh
   ```

### Option 2: Local Development

If you prefer to run services locally without Docker:

1. **Install PostgreSQL** (required for local development):

   ```bash
   # macOS (using Homebrew)
   brew install postgresql@15
   brew services start postgresql@15

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database and User**:

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE grammar_checker;
   CREATE USER grammar_checker_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE grammar_checker TO grammar_checker_user;
   \q
   ```

3. **Environment Variables**:

   **Backend** - Create a `.env` file in the `backend` directory:

   ```env
   DATABASE_URL="postgresql://grammar_checker_user:your_password@localhost:5432/grammar_checker"
   JWT_SECRET="your-super-secret-jwt-key"
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   PORT=3001
   NODE_ENV=development
   ```

   **Frontend** - Create a `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start Backend**:

   ```bash
   cd backend
   yarn install
   yarn prisma generate
   yarn prisma db push
   yarn db:seed
   yarn dev
   ```

5. **Start Frontend**:

   ```bash
   cd frontend
   yarn install
   yarn dev
   ```

6. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - **Demo Login**: `demo@demo.com` / `demo123456`

## 🌍 Environment Management

We provide a comprehensive environment management system for different deployment scenarios:

### Environment Files

- **Development**: `backend/.env.development` (Docker PostgreSQL)
- **Staging**: `backend/.env.staging` (Docker PostgreSQL)
- **Production**: `backend/.env.production` (External database)

### Environment Manager

Use our environment manager script to handle environment variables:

```bash
# Show current environment status
./env-manager.sh status

# Create environment files
./env-manager.sh create development
./env-manager.sh create staging
./env-manager.sh create production

# Edit environment files
./env-manager.sh edit development

# Validate environment files
./env-manager.sh validate production

# Setup all environments at once
./env-manager.sh setup-all

# Create frontend .env for local development
./env-manager.sh setup-frontend
```

### Staging Environment

To run a staging environment locally:

```bash
# Start staging environment
./staging-setup.sh
```

This will run on:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5433

## 👥 Demo Users

After seeding the database, you can login with these demo accounts:

### Demo Organization

- **User**: `demo@demo.com` / `demo123456`

### TechStartup Ltd

- **CEO**: `alex@techstartup.io` / `demo123456`
- **CFO**: `emma@techstartup.io` / `demo123456`

### Manufacturing GmbH

- **CFO**: `hans@manufacturing.de` / `demo123456`
- **Financial Analyst**: `petra@manufacturing.de` / `demo123456`

## 🔧 Configuration

### Database Management

```bash
# Generate Prisma client
yarn prisma generate

# Push schema changes
yarn prisma db push

# Seed database
yarn db:seed

# Reset database
yarn db:reset

# View database
yarn prisma studio
```

### Docker Commands

```bash
# Start development environment
./dev-setup.sh

# Start staging environment
./staging-setup.sh

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

## 📚 Documentation

- [Backend API Documentation](docs/backend-README.md)
- [Frontend Development Guide](docs/frontend-README.md)
- [API Migration Guide](docs/api-migration-plan.md)
