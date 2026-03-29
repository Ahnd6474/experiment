param(
    [string]$ConfigPath = "config/experiment.example.json",
    [string]$UpstreamUrl = "https://github.com/Ahnd6474/Jakal-flow.git",
    [string]$Branch = "main"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    Write-Host ("==> {0}" -f $Description)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw ("{0} failed with exit code {1}." -f $Description, $LASTEXITCODE)
    }
}

function Get-PythonVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    $output = & $Command --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to query Python version for '$Command'."
    }

    $text = ($output | Out-String).Trim()
    $match = [System.Text.RegularExpressions.Regex]::Match($text, "\d+(\.\d+)+")
    if (-not $match.Success) {
        throw "Unable to parse Python version from '$text'."
    }

    return [version]$match.Value
}

function Reset-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
}

$checkScriptPath = Join-Path $PSScriptRoot "check-prereqs.ps1"
& $checkScriptPath -ConfigPath $ConfigPath

$config = Read-ExperimentConfig -ConfigPath $ConfigPath
$paths = Get-ExperimentPaths -Config $config
$runtime = Get-ExperimentRuntimeDefaults -Config $config

$gitCommand = $config.prerequisites.git.command
$pythonCommand = if ($runtime.PSObject.Properties.Name.Contains("pythonCommand")) {
    $runtime.pythonCommand
}
else {
    $config.prerequisites.python.command
}

$checkoutPath = $paths.upstreamCheckout
$checkoutParent = Split-Path -Path $checkoutPath -Parent
$localRoot = $paths.localRoot
$logsRoot = $paths.logsRoot
$workspaceRoot = $paths.workspaceRoot
$venvPath = Resolve-ExperimentPath -Path $runtime.venvPath
$venvPython = Join-Path $venvPath "Scripts/python.exe"
$pipCachePath = Join-Path $localRoot "pip-cache"

foreach ($directory in @($localRoot, $checkoutParent, $logsRoot, $workspaceRoot, $pipCachePath)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

$checkoutGitDirectory = Join-Path $checkoutPath ".git"
if (-not (Test-Path -LiteralPath $checkoutPath)) {
    Invoke-ExternalCommand -Command $gitCommand -Arguments @("clone", "--branch", $Branch, "--single-branch", $UpstreamUrl, $checkoutPath) -Description "Clone upstream repository"
}
else {
    if (-not (Test-Path -LiteralPath $checkoutGitDirectory)) {
        Write-Warning "Existing upstream checkout is not a git repository. Recreating it."
        Reset-Directory -Path $checkoutPath
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("clone", "--branch", $Branch, "--single-branch", $UpstreamUrl, $checkoutPath) -Description "Clone upstream repository"
    }
    else {
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("-C", $checkoutPath, "remote", "set-url", "origin", $UpstreamUrl) -Description "Update upstream origin"
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("-C", $checkoutPath, "fetch", "--prune", "origin") -Description "Fetch upstream repository"
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("-C", $checkoutPath, "checkout", "-B", $Branch, "origin/$Branch") -Description "Align local branch with upstream"
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("-C", $checkoutPath, "reset", "--hard", "origin/$Branch") -Description "Reset checkout to upstream state"
        Invoke-ExternalCommand -Command $gitCommand -Arguments @("-C", $checkoutPath, "clean", "-fdx") -Description "Remove untracked upstream files"
    }
}

$basePythonVersion = Get-PythonVersion -Command $pythonCommand
$recreateVenv = -not (Test-Path -LiteralPath $venvPython)
if (-not $recreateVenv) {
    try {
        $venvPythonVersion = Get-PythonVersion -Command $venvPython
        if ($venvPythonVersion.Major -ne $basePythonVersion.Major -or $venvPythonVersion.Minor -ne $basePythonVersion.Minor) {
            $recreateVenv = $true
        }
    }
    catch {
        $recreateVenv = $true
    }
}

if ($recreateVenv) {
    Write-Host "Recreating repo-local virtual environment."
    Reset-Directory -Path $venvPath
    Invoke-ExternalCommand -Command $pythonCommand -Arguments @("-m", "venv", $venvPath) -Description "Create repo-local virtual environment"
}
else {
    Write-Host "Reusing existing repo-local virtual environment."
}

$env:PIP_CACHE_DIR = $pipCachePath
Invoke-ExternalCommand -Command $venvPython -Arguments @("-m", "pip", "install", "--editable", $checkoutPath) -Description "Install upstream package in editable mode"

Write-Host ("Bootstrap complete. Upstream checkout: {0}" -f $checkoutPath)
Write-Host ("Bootstrap complete. Virtual environment: {0}" -f $venvPath)
