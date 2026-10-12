# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The SkyShield AI team takes security and meteorological alert integrity seriously.

If you believe you have found a security vulnerability in SkyShield AI, please do **NOT** open a public issue. Instead, report it privately:

1. Send an email with vulnerability details to `security@skyshield.local` (or reach out via GitHub Security Advisories if enabled).
2. Include:
   - Type of issue (e.g., buffer overflow, SQL injection, unauthorized alert broadcast)
   - Step-by-step instructions or proof-of-concept to reproduce the vulnerability
   - Potential impact
3. You will receive an acknowledgment within 48 hours.

## Best Practices for Deployment

- **Never commit `.env` files**: Keep external provider keys (`GOOGLE_MAPS_API_KEY`, `OPENWEATHER_API_KEY`, `MOSDAC_API_KEY`, `GEMINI_API_KEY`) strictly in server environment variables.
- **Rotate `JWT_SECRET`**: Change `JWT_SECRET` from the default template value before deploying to production.
- **TLS / HTTPS**: Ensure reverse proxies (Nginx, Traefik, Caddy) terminate SSL/TLS for all HTTP and WebSocket connections (`/ws/officer`, `/ws/citizen`).
