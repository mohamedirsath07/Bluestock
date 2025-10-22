# Bluestock Quick Start Script (Windows PowerShell)
# Run this script to install and start both backend and frontend

Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 Bluestock Setup & Start Script        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20.x LTS" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL 15" -ForegroundColor Red
    exit 1
}

# Install Backend Dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Check backend .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Backend .env not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "❗ Please edit backend/.env with your credentials before continuing!" -ForegroundColor Red
    Write-Host "Press Enter after editing .env file..."
    Read-Host
}

# Install Frontend Dependencies
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

# Check frontend .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Frontend .env not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
}

Set-Location ..

# Ask to run migration
Write-Host "`n🗄️  Database Setup" -ForegroundColor Yellow
$runMigration = Read-Host "Do you want to run database migration? (y/n)"
if ($runMigration -eq "y") {
    Write-Host "Running migration..." -ForegroundColor Yellow
    Set-Location backend
    npm run migrate
    Set-Location ..
    Write-Host "✅ Migration completed" -ForegroundColor Green
}

Write-Host "`n╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Setup Complete!                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Open a new terminal and run: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Open another terminal and run: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use the provided start scripts:" -ForegroundColor Cyan
Write-Host "- start-backend.ps1" -ForegroundColor White
Write-Host "- start-frontend.ps1" -ForegroundColor White
Write-Host ""

# Ask to start servers
$startNow = Read-Host "Do you want to start the servers now? (y/n)"
if ($startNow -eq "y") {
    Write-Host "`nStarting servers..." -ForegroundColor Yellow
    Write-Host "Backend will start in this window." -ForegroundColor Cyan
    Write-Host "Frontend will start in a new window." -ForegroundColor Cyan
    
    # Start frontend in new window
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    # Start backend in current window
    Set-Location backend
    npm run dev
}
