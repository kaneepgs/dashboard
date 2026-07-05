# OpenClaw custom domain setup for oc.epgolfescape.co.uk

## Goal
Serve OpenClaw Control UI from:

- `https://oc.epgolfescape.co.uk`

This should replace the Hostinger preview domain path that is currently injecting iframe-blocking headers on canvas/embed routes.

## What is already prepared

- OpenClaw `gateway.controlUi.allowedOrigins` now includes:
  - `https://oc.epgolfescape.co.uk`
- The dashboard app itself is ready.
- The Sunday summary layer is live in the product.

## Recommended architecture

Use a real HTTPS reverse proxy in front of OpenClaw.

### Preferred shape

- Public HTTPS endpoint: `oc.epgolfescape.co.uk`
- Reverse proxy: Caddy or nginx
- Upstream OpenClaw gateway: `http://127.0.0.1:18789`
- Keep OpenClaw gateway bound locally unless the proxy requires a LAN bind.

## Critical requirement

Do **not** inject iframe-blocking headers on these proxied routes:

- `/__openclaw__/canvas/*`
- `/__openclaw__/cap/*`

Specifically avoid adding or overriding these with blocking values:

- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'`

The Control UI page itself can keep its own stricter headers. The embedded canvas document path must stay frameable by the same site.

## Recommended auth mode

Use the existing OpenClaw auth path first.

- Keep normal OpenClaw auth
- Use HTTPS so the browser gets a secure context
- Avoid `dangerouslyDisableDeviceAuth`
- Avoid `trusted-proxy` unless we intentionally want proxy-auth / SSO later

## Caddy example

```caddy
oc.epgolfescape.co.uk {
    encode gzip zstd

    reverse_proxy 127.0.0.1:18789 {
        header_up Host {host}
        header_up X-Forwarded-Host {host}
        header_up X-Forwarded-Proto https
        header_up X-Forwarded-For {remote_host}
    }
}
```

### Notes

- This is the clean starting point.
- Do not add global `X-Frame-Options: DENY` at the proxy layer.
- Let OpenClaw serve its own headers unless we have a proven reason to override them.

## nginx example

```nginx
server {
    listen 443 ssl http2;
    server_name oc.epgolfescape.co.uk;

    ssl_certificate     /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

## DNS

Point `oc.epgolfescape.co.uk` at the machine or proxy that terminates HTTPS for OpenClaw.

Typical options:

- `A` record to the proxy host IPv4
- `AAAA` record to the proxy host IPv6
- `CNAME` if using a managed proxy endpoint

## OpenClaw follow-up after proxy is live

Once the proxy exists, verify:

1. `https://oc.epgolfescape.co.uk/chat?session=main` loads
2. login / Control UI connection works over HTTPS
3. a hosted canvas document under `/__openclaw__/canvas/...` no longer returns proxy-added `X-Frame-Options: DENY`
4. dashboard embed renders in chat

## If we later want SSO / proxy auth

Then we can move to:

- `gateway.auth.mode: "trusted-proxy"`
- `gateway.trustedProxies = [...]`
- `gateway.auth.trustedProxy.userHeader = ...`

But that is a phase 2 change, not required for the first working embed.
