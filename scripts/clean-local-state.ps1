param(
    [string]$ConfigPath = "config/experiment.example.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

function Assert-SafeLocalRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LocalRoot
    )

    $trimmed = $LocalRoot.TrimEnd([char[]]@('\', '/'))
    if ([System.IO.Path]::GetFileName($trimmed) -ne ".local") {
        throw "Refusing to delete non-.local path: $LocalRoot"
    }
}

$config = Read-ExperimentConfig -ConfigPath $ConfigPath
$paths = Get-ExperimentPaths -Config $config
$localRoot = $paths.localRoot

Assert-SafeLocalRoot -LocalRoot $localRoot

if (Test-Path -LiteralPath $localRoot) {
    Remove-Item -LiteralPath $localRoot -Recurse -Force
    Write-Host ("Removed local state: {0}" -f $localRoot)
}
else {
    Write-Host ("Local state already clean: {0}" -f $localRoot)
}
