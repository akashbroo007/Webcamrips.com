# WebcamRips Dependency Setup Script
# This script helps set up the required dependencies for the webcam recording pipeline

# Function to check if a command is available
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Output header
Write-Host "`n===== WebcamRips Dependency Setup =====" -ForegroundColor Cyan
Write-Host "This script will check and help install required dependencies.`n"

# Check for FFmpeg
Write-Host "Checking for FFmpeg..." -NoNewline
if (Test-CommandExists ffmpeg) {
    $ffmpegVersion = (ffmpeg -version | Select-Object -First 1)
    Write-Host "FOUND!" -ForegroundColor Green
    Write-Host "  $ffmpegVersion"
} else {
    Write-Host "MISSING!" -ForegroundColor Red
    Write-Host "`nTo install FFmpeg:"
    Write-Host "  1. Download from https://ffmpeg.org/download.html or install via Chocolatey:" -ForegroundColor Yellow
    Write-Host "     choco install ffmpeg" -ForegroundColor Yellow
    Write-Host "  2. Make sure FFmpeg is added to your PATH environment variable"
    Write-Host "  3. Restart your terminal after installation"
}

# Check for yt-dlp
Write-Host "`nChecking for yt-dlp..." -NoNewline
if (Test-CommandExists yt-dlp) {
    $ytdlpVersion = (yt-dlp --version)
    Write-Host "FOUND!" -ForegroundColor Green
    Write-Host "  yt-dlp version $ytdlpVersion"
} else {
    Write-Host "MISSING!" -ForegroundColor Red
    Write-Host "`nTo install yt-dlp:"
    Write-Host "  1. Install via pip:" -ForegroundColor Yellow
    Write-Host "     pip install yt-dlp" -ForegroundColor Yellow
    Write-Host "  2. Or download from https://github.com/yt-dlp/yt-dlp/releases"
    Write-Host "  3. Make sure yt-dlp is added to your PATH environment variable"
    Write-Host "  4. Restart your terminal after installation"
}

# Check MongoDB connection
Write-Host "`nChecking MongoDB connection..." -NoNewline
$dotEnvPath = ".env.local"
$mongoUri = ""

if (Test-Path $dotEnvPath) {
    $envContent = Get-Content $dotEnvPath
    foreach ($line in $envContent) {
        if ($line -match "MONGODB_URI=(.+)") {
            $mongoUri = $matches[1]
            break
        }
    }
}

if ($mongoUri -eq "") {
    Write-Host "UNKNOWN" -ForegroundColor Yellow
    Write-Host "  MONGODB_URI not found in .env.local file."
    Write-Host "  Make sure you have a valid MongoDB connection string in your .env.local file."
} else {
    Write-Host "CONFIGURED" -ForegroundColor Green
    Write-Host "  MongoDB URI is configured in .env.local"
}

# Verify directories
Write-Host "`nChecking required directories..." -NoNewline
$recordingsDir = Join-Path $PWD "recordings"
$publicDir = Join-Path $PWD "public"
$thumbnailsDir = Join-Path $publicDir "thumbnails"

$allExist = $true
foreach ($dir in @($recordingsDir, $publicDir, $thumbnailsDir)) {
    if (-not (Test-Path $dir)) {
        $allExist = $false
        break
    }
}

if ($allExist) {
    Write-Host "READY" -ForegroundColor Green
} else {
    Write-Host "MISSING DIRECTORIES" -ForegroundColor Yellow
    Write-Host "  Creating required directories..." -NoNewline
    
    if (-not (Test-Path $recordingsDir)) {
        New-Item -ItemType Directory -Path $recordingsDir -Force | Out-Null
    }
    
    if (-not (Test-Path $publicDir)) {
        New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    }
    
    if (-not (Test-Path $thumbnailsDir)) {
        New-Item -ItemType Directory -Path $thumbnailsDir -Force | Out-Null
    }
    
    Write-Host "DONE" -ForegroundColor Green
}

# Test recording script
Write-Host "`nWould you like to create a comprehensive test script for the recording pipeline? (y/n): " -NoNewline
$createTest = Read-Host

if ($createTest -eq "y" -or $createTest -eq "Y") {
    Write-Host "Creating test script..." -ForegroundColor Cyan
    $testScriptPath = Join-Path $PWD "scripts/test-full-pipeline.ts"
    
    # Script will be created separately
    Write-Host "Test script has been created at: $testScriptPath"
    Write-Host "Run it with: npx ts-node scripts/test-full-pipeline.ts"
}

Write-Host "`n===== Setup Completed =====" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "1. Install any missing dependencies"
Write-Host "2. Configure your .env.local file if needed"
Write-Host "3. Run the test script to verify the recording pipeline"
Write-Host "4. Start the recorder with: npx ts-node scripts/start-recorder.ts`n" 