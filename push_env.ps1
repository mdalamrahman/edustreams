$env:Path = 'C:\Program Files\nodejs;C:\Users\User\AppData\Roaming\npm;' + $env:Path

$lines = Get-Content .env
foreach ($line in $lines) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim()
        Write-Host "Adding Vercel Env Var: $key"
        
        # Add to production, preview, and development
        foreach ($envName in @('production', 'preview', 'development')) {
            $val | & 'C:\Users\User\AppData\Roaming\npm\vercel.cmd' env add $key $envName --force
        }
    }
}
Write-Host "All environment variables pushed successfully!"
