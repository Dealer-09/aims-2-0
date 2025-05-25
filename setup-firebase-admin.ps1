# Firebase Admin SDK Environment Setup Helper
# This is a helper script for development environments only

Write-Host "Firebase Admin SDK Environment Setup Helper"
Write-Host "============================================"
Write-Host "This script will help you set up the required environment variables for Firebase Admin SDK"
Write-Host "You'll need to have your Firebase service account credentials ready"
Write-Host ""

# Check if TypeScript is installed and compiled
if (-not (Test-Path "node_modules\.bin\ts-node.cmd")) {
    Write-Host "TypeScript environment not detected. Make sure you have run 'npm install'"
    $installDeps = Read-Host "Do you want to install dependencies now? (y/n)"
    if ($installDeps -eq "y") {
        Write-Host "Installing dependencies..."
        npm install
    } else {
        Write-Host "Aborted. Please run 'npm install' before using this script."
        exit 1
    }
}

# Check if .env.local exists
$envFile = ".env.local"
$envExists = Test-Path $envFile

if ($envExists) {
    Write-Host "Found existing .env.local file"
    $overwrite = Read-Host "Do you want to update Firebase Admin variables? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Aborted. No changes made."
        exit 0
    }
} else {
    Write-Host "Creating new .env.local file"
    New-Item -Path $envFile -ItemType File | Out-Null
}

# Get Firebase project ID
$projectId = Read-Host "Enter your Firebase project ID"
if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "Project ID cannot be empty. Aborting."
    exit 1
}

# Get client email
$clientEmail = Read-Host "Enter your Firebase client email (from service account)"
if ([string]::IsNullOrWhiteSpace($clientEmail)) {
    Write-Host "Client email cannot be empty. Aborting."
    exit 1
}

# Get private key
Write-Host "Enter your Firebase private key (from service account JSON)"
Write-Host "This should start with -----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----"
Write-Host "Important: Make sure to include the line breaks as they appear in the JSON file"
$privateKey = Read-Host

if ([string]::IsNullOrWhiteSpace($privateKey)) {
    Write-Host "Private key cannot be empty. Aborting."
    exit 1
}

# Optional: get admin email
$adminEmail = Read-Host "Enter admin email for notifications (optional)"

# Update .env.local
$envContent = Get-Content $envFile -ErrorAction SilentlyContinue
$newContent = @()

# Function to update environment variable
function Update-EnvVar {
    param(
        $content,
        $varName,
        $varValue
    )
    
    $varLine = "$varName=$varValue"
    $foundIndex = -1
    $i = 0
    
    # Find the existing line index if it exists
    foreach ($line in $content) {
        if ($line -match "^$varName=") {
            $foundIndex = $i
            break
        }
        $i++
    }
    
    if ($foundIndex -ne -1) {
        $content[$foundIndex] = $varLine
    } else {
        $content += $varLine
    }
    
    return $content
}

# Update each variable
$newContent = Update-EnvVar -content $envContent -varName "NEXT_PUBLIC_FIREBASE_PROJECT_ID" -varValue $projectId
$newContent = Update-EnvVar -content $newContent -varName "FIREBASE_CLIENT_EMAIL" -varValue $clientEmail

# Private key needs special handling for quotes and line breaks
$privateKeyValue = "`"$($privateKey -replace '\\n', '\n')`""
$newContent = Update-EnvVar -content $newContent -varName "FIREBASE_PRIVATE_KEY" -varValue $privateKeyValue

if (-not [string]::IsNullOrWhiteSpace($adminEmail)) {
    $newContent = Update-EnvVar -content $newContent -varName "ADMIN_EMAIL" -varValue $adminEmail
}

# Write content back to file
Set-Content -Path $envFile -Value $newContent

Write-Host "Environment variables updated successfully!"
Write-Host "Running TypeScript diagnostic utility to validate..."
Write-Host ""

# Run environment check with TypeScript utility
try {
    # First attempt with ts-node for development environments
    if (Test-Path "node_modules\.bin\ts-node.cmd") {
        & node_modules\.bin\ts-node.cmd -e "const checkAdminEnv = require('./utils/check-admin-env').default; console.log('Environment Check Results:'); const results = checkAdminEnv(); console.log(JSON.stringify(results, null, 2));"
    } else {
        # Fallback to compiled JS if available
        if (Test-Path "utils\check-admin-env.js") {
            node -e "const checkAdminEnv = require('./utils/check-admin-env'); console.log('Environment Check Results:'); const results = checkAdminEnv(); console.log(JSON.stringify(results, null, 2));"
        } else {
            Write-Host "Could not find diagnostic utility. Please run 'npm run check-env' manually to validate configuration."
        }
    }
} catch {
    Write-Host "Error running diagnostic utility: $_"
    Write-Host "Please run 'npm run check-env' manually to validate configuration."
}

Write-Host ""
Write-Host "Setup complete. For deployment to Vercel, remember to add these environment variables in the Vercel dashboard."
Write-Host "Make sure to set FIREBASE_PRIVATE_KEY as 'plain text with newlines' in Vercel."
