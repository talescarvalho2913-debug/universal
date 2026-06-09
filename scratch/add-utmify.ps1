$files = Get-ChildItem -Path "public\*.html"

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -notmatch "cdn\.utmify\.com\.br") {
        $utmifyScript = "`n    <!-- UTMify -->`n    <script src=`"https://cdn.utmify.com.br/scripts/utms/latest.js`" data-utmify-prevent-subids async defer></script>`n"
        $content = $content -replace "(</head>)", "$utmifyScript`$1"
        Set-Content -Path $f.FullName -Value $content
        Write-Host "Injected UTMify into $($f.Name)"
    }
}
