workflow "Twitch check_suite" {
  on = "check_suite"
  resolves = ["twitch alerts docker action"]
}

workflow "Twitch pull_request" {
  resolves = ["twitch alerts docker action"]
  on = "pull_request"
}

workflow "Twitch issue" {
  resolves = ["twitch alerts docker action"]
  on = "issues"
}

action "twitch alerts docker action" {
  uses = "docker://noopkat/twitch-dev-alerts-action:0.0.6"
  secrets = [
    "TWITCH_EXT_CLIENT",
    "TWITCH_EXT_SECRET",
    "GITHUB_TOKEN",
    "TWITCH_CHANNEL",
  ]
}
