# 🚀 Deployment Quick Start

## For Render (Recommended)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### Step 3: Deploy via Blueprint
1. Click "New +" → "Blueprint"
2. Select your GitHub repository
3. Render automatically detects `render.yaml`
4. Click "Deploy"
5. Wait for both services to build (5-10 minutes)

### Step 4: Get Your URLs
- Frontend: `https://flam-app-client.onrender.com`
- Backend: `https://flam-app-server.onrender.com`

### Step 5: Update Frontend URL (if needed)
In `src/pages/Index.tsx`, the WebSocket URL is already configured to auto-detect in production, so no changes needed!

---

## For Vercel (Frontend) + Render (Server)

### Frontend on Vercel

```bash
# 1. Deploy frontend to Vercel
vercel
# or connect via vercel.com dashboard
```

Add environment variable in Vercel dashboard:
```
VITE_WS_SERVER_URL = wss://your-server.onrender.com
```

### Server on Render

Follow the "Render" steps above for just the server, or use the server-only render.yaml:

```bash
# Delete the current render.yaml
rm render.yaml

# Create server-only version
# (use content from DEPLOYMENT.md)
```

---

## Configuration Files Included

- ✅ `render.yaml` - Full-stack deployment configuration
- ✅ `vercel.json` - Vercel frontend configuration
- ✅ `.env.production` - Production environment variables
- ✅ Updated `src/pages/Index.tsx` - Dynamic WebSocket URL
- ✅ Updated `server/server.js` - CORS and environment support

---

## Testing Deployment

1. **Visit your frontend URL**
   ```
   https://your-frontend.onrender.com
   ```

2. **Open Multiple Tabs**
   - Tab 1: Same URL, different room or same room
   - Tab 2: Same URL, same room
   - Tab 3: (optional) Different device/browser

3. **Test Features**
   - [ ] Draw in one tab, see in other tabs (real-time sync)
   - [ ] Undo/redo works
   - [ ] User list updates
   - [ ] Cursor positions visible
   - [ ] Can join different rooms

4. **Check Logs**
   - Render: Dashboard → Service → Logs
   - Look for: "Collaborative Canvas Server running"

---

## Troubleshooting

### WebSocket Connection Failed
**Error**: `WebSocket is closed before the connection is established`

**Fix**: 
1. Check that server is running (visit `/health` endpoint)
2. Verify CORS_ORIGIN in server matches your frontend URL
3. Ensure WebSocket URL uses `wss://` (not `ws://`)

### Build Failed
**Error**: `npm ERR!`

**Fix**:
1. Check dependencies are correct in package.json
2. Ensure Node.js version is compatible
3. Check build scripts in render.yaml

### Data Loss on Redeploy
**Expected behavior** - data is in-memory, not persistent

**Solution**: Add database (MongoDB, PostgreSQL) later if needed

---

## Environment Variables Reference

### Frontend (.env.production)
```
VITE_WS_SERVER_URL=wss://your-server.onrender.com
```

### Server (set in Render dashboard or render.yaml)
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.onrender.com
```

---

## Next: Database & Persistence (Optional)

To save drawings:

1. Add MongoDB to render.yaml
2. Update `drawing-state.js` to persist to DB
3. Load state on server startup
4. Test persistence across restarts

See `DEPLOYMENT.md` for detailed guide.

---

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [WebSocket Security](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Ready to deploy?** 🎉 Push to GitHub and follow the Render steps above!
