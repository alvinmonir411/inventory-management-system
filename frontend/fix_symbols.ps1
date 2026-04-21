# fix_symbols.ps1
$file = 'c:\Users\alvin monir\Desktop\erp\inventory-management-system\frontend\components\stock\stock-page.tsx'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Use string overload of Replace (not char overload)
$taka   = [System.String][char]0x09F3     # ৳
$arrowUp = [System.String][char]0x2191    # ↑
$arrowLR = [System.String][char]0x21C4    # ⇄
$warn   = [System.String][char]0x26A0     # ⚠
$bolt   = [System.String][char]0x26A1     # ⚡
$check  = [System.String][char]0x2713     # ✓

$content = $content.Replace($taka, 'Tk ')
$content = $content.Replace($arrowUp + ' In', '+ In')
$content = $content.Replace($arrowUp, '+')
$content = $content.Replace($arrowLR + ' Adj', 'Adj')
$content = $content.Replace($arrowLR, 'Adj')
$content = $content.Replace($warn + ' Out of Stock', 'Out of Stock')
$content = $content.Replace($bolt + ' Low Stock', 'Low Stock')
$content = $content.Replace($check + ' Healthy', 'Healthy')
$content = $content.Replace($warn, '!')
$content = $content.Replace($bolt, '')
$content = $content.Replace($check, 'OK')

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done."
