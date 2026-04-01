param(
    [string]$ConfigPath = "config/experiment.example.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. "$PSScriptRoot/common.ps1"

function Get-PrerequisiteDefinition {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        $Config,

        [Parameter(Mandatory = $true)]
        $Runtime
    )

    $definition = $Config.prerequisites.$Name
    if ($null -eq $definition) {
        throw "Experiment config is missing prerequisite definition '$Name'."
    }

    $minimumVersion = if ($definition.PSObject.Properties.Name.Contains("minimumVersion")) {
        $definition.minimumVersion
    }
    else {
        $null
    }

    if ($Name -eq "python" -and $Runtime.PSObject.Properties.Name.Contains("pythonCommand")) {
        return [pscustomobject]@{
            command = $Runtime.pythonCommand
            required = [bool]$definition.required
            minimumVersion = $minimumVersion
        }
    }

    return [pscustomobject]@{
        command = $definition.command
        required = [bool]$definition.required
        minimumVersion = $minimumVersion
    }
}

function Get-ToolVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    $output = & $Command --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to query version for '$Command'."
    }

    $text = ($output | Out-String).Trim()
    $match = [System.Text.RegularExpressions.Regex]::Match($text, "\d+(\.\d+)+")
    if (-not $match.Success) {
        throw "Unable to parse version from '$text'."
    }

    return [pscustomobject]@{
        Raw = $text
        Parsed = [version]$match.Value
    }
}

$config = Read-ExperimentConfig -ConfigPath $ConfigPath
$runtime = Get-ExperimentRuntimeDefaults -Config $config
$results = @()
$failures = @()
$warnings = @()

foreach ($property in $config.prerequisites.PSObject.Properties) {
    $definition = Get-PrerequisiteDefinition -Name $property.Name -Config $config -Runtime $runtime
    $availability = Test-ExperimentPrerequisite -Name $property.Name -Definition $definition
    $status = "OK"
    $detail = "available at $($availability.CommandPath)"

    if (-not $availability.IsAvailable) {
        if ($availability.Required) {
            $status = "FAIL"
            $detail = "required command '$($availability.Command)' is not available"
            $failures += "$($property.Name) [$($availability.Command)]"
        }
        else {
            $status = "WARN"
            $detail = "optional command '$($availability.Command)' is not available"
            $warnings += "$($property.Name) [$($availability.Command)]"
        }
    }
    elseif ($definition.PSObject.Properties.Name.Contains("minimumVersion") -and $definition.minimumVersion) {
        $versionInfo = Get-ToolVersion -Command $availability.CommandPath
        if ($versionInfo.Parsed -lt [version]$definition.minimumVersion) {
            if ($availability.Required) {
                $status = "FAIL"
                $detail = "found version $($versionInfo.Raw); requires $($definition.minimumVersion)+"
                $failures += "$($property.Name) [$($versionInfo.Raw)]"
            }
            else {
                $status = "WARN"
                $detail = "found version $($versionInfo.Raw); optional minimum is $($definition.minimumVersion)+"
                $warnings += "$($property.Name) [$($versionInfo.Raw)]"
            }
        }
        else {
            $detail = "version $($versionInfo.Raw) satisfies $($definition.minimumVersion)+"
        }
    }

    $results += [pscustomobject]@{
        Status = $status
        Name = $property.Name
        Command = $availability.Command
        Detail = $detail
    }
}

foreach ($result in $results) {
    Write-Host ("[{0}] {1} ({2}) - {3}" -f $result.Status, $result.Name, $result.Command, $result.Detail)
}

if ($warnings.Count -gt 0) {
    Write-Warning ("Optional prerequisites unavailable or below target: {0}" -f ($warnings -join ", "))
}

if ($failures.Count -gt 0) {
    throw ("Prerequisite checks failed: {0}" -f ($failures -join ", "))
}

Write-Host "All required prerequisites are available."
