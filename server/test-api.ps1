# Test the changeorder endpoint
$uri = "http://localhost:8082/paint/changeorder"
$body = @{
    wo = "G02098"
    newOrder = "G020981"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -Headers $headers
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
