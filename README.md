# 🧠 Content SEO Check (Frontend)
---
**Content SEO Check** is a hybrid-engine optimization tool that combines traditional SEO with **GEO (Generative Engine Optimization)**.  
This frontend is built with **Node.js + Express**, providing an elegant, fast UI for analyzing and improving content performance.

---

## 🚀 Features
---
- Clean and responsive UI
- Real-time content analysis with animated loader
- Mock API for development
- Ready to connect with the backend “core engine” (Python-based)
- Built with Express, Axios, and modern JavaScript
---

## 🧩 Requirements
---
Before running this project, make sure you have the following installed:

| Requirement | Minimum Version | Notes |
|--------------|-----------------|-------|
| **Node.js** | 18+ (Recommended: 22 LTS) | JavaScript runtime |
| **npm** | 8+ | Node package manager |
| **Git** | Latest | For version control |
| **Modern browser** | Chromium / Firefox / Safari | To view the app |
| *(Optional)* **Python 3.10+** | — | For backend “core engine” integration later |

---

#### Project Structure Rules
```
content-seo-check-fe/
├── public/                 # Static frontend files
│   ├── index.html          # Main HTML
│   ├── style.css           # Styles
│   └── app.js              # Frontend JS
│
├── src/                    # Optional: for future React/TS or modular JS
│   └── utils/              # Helper functions (if needed)
│
├── server/                 # Express server code
│   └── server.js           # Server entry point
│
├── .env                    # Environment variables (optional)
├── .gitignore              # Ignore node_modules, logs, env, etc.
├── package.json            # Node dependencies & scripts
└── README.md               # Project info & instructions
```

#### ⚙️ Setup Instructions
---
```bash
1️⃣ Install dependencies
npm install

2️⃣ Run the development server
npm run dev
```

The app will be available at http://localhost:3000

🔗 Environment Variables

Create a .env file (optional):

PORT=3000
CORE_ENGINE_URL=http://localhost:8000/analyze

🧬 Tech Stack

Frontend Framework: Express.js

Language: JavaScript (Node.js)

HTTP Client: Axios

Dev Tools: Nodemon, dotenv
---

### 🧠 Roadmap
---
✅ v1 — Static frontend + mock API
🔄 v2 — Connect to content-seo-check-core-engine (Python backend)
🔮 v3 — Deploy full-stack hybrid GEO+SEO analysis engine

---

# 👨‍💻 Author

Ida Bagus Wisnu Suputra
💼 LinkedIn

🌐 gustradev.com

📧 poetra.leonidas@gmail.com

🪶 License

MIT License © 2025 — Ida Bagus Wisnu Suputra

---
---
