# Felix Bot Project Cleanup Script
Write-Host "Starting project cleanup..." -ForegroundColor Green

# Files to keep
$keepFiles = @(
    "README.md",
    "CHANGELOG.md", 
    "package.json",
    "vercel.json",
    ".env.example",
    ".env.local",
    ".gitignore",
    "cleanup.ps1"
)

# Delete all MD files except keep list
$allMdFiles = Get-ChildItem -Path "." -Filter "*.md" -File
$deletedCount = 0

foreach ($file in $allMdFiles) {
    if ($keepFiles -notcontains $file.Name) {
        Write-Host "Deleting: $($file.Name)" -ForegroundColor Yellow
        Remove-Item $file.FullName -Force
        $deletedCount++
    }
}

# Delete old miniapp versions
Write-Host "Cleaning miniapp folder..." -ForegroundColor Green
$miniappOldFiles = @(
    "miniapp/index-v2.html",
    "miniapp/index-v6.html",
    "miniapp/index-v6-enhanced.html",
    "miniapp/admin-new.html",
    "miniapp/academy.json",
    "miniapp/partners.json"
)

foreach ($file in $miniappOldFiles) {
    if (Test-Path $file) {
        Write-Host "Deleting: $file" -ForegroundColor Yellow
        Remove-Item $file -Force
        $deletedCount++
    }
}

# Delete txt files
$txtFiles = Get-ChildItem -Path "." -Filter "*.txt" -File
foreach ($file in $txtFiles) {
    Write-Host "Deleting: $($file.Name)" -ForegroundColor Yellow
    Remove-Item $file.FullName -Force
    $deletedCount++
}

# Rename final files
Write-Host "Renaming final files..." -ForegroundColor Green

if (Test-Path "README-FINAL.md") {
    if (Test-Path "README.md") { Remove-Item "README.md" -Force }
    Rename-Item "README-FINAL.md" "README.md"
    Write-Host "README.md updated" -ForegroundColor Green
}

if (Test-Path "CHANGELOG-FINAL.md") {
    if (Test-Path "CHANGELOG.md") { Remove-Item "CHANGELOG.md" -Force }
    Rename-Item "CHANGELOG-FINAL.md" "CHANGELOG.md"
    Write-Host "CHANGELOG.md updated" -ForegroundColor Green
}

Write-Host "Cleanup complete! Deleted $deletedCount files" -ForegroundColor Green
Write-Host "Next: git add . && git commit -m 'Clean up project' && git push" -ForegroundColor Cyan
