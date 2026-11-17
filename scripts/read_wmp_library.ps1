param([Parameter(Mandatory = $true)][string]$OutputPath)

$ErrorActionPreference = 'Stop'
$player = $null
$playlist = $null
$items = [System.Collections.Generic.List[object]]::new()

try {
    $player = New-Object -ComObject WMPlayer.OCX
    $playlist = $player.mediaCollection.getAll()
    for ($index = 0; $index -lt $playlist.count; $index++) {
        $media = $playlist.Item($index)
        try {
            if ($media.getItemInfo('MediaType') -ne 'audio') { continue }
            $authors = [System.Collections.Generic.List[string]]::new()
            $authorCount = $media.getAttributeCountByType('Author', '')
            for ($authorIndex = 0; $authorIndex -lt $authorCount; $authorIndex++) {
                $author = [string]$media.getItemInfoByType('Author', '', $authorIndex)
                if (-not [string]::IsNullOrWhiteSpace($author)) { $authors.Add($author.Trim()) }
            }
            if ($authors.Count -eq 0) {
                $author = [string]$media.getItemInfo('Author')
                if (-not [string]::IsNullOrWhiteSpace($author)) { $authors.Add($author.Trim()) }
            }
            $items.Add([pscustomobject]@{
                sourceUrl = $media.getItemInfo('SourceURL')
                title = $media.getItemInfo('Title')
                artist = $media.getItemInfo('Author')
                contributingArtist = $authors -join '; '
                album = $media.getItemInfo('WM/AlbumTitle')
                albumArtist = $media.getItemInfo('WM/AlbumArtist')
                trackNumber = $media.getItemInfo('WM/TrackNumber')
                discNumber = $media.getItemInfo('WM/PartOfSet')
                duration = $media.getItemInfo('Duration')
                playCount = $media.getItemInfo('UserPlayCount')
            })
        } finally {
            if ($null -ne $media) { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($media) }
        }
    }
    [System.IO.File]::WriteAllText(
        $OutputPath,
        (ConvertTo-Json -InputObject @($items.ToArray()) -Depth 3 -Compress),
        [System.Text.UTF8Encoding]::new($false)
    )
} finally {
    if ($null -ne $player) { try { $player.close() } catch {} }
    if ($null -ne $playlist) { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($playlist) }
    if ($null -ne $player) { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($player) }
}
