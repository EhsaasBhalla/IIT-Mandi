# 🖥️ Teacher AI Platform — Frontend Client

> React 18 + Vite Single Page Application (SPA) with Glassmorphism UI and Vanilla CSS.

---

## 🎨 Design System & Philosophy

- **Zero-Dependency Styling**: 100% Vanilla CSS (`index.css` & component-scoped stylesheets). No Tailwind or third-party CSS bloat.
- **Glassmorphism Aesthetic**: Translucent glass panels (`backdrop-filter: blur(12px)`), curated HSL dark mode palettes, and smooth CSS micro-interactions.
- **Live Stage Progress**: Real-time polling animation tracking the 10-stage execution pipeline.
- **Interactive Visualizations**: Interactive TKP knowledge graph and A/B test assessment comparisons.

---

## 📁 Frontend Directory Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   ├── Navbar/         # Top navigation bar with branding & quick links
│   │   ├── UploadZone/     # Drag-and-drop document upload interface
│   │   ├── StageProgress/  # 10-stage step indicator with active pulse animations
│   │   ├── TKPViewer/      # Interactive knowledge graph & lesson plan renderer
│   │   └── ABTestView/     # A/B variant side-by-side comparison
│   ├── pages/
│   │   ├── UploadPage/     # Primary file upload & language/config selector
│   │   ├── ProgressPage/   # Live polling pipeline execution screen
│   │   └── ResultsPage/    # Output viewer with tab navigation
│   ├── config.js           # API Base URL configuration
│   ├── App.jsx             # React Router routing setup
│   ├── index.css           # Global design tokens, typography & CSS variables
│   └── main.jsx            # Application root
├── vercel.json             # Vercel SPA routing rewrite configuration
├── package.json            # Scripts & dependencies
└── vite.config.js          # Vite bundler config
```

---

## 🛠️ Local Development Setup

### 1. Install Dependencies
```bash
# In Application/frontend directory:
npm install
```

### 2. Configure Environment (Optional for Local)
By default, the client points to `http://127.0.0.1:5000`.  
To customize, create a `.env.local` file:
```ini
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### 3. Start Vite Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment to Vercel

1. Push your code to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Verify Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`
7. Click **Deploy**.

> **Note on SPA Routing**: The included `vercel.json` ensures that deep URLs (like `/progress/123` or `/results/456`) rewrite correctly to `/index.html` without triggering 404 errors on page refresh.
