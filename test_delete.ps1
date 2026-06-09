$anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbmhlbGhxZW1qcmNpZnBudWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzI3NjEsImV4cCI6MjA5NTAwODc2MX0.S-ZE_QWQ3OqOEJc6qZVoSoVaYID_jUj4K45d7o5zLJc'
$headers = @{
    'apikey' = $anonKey
    'Authorization' = "Bearer $anonKey"
    'Content-Type' = 'application/json'
    'Prefer' = 'return=representation'
}

# Test DELETE on the 'abc' template (id: 35e086a1-dc12-49cd-b558-17df450d370f)
$uri = 'https://wpnhelhqemjrcifpnufo.supabase.co/rest/v1/response_templates?id=eq.35e086a1-dc12-49cd-b558-17df450d370f'
$resp = Invoke-WebRequest -Uri $uri -Method DELETE -Headers $headers -UseBasicParsing
Write-Host "Status:" $resp.StatusCode
Write-Host "Content:" $resp.Content
Write-Host "Headers:" ($resp.Headers | ConvertTo-Json)
