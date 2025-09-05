#!/bin/bash

echo "🚀 Starting Grammar Checker Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Check if user wants to reset database
read -p "🔄 Do you want to reset the database and re-seed? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing existing database volume..."
    docker volume rm cfo_postgres_data 2>/dev/null || true
    echo "✅ Database will be reset and seeded with fresh data."
else
    echo "📊 Using existing database (if available)."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d postgres

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Start seeding service
echo "🌱 Starting database seeding..."
docker-compose up --build db-seed

# Check if seeding was successful
if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
else
    echo "⚠️  Seeding may have failed or database already contains data."
fi

# Start remaining services
echo "🚀 Starting backend and frontend services..."
docker-compose up --build -d backend frontend

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📊 Services:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:3001"
echo "   • PostgreSQL: localhost:5432"
echo ""
echo "🔑 Demo Login Credentials:"
echo "   • Email: demo@demo.com"
echo "   • Password: demo123456"
echo ""
echo "📝 Other demo users:"
echo "   • Demo only user: demo@demo.com"
echo ""
echo "🛠️  Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Reset database: docker-compose down -v && ./dev-setup.sh"
echo "   • Re-seed only: docker-compose up db-seed"
echo "   • Start staging: ./staging-setup.sh"
echo ""
