# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in A|CAP, please report it privately by emailing the repository owner.

Do **not** open a public issue for security vulnerabilities.

## Supported Versions

Only the latest production deployment at [a-cap.xyz](https://a-cap.xyz) is supported with security updates.

## Security Practices

- All secrets are stored as environment variables — never in code.
- Sessions use httpOnly, Secure cookies with SameSite=Lax.
- Rate limiting is enforced at the middleware and API level.
- Input sanitization is performed server-side.
- Database queries use parameterized statements via Drizzle ORM.
