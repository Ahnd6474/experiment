param(
    [string]$ConfigPath = "config/experiment.example.json",
    [string]$ProfileId = "sample-local",
    [string]$DestinationPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

$profilePath = Resolve-ExperimentProfilePath -ProfileName $ProfileId -ConfigPath $ConfigPath
$profile = Get-Content -LiteralPath $profilePath -Raw | ConvertFrom-Json

if (
    -not $profile.PSObject.Properties.Name.Contains("materializer") -or
    -not $profile.materializer.PSObject.Properties.Name.Contains("script") -or
    [string]::IsNullOrWhiteSpace($profile.materializer.script)
) {
    throw "Profile '$ProfileId' does not define materializer.script."
}

$materializerScript = Resolve-ExperimentPath -Path $profile.materializer.script
if (-not (Test-Path -LiteralPath $materializerScript)) {
    throw "Materializer script not found: $materializerScript"
}

$materializerParameters = @{
    ConfigPath = $ConfigPath
    ProfileId = $ProfileId
}

if (-not [string]::IsNullOrWhiteSpace($DestinationPath)) {
    $materializerParameters["DestinationPath"] = $DestinationPath
}

& $materializerScript @materializerParameters
if ((Test-Path variable:LASTEXITCODE) -and $LASTEXITCODE -ne 0) {
    throw "Materialize target failed with exit code $LASTEXITCODE."
}
