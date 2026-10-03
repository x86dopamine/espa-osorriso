$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else {
  Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $nodeExecutable)) {
  throw 'Instale Node.js 18 ou superior para iniciar a prévia.'
}
& $nodeExecutable (Join-Path $PSScriptRoot 'server.mjs')
