# WebcamRips Pipeline Test Script
# This script guides you through testing the webcam recording pipeline

# Set encoding to UTF-8 for emoji support
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Function to show a fancy header
function Show-Header {
    param ([string]$Title)
    Write-Host "`n"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "`n"
}

# Function to show a section
function Show-Section {
    param ([string]$Title)
    Write-Host "`n🔹 $Title" -ForegroundColor Yellow
    Write-Host "  ──────────────────────────────────────" -ForegroundColor DarkGray
}

# Function to get user confirmation
function Get-UserConfirmation {
    param ([string]$Message, [switch]$DefaultYes)
    
    $prompt = "$Message [Y/n]: "
    if (-not $DefaultYes) {
        $prompt = "$Message [y/N]: "
    }
    
    Write-Host $prompt -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($DefaultYes) {
        return ($response -ne "n" -and $response -ne "N")
    } else {
        return ($response -eq "y" -or $response -eq "Y")
    }
}

# Main script
Show-Header "WebcamRips Recording Pipeline Test"

Write-Host "This script will help you test the webcam recording pipeline functionality."
Write-Host "The test is divided into steps to verify each component of the system."
Write-Host ""
Write-Host "Requirements:" -ForegroundColor Green
Write-Host "  1. FFmpeg installed and accessible from PATH"
Write-Host "  2. yt-dlp installed and accessible from PATH"
Write-Host "  3. MongoDB running if you want to test database features"
Write-Host "  4. Valid .env.local file with proper configuration"
Write-Host ""

# Step 1: Check dependencies
Show-Section "Dependency Check"

Write-Host "First, let's check if all required dependencies are installed."
if (Get-UserConfirmation "Run dependency check?" -DefaultYes) {
    & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\setup-dependencies.ps1"
}

# Step 2: Quick test
Show-Section "Quick Pipeline Test"

Write-Host "The quick test will perform a simple recording and processing without database."
Write-Host "This helps verify that the core pipeline components are working correctly."
if (Get-UserConfirmation "Run quick test (records 10 seconds of a public stream)?" -DefaultYes) {
    Write-Host "`nRunning quick test..." -ForegroundColor Cyan
    npx ts-node $PSScriptRoot\quick-test.ts
}

# Step 3: Full pipeline test
Show-Section "Full Pipeline Test"

Write-Host "The full pipeline test includes database integration and simulates the entire recording process."
Write-Host "This test will verify all components including stream detection, recording, processing, and database updates."
Write-Host "NOTE: This test requires MongoDB connection and proper environment configuration."

if (Get-UserConfirmation "Run full pipeline test?" -DefaultNo) {
    Write-Host "`nRunning full pipeline test..." -ForegroundColor Cyan
    npx ts-node $PSScriptRoot\test-full-pipeline.ts
}

# Step 4: Start actual recorder
Show-Section "Start Recording Service"

Write-Host "Finally, you can start the actual recording service to begin monitoring and recording streams."
if (Get-UserConfirmation "Start the recording service?" -DefaultNo) {
    Write-Host "`nStarting recording service..." -ForegroundColor Cyan
    npx ts-node $PSScriptRoot\start-recorder.ts
}

# Finish
Show-Header "Testing Complete"
Write-Host "Pipeline testing completed! You can now use the recording service to capture webcam streams."
Write-Host "If you encountered any issues, check the logs and ensure all dependencies are correctly installed."
Write-Host "`nHappy Recording! 🎥" -ForegroundColor Green
Write-Host "" 