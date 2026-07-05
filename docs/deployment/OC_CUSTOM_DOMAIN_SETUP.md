# Managed OpenClaw launch note

## Status

This project is now explicitly targeting **Hostinger Managed OpenClaw**.

That means this dashboard should **not** try to:

- embed the OpenClaw Control UI
- depend on iframe-compatible headers
- configure Caddy, nginx, custom domains, host ports, or reverse proxies
- change SSL termination or gateway edge behavior

## Dashboard direction

Treat OpenClaw as a separate external workspace and launch it in a new tab from the dashboard.

Primary launch URL:

- `https://lightsteelblue-pheasant-697323.hostingersite.com`

## Product implication

The EP Golf dashboard should integrate with OpenClaw through:

- external links
- API endpoints
- skills
- MCP integrations

It should **not** depend on embedding the Control UI itself.

## Implementation note

The dashboard UI now uses an `Open OpenClaw` link/button instead of an embedded OpenClaw path.
