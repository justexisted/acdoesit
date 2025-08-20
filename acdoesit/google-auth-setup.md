# Google Authentication Setup Guide

## Prerequisites
1. A Google Cloud Console account
2. A web application project

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Configure OAuth 2.0
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add your domain to "Authorized JavaScript origins":
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add your domain to "Authorized redirect URIs":
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

### 3. Get Your Client ID
1. Copy the generated Client ID
2. Replace `YOUR_GOOGLE_CLIENT_ID` in the HTML files with your actual Client ID

### 4. Update HTML Files
In both `index.html` and any other pages with authentication, update:

```html
<div id="g_id_onload"
     data-client_id="YOUR_ACTUAL_CLIENT_ID_HERE"
     data-callback="handleGoogleSignIn"
     data-auto_prompt="false">
</div>
```

### 5. Test the Integration
1. Open your website
2. Click "Sign up" or "Sign in"
3. Click the Google button
4. Complete the Google authentication flow

## Security Notes
- Never expose your Client Secret in client-side code
- Use HTTPS in production
- Implement proper server-side validation
- Consider implementing CSRF protection

## Troubleshooting
- Ensure the Google+ API is enabled
- Check that your domain is correctly added to authorized origins
- Verify the Client ID is correct
- Check browser console for any JavaScript errors
