# IP Address Configuration

This document explains how to run the application with a specific IP address to allow access from other devices on your network.

## Available Scripts

We've added several scripts to help you run the application with the IP address `172.20.10.2:3003`:

### `npm run server:ip`

This is the main script you should use to start the server with the IP address configuration. It:

- Generates a cookie clearing page
- Configures the server to use the IP address `172.20.10.2`
- Enhances cookie handling to prevent large cookie errors
- Enables CORS for the application

```bash
npm run server:ip
```

### `npm run clear-cookies`

This script generates a cookie clearing page that you can access at:
```
http://172.20.10.2:3003/clear-cookies.html
```

Use this page to clear cookies if you encounter login issues.

### `npm run test:cookies`

This script tests the cookie handling functionality by sending a request with a large cookie:

```bash
npm run test:cookies
```

## Troubleshooting

### Large Cookie Errors

If you encounter large cookie errors:

1. Access the cookie clearing page at `http://172.20.10.2:3003/clear-cookies.html`
2. Click the "Clear All Cookies" button
3. Try logging in again

### CORS Issues

The server is configured to handle CORS requests from `http://172.20.10.2:3003`. If you need to allow other origins, you can modify the `NEXT_PUBLIC_ALLOW_ORIGIN` environment variable in the `scripts/run-server-with-ip.js` file.

### Security Notes

For local development, secure cookies are disabled. This is normal for development environments but should not be used in production.

## Configuration Files

The IP address configuration is set in several files:

- `server.js` - Main server configuration
- `scripts/run-server-with-ip.js` - Script to start the server with IP configuration
- `scripts/clear-cookies.js` - Script to generate the cookie clearing page
- `lib/auth.ts` - NextAuth configuration with cookie settings

## Accessing from Other Devices

With this configuration, you can access the application from other devices on your network by navigating to:

```
http://172.20.10.2:3003
```

Make sure your firewall allows connections to this port.