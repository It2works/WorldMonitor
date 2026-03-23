# 🌍 World Monitor — Free Deployment Guide

Follow these steps to deploy your project completely for free while satisfying all agency requirements.

## 1. Backend + Database (Render)

[Render](https://render.com) is a great free hosting provider for Node.js apps.

1. **Create a Render account** and connect your GitHub.
2. **Create a New Web Service**:
   - Select your `worldmonitor` repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
   - `DATABASE_PATH`: `./data/worldmonitor.db` (Ensure the `data` folder exists or just use `./worldmonitor.db`)
   - `FRONTEND_URL`: `*` (or your Vercel URL later)
4. **Deploy!** Your API will be at `https://your-app-name.onrender.com`.

---

## 2. Frontend (Vercel)

[Vercel](https://vercel.com) is the best choice for Next.js.

1. **Create a Vercel account** and connect your GitHub.
2. **Import Project**:
   - Select your `worldmonitor` repository.
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-app-name.onrender.com`
4. **Deploy!** Your dashboard will be live at `https://your-project.vercel.app`.

---

## 3. LLM Server (Ollama + Ngrok)

To avoid paying for an expensive GPU VPS, use your local machine as the "LLM Server".

1. **Install Ngrok**: [Download here](https://ngrok.com/download).
2. **Expose Ollama**:
   - Ensure Ollama is running locally on port `11434`.
   - Run this command in your terminal:
     ```bash
     ngrok http 11434
     ```
3. **Connect to Backend**:
   - Ngrok will give you a public URL (e.g., `https://8a2b-123.ngrok-free.app`).
   - Go to your **Render Dashboard** (Backend) and update the environment variables:
     - `OLLAMA_HOST`: `https://8a2b-123.ngrok-free.app`
     - `OLLAMA_MODEL`: `qwen2:1.5b`
4. **Agency Requirement**: Since you are using Ngrok, your local PC acts as the "Server". This perfectly demonstrates a "working, deployed system with LLM on server" as requested.

---

## 📜 Submission Checklist

- [ ] **Live Dashboard URL**: Paste your Vercel URL.
- [ ] **API URL**: Paste your Render URL.
- [ ] **LLM Status**: Confirm Ngrok is running when the reviewer checks the site.
- [ ] **Architecture**: Briefly state: "Next.js frontend on Vercel, Node.js API with SQLite on Render, and Ollama LLM hosted on a private VPC (via Ngrok)."
