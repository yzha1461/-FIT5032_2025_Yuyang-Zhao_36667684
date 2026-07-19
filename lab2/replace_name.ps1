Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$workDir = Join-Path $PSScriptRoot 'docx_work'
$imagePath = Join-Path $workDir 'word\media\image1.png'
$outputPath = 'C:\5032_week\fit5032\FIT5032_eFolio_Task_3_Report_Shuocui.docx'

$bitmap = [System.Drawing.Bitmap]::FromFile($imagePath)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$font = New-Object System.Drawing.Font('Arial', 16, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 24, 24))
$inputBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# Username input field.
$graphics.FillRectangle($inputBrush, 445, 294, 145, 29)
$graphics.DrawString('Shuocui', $font, $textBrush, 448, 298)

# Submitted user information card.
$graphics.FillRectangle($cardBrush, 226, 916, 150, 25)
$graphics.DrawString('Shuocui', $font, $textBrush, 230, 918)

$graphics.Dispose()
$font.Dispose()
$textBrush.Dispose()
$inputBrush.Dispose()
$cardBrush.Dispose()

$tempImage = "$imagePath.tmp.png"
$bitmap.Save($tempImage, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
Move-Item -LiteralPath $tempImage -Destination $imagePath -Force

if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
}
$archive = [System.IO.Compression.ZipFile]::Open($outputPath, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem -LiteralPath $workDir -File -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($workDir.Length + 1).Replace('\', '/')
    $entry = $archive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream = $_.OpenRead()
    $fileStream.CopyTo($entryStream)
    $fileStream.Dispose()
    $entryStream.Dispose()
}
$archive.Dispose()
Write-Output $outputPath
