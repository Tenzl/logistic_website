$approved = @{
  'HA NOI'      = @{ area = 'NORTHERN'; code = '01'; displayName = 'Ha Noi' }
  'LAO CAI'     = @{ area = 'NORTHERN'; code = '10'; displayName = 'Lao Cai' }
  'THAI NGUYEN' = @{ area = 'NORTHERN'; code = '26'; displayName = 'Thai Nguyen' }
  'LANG SON'    = @{ area = 'NORTHERN'; code = '20'; displayName = 'Lang Son' }
  'QUANG NINH'  = @{ area = 'NORTHERN'; code = '22'; displayName = 'Quang Ninh' }
  'BAC NINH'    = @{ area = 'NORTHERN'; code = '24'; displayName = 'Bac Ninh' }
  'PHU THO'     = @{ area = 'NORTHERN'; code = '25'; displayName = 'Phu Tho' }
  'HAI PHONG'   = @{ area = 'NORTHERN'; code = '31'; displayName = 'Hai Phong' }
  'HUNG YEN'    = @{ area = 'NORTHERN'; code = '33'; displayName = 'Hung Yen' }
  'NINH BINH'   = @{ area = 'NORTHERN'; code = '37'; displayName = 'Ninh Binh' }
  'THANH HOA'   = @{ area = 'MIDDLE';   code = '38'; displayName = 'Thanh Hoa' }
  'NGHE AN'     = @{ area = 'MIDDLE';   code = '40'; displayName = 'Nghe An' }
  'HA TINH'     = @{ area = 'MIDDLE';   code = '42'; displayName = 'Ha Tinh' }
  'QUANG TRI'   = @{ area = 'MIDDLE';   code = '44'; displayName = 'Quang Tri' }
  'HUE'         = @{ area = 'MIDDLE';   code = '46'; displayName = 'Hue' }
  'DA NANG'     = @{ area = 'MIDDLE';   code = '48'; displayName = 'Da Nang' }
  'QUANG NGAI'  = @{ area = 'MIDDLE';   code = '51'; displayName = 'Quang Ngai' }
  'GIA LAI'     = @{ area = 'MIDDLE';   code = '52'; displayName = 'Gia Lai' }
  'KHANH HOA'   = @{ area = 'MIDDLE';   code = '56'; displayName = 'Khanh Hoa' }
  'DONG NAI'    = @{ area = 'SOUTHERN'; code = '75'; displayName = 'Dong Nai' }
  'HO CHI MINH' = @{ area = 'SOUTHERN'; code = '79'; displayName = 'Ho Chi Minh' }
  'TAY NINH'    = @{ area = 'SOUTHERN'; code = '80'; displayName = 'Tay Ninh' }
  'DONG THAP'   = @{ area = 'SOUTHERN'; code = '82'; displayName = 'Dong Thap' }
  'VINH LONG'   = @{ area = 'SOUTHERN'; code = '86'; displayName = 'Vinh Long' }
  'AN GIANG'    = @{ area = 'SOUTHERN'; code = '89'; displayName = 'An Giang' }
  'CAN THO'     = @{ area = 'SOUTHERN'; code = '92'; displayName = 'Can Tho' }
  'CA MAU'      = @{ area = 'SOUTHERN'; code = '96'; displayName = 'Ca Mau' }
}

$alias = @{
  'THUA THIEN HUE'='HUE'; 'TP. HO CHI MINH'='HO CHI MINH'; 'TP HO CHI MINH'='HO CHI MINH';
  'DONG NAI'='DONG NAI'; 'DONG THAP'='DONG THAP'; 'CAN THO'='CAN THO'; 'CA MAU'='CA MAU';
  'TAY NINH'='TAY NINH'; 'AN GIANG'='AN GIANG'; 'VINH LONG'='VINH LONG'; 'KHANH HOA'='KHANH HOA';
  'GIA LAI'='GIA LAI'; 'QUANG NGAI'='QUANG NGAI'; 'DA NANG'='DA NANG'; 'HUE'='HUE';
  'QUANG TRI'='QUANG TRI'; 'HA TINH'='HA TINH'; 'NGHE AN'='NGHE AN'; 'THANH HOA'='THANH HOA';
  'NINH BINH'='NINH BINH'; 'HUNG YEN'='HUNG YEN'; 'PHU THO'='PHU THO'; 'BAC NINH'='BAC NINH';
  'LANG SON'='LANG SON'; 'THAI NGUYEN'='THAI NGUYEN'; 'LAO CAI'='LAO CAI'; 'HA NOI'='HA NOI';
  'HAI PHONG'='HAI PHONG'; 'QUANG NINH'='QUANG NINH'
}

function Remove-Diacritics([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return '' }
  $normalized = $s.Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $normalized.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$sb.Append($ch)
    }
  }

  $ascii = $sb.ToString().Replace([char]272, 'D').Replace([char]273, 'd')
  return $ascii
}

function Norm([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return '' }
  return (Remove-Diacritics($s)).Trim().ToUpperInvariant()
}

$base = 'http://localhost:8081/api/v1/provinces'
$resp = Invoke-RestMethod -Uri $base -Method Get
$items = @($resp.data)

$existingApproved = New-Object 'System.Collections.Generic.HashSet[string]'
$updated = 0
$deleted = 0
$created = 0

foreach ($p in $items) {
  $k = Norm $p.name
  $canonical = $null

  if ($approved.ContainsKey($k)) {
    $canonical = $k
  } elseif ($alias.ContainsKey($k)) {
    $canonical = $alias[$k]
  }

  if ($canonical) {
    $area = $approved[$canonical].area
    $code = $approved[$canonical].code
    $displayName = $approved[$canonical].displayName
    $null = $existingApproved.Add($canonical)

    if ((Norm $p.name) -ne $canonical -or (Norm $p.area) -ne $area -or ("$($p.code)" -ne $code) -or ("$($p.displayName)" -ne $displayName)) {
      $body = @{ name = $canonical; displayName = $displayName; code = $code; area = $area } | ConvertTo-Json
      Invoke-RestMethod -Uri "$base/$($p.id)" -Method Put -ContentType 'application/json' -Body $body | Out-Null
      $updated++
    }
  }
}

foreach ($name in $approved.Keys) {
  if (-not $existingApproved.Contains($name)) {
    $body = @{ name = $name; displayName = $approved[$name].displayName; code = $approved[$name].code; area = $approved[$name].area } | ConvertTo-Json
    Invoke-RestMethod -Uri $base -Method Post -ContentType 'application/json' -Body $body | Out-Null
    $created++
  }
}

$resp2 = Invoke-RestMethod -Uri $base -Method Get
$items2 = @($resp2.data)
foreach ($p in $items2) {
  $k = Norm $p.name
  $canonical = $k
  if ($alias.ContainsKey($k)) {
    $canonical = $alias[$k]
  }

  if (-not $approved.ContainsKey($canonical)) {
    Invoke-RestMethod -Uri "$base/$($p.id)" -Method Delete | Out-Null
    $deleted++
  }
}

$resp3 = Invoke-RestMethod -Uri $base -Method Get
$items3 = @($resp3.data)

"UPDATED=$updated"
"CREATED=$created"
"DELETED=$deleted"
"TOTAL=$($items3.Count)"
$items3 | Group-Object area | Sort-Object Name | ForEach-Object { "AREA=$($_.Name);COUNT=$($_.Count)" }
