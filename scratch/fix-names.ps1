$files = Get-ChildItem -Path "public\*.js", "lib\*.js", "server.js" -Recurse

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $original = $content
    
    $content = $content -replace 'Frete Bag do iFood', 'Frete Kit Bíblico'
    $content = $content -replace 'Frete Bag iFood', 'Frete Kit Bíblico'
    $content = $content -replace 'Bag do iFood', 'Kit Bíblico'
    $content = $content -replace 'Cliente iFood', 'Fiel Universal'
    $content = $content -replace '@ifoodbag\.app', '@universal.app'
    $content = $content -replace 'ifoodbag\.', 'universal.'
    $content = $content -replace '__ifood', '__universal'
    $content = $content -replace 'ifood_upsell', 'universal_upsell'

    if ($content -ne $original) {
        Set-Content -Path $f.FullName -Value $content
        Write-Host "Updated $($f.FullName)"
    }
}
