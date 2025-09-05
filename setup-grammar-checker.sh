#!/bin/bash

# Grammar Checker Setup Script
echo "🔧 Setting up Grammar Checker Application..."

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
cat > backend/.env << EOF
# Grammar Checker Backend Environment Variables
DATABASE_URL="postgresql://grammar_user:password@localhost:5432/grammar_checker"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
UPLOAD_MAX_FILE_SIZE=10485760
LANGUAGETOOL_API_URL="https://api.languagetool.org/v2/check"
EOF

# Frontend .env
cat > frontend/.env << EOF
# Grammar Checker Frontend Environment Variables
VITE_API_URL=http://localhost:3001
EOF

echo "✅ Environment files created"

# Install dependencies
echo "📦 Installing dependencies..."

# Backend dependencies
cd backend
echo "Installing backend dependencies..."
yarn install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
yarn prisma generate

# Frontend dependencies
cd ../frontend
echo "Installing frontend dependencies..."
yarn install

cd ..

echo ""
echo "🎉 Setup completed!"
echo ""
echo "🚀 To start the application:"
echo "1. Start the database (PostgreSQL required)"
echo "2. Run database migrations: cd backend && yarn prisma db push"
echo "3. Start backend: cd backend && yarn dev"
echo "4. Start frontend: cd frontend && yarn dev"
echo ""
echo "📖 Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - API Documentation: http://localhost:3001/documentation"
echo ""
echo "⚠️  Don't forget to:"
echo "   - Set up a PostgreSQL database"
echo "   - Change the JWT_SECRET in production"
echo "   - Update CORS_ORIGIN for production deployment"
