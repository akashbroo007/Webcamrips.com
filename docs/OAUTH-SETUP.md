# OAuth Setup Guide

This guide explains how to set up OAuth authentication with Google and Twitter for your WebcamRips application.

## Prerequisites

- A Google Developer account
- A Twitter Developer account
- Your application running locally or deployed to a production environment

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - For local development: `http://localhost:3001`
   - For production: `https://your-production-domain.com`
8. Add authorized redirect URIs:
   - For local development: `http://localhost:3001/api/auth/callback/google`
   - For production: `https://your-production-domain.com/api/auth/callback/google`
9. Click "Create"
10. Note your Client ID and Client Secret

## Twitter OAuth Setup

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app, or use an existing one
3. Navigate to the app settings
4. Change app permissions to "Read" at minimum
5. Set up User authentication settings:
   - Enable OAuth 2.0
   - Type of App: Web App
   - Callback URL: 
     - For local development: `http://localhost:3001/api/auth/callback/twitter`
     - For production: `https://your-production-domain.com/api/auth/callback/twitter`
   - Website URL: Your website URL
6. Save the settings
7. Note your Client ID and Client Secret

## Environment Variables Setup

Add these variables to your `.env.local` file:

```
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
NEXT_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id

# Important: Make sure these URLs match the port your application is running on
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Testing OAuth

1. Start your application locally
2. Navigate to the login page
3. Click on "Continue with Google" or "Continue with Twitter"
4. You should be redirected to the respective service for authentication
5. After successful authentication, you should be redirected back to your application's dashboard

## Troubleshooting

- **Redirect URI Mismatch**: Ensure the redirect URI in your OAuth provider settings exactly matches the one your application is using.
- **Cookie Issues**: Make sure your NEXTAUTH_URL is configured correctly in your environment variables.
- **CORS Errors**: Verify that the authorized JavaScript origins in Google OAuth settings match your application's URL.
- **"Invalid Credentials"**: Double-check your client ID and secret in your environment variables.
- **Port Mismatch**: Ensure the port in your redirect URIs matches the port in your NEXTAUTH_URL and the port your application is running on.

## Additional Resources

- [Next.js Authentication Documentation](https://nextjs.org/docs/authentication)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Twitter OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0) 