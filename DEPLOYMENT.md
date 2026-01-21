# Deployment Guide

## Option 1: Render (Recommended ⭐)

Render is best for this project because it can host both the frontend and backend in one place.

### Setup Steps

#### 1. Prepare for Deployment

Update your frontend WebSocket URL to work in production:

**File**: `src/pages/Index.tsx`
```typescript
// Change from:
const WS_SERVER_URL = 'ws://localhost:3001';

// To:
const WS_SERVER_URL = process.env.VITE_WS_SERVER_URL || 'ws://localhost:3001';
```

Create `.env.production`:
```
VITE_WS_SERVER_URL=wss://your-app-server.onrender.com
```

#### 2. Create `render.yaml` (Infrastructure as Code)

Create a `render.yaml` file in the root directory:

```yaml
services:
  - type: web
    name: flam-app-client
    env: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    routes:
      - path: /*
        destination: /index.html
    envVars:
      - key: VITE_WS_SERVER_URL
        scope: build
        value: wss://flam-app-server.onrender.com

  - type: web
    name: flam-app-server
    env: node
    region: ohio
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && node server.js
    envVars:
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGIN
        value: https://flam-app-client.onrender.com
```

#### 3. Update Server for CORS

**File**: `server/server.js` - Add at the top:

```javascript
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

#### 4. Deploy to Render

1. Push your code to GitHub (with `render.yaml`)
2. Go to [render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml` and deploy both services
6. Update your frontend's WebSocket URL to point to the server URL

---

## Option 2: Vercel (Frontend Only)

If you prefer Vercel, you'll deploy the frontend there and the server separately (Render, Railway, Fly.io, etc.)

### Setup Steps

#### 1. Configure Frontend for Vercel

Create `vercel.json` in root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_WS_SERVER_URL": "@ws-server-url"
  }
}
```

#### 2. Deploy Server to Render

Follow the Render server-only deployment below, then get your server URL.

#### 3. Deploy Frontend to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variable:
   - `VITE_WS_SERVER_URL` = `wss://your-server.onrender.com`
5. Deploy!

---

## Server-Only Deployment (for Vercel + separate server)

If using Vercel for frontend, deploy server to Render:

### Create `render.yaml` (Server Only)

```yaml
services:
  - type: web
    name: flam-app-server
    env: node
    region: ohio
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && node server.js
    envVars:
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGIN
        value: https://your-vercel-frontend.vercel.app
```

Then update your Vercel environment variable with the Render server URL.

---

## Environment Setup

### Frontend `.env.production`

```
VITE_WS_SERVER_URL=wss://your-server-url.onrender.com
```

### Server `.env`

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

---

## Quick Deployment Checklist

### Render (Full-Stack)
- [ ] Create `render.yaml`
- [ ] Update server CORS setup
- [ ] Update frontend WebSocket URL
- [ ] Push to GitHub
- [ ] Create Render Blueprint from GitHub repo
- [ ] Get service URLs and test

### Vercel (Frontend)
- [ ] Create `vercel.json`
- [ ] Update `.env.production`
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Set environment variables
- [ ] Deploy

---

## Important Notes

### WebSocket URLs
- **Development**: `ws://localhost:3001`
- **Production**: `wss://...` (secure WebSocket over HTTPS)

### CORS Headers
- Server needs to allow requests from your frontend domain
- In production, set `CORS_ORIGIN` to your frontend URL

### Database & Persistence
- Current implementation: in-memory only
- Data resets on server restart
- For persistence: add MongoDB, PostgreSQL, etc.

### Free Tier Limitations
- **Render Free**: Apps spin down after 15 minutes of inactivity
- **Vercel Free**: Deployment + serverless functions free
- Consider upgrading for production apps

---

## Testing After Deployment

1. Visit your frontend URL
2. Open multiple tabs/browsers
3. Join the same room
4. Draw and verify real-time sync
5. Test undo/redo
6. Check user list updates

---

## Troubleshooting

### WebSocket Connection Failed
- Check CORS_ORIGIN matches your frontend domain
- Ensure WebSocket URL uses `wss://` (secure)
- Verify server is running

### Build Fails
- Check Node.js version requirements
- Verify all dependencies in `package.json`
- Check build scripts are correct

### Data Loss on Redeploy
- Expected behavior (in-memory storage)
- Add database for persistence

---

## Next Steps

1. Choose Render or Vercel
2. Create necessary config files
3. Push to GitHub
4. Deploy via your chosen platform
5. Test the deployed application
