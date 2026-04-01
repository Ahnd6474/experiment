param(
    [string]$ConfigPath = "config/experiment.example.json",
    [string]$ProfileId = "sample-local",
    [string]$DestinationPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

function Read-ProfileDefinition {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProfilePath
    )

    if (-not (Test-Path -LiteralPath $ProfilePath)) {
        throw "Experiment profile not found: $ProfilePath"
    }

    return Get-Content -LiteralPath $ProfilePath -Raw | ConvertFrom-Json
}

function Clear-MaterializedRepository {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryPath
    )

    if (-not (Test-Path -LiteralPath $RepositoryPath)) {
        return
    }

    foreach ($item in Get-ChildItem -LiteralPath $RepositoryPath -Force) {
        if ($item.Name -eq ".git") {
            continue
        }

        Remove-Item -LiteralPath $item.FullName -Recurse -Force
    }
}

$config = Read-ExperimentConfig -ConfigPath $ConfigPath
$paths = Get-ExperimentPaths -Config $config
Assert-ExperimentPrerequisites -Config $config

$profilePath = Join-Path $paths.profilesRoot "$ProfileId.json"
$profile = Read-ProfileDefinition -ProfilePath $profilePath

$seedRoot = Resolve-ExperimentPath -Path $profile.target.seedRoot
$targetRepository = if ([string]::IsNullOrWhiteSpace($DestinationPath)) {
    Resolve-ExperimentPath -Path $profile.target.repositoryPath
}
else {
    Resolve-ExperimentPath -Path $DestinationPath
}

if (-not (Test-Path -LiteralPath $seedRoot)) {
    throw "Sample seed not found: $seedRoot"
}

New-Item -ItemType Directory -Path $targetRepository -Force | Out-Null
Clear-MaterializedRepository -RepositoryPath $targetRepository

foreach ($item in Get-ChildItem -LiteralPath $seedRoot -Force) {
    Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $targetRepository $item.Name) -Recurse -Force
}

$gitDirectory = Join-Path $targetRepository ".git"
if (-not (Test-Path -LiteralPath $gitDirectory)) {
    & git -C $targetRepository init --quiet | Out-Null
}

Write-Output $targetRepository
