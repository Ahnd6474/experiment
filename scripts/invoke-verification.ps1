param(
    [string]$ConfigPath = "config/experiment.example.json",
    [string]$ProfileId = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

function Invoke-VerificationCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,

        [int]$TimeoutSeconds
    )

    $process = Start-Process `
        -FilePath $Command `
        -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory `
        -NoNewWindow `
        -PassThru

    if ($null -ne $TimeoutSeconds -and $TimeoutSeconds -gt 0) {
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            try {
                $process.Kill($true)
            }
            catch {
            }

            throw "Verification command timed out after $TimeoutSeconds seconds."
        }
    }
    else {
        $process.WaitForExit()
    }

    if ($process.ExitCode -ne 0) {
        throw "Verification command failed with exit code $($process.ExitCode)."
    }
}

$profile = Normalize-ExperimentProfile -ProfileName $ProfileId -ConfigPath $ConfigPath

foreach ($phase in $profile.VerificationPhases) {
    Write-Host ("==> {0}" -f $phase.Id)

    if ($phase.Kind -eq "entryScript") {
        $scriptArguments = @("-ConfigPath", $ConfigPath)

        if ($phase.EntryScriptName -eq "bootstrap") {
            $scriptArguments += @(
                "-UpstreamUrl", $profile.Source.RepositoryUrl,
                "-Branch", $profile.Source.DefaultBranch
            )
        }

        & $phase.ScriptPath @scriptArguments
        if ($LASTEXITCODE -ne 0) {
            throw "Verification phase '$($phase.Id)' failed with exit code $LASTEXITCODE."
        }

        continue
    }

    Invoke-VerificationCommand `
        -Command $phase.Command `
        -Arguments $phase.Arguments `
        -WorkingDirectory $phase.WorkingDirectory `
        -TimeoutSeconds $phase.TimeoutSeconds
}
