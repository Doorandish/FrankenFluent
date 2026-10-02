# 🏰 FrankenFluent

> **AI-powered German speaking & listening practice from Ansbach, Middle Franconia**

FrankenFluent is an interactive, AI-driven language learning platform designed to help learners master spoken German through immersive, real-world conversational scenarios. Grounded in CEFR standards (A2 & B1) and enriched with authentic regional context from Ansbach and Middle Franconia, FrankenFluent combines natural speech interaction, real-time error analysis, and dedicated Persian (Farsi) pedagogical explanations to break fluency barriers.

---

## ✨ Features

- 🗣️ **Interactive AI Conversation Partner**
  Engage in realistic role-play conversations tailored to everyday life, work, bureaucracy, and culture in Germany. Powered by Google Gemini with contextual memory and natural conversational turns.
- 🇮🇷 **Persian (Farsi) Pedagogical Feedback**
  Bilingual explanations and grammar tips designed specifically for Persian speakers, pinpointing nuanced grammatical differences, false friends, and pronunciation guidance.
- 🗺️ **Structured CEFR Roadmap (A2 & B1)**
  Systematic progression aligned with standard curriculum benchmarks (*Deutsch intensiv Hören & Sprechen*). Explore categorized chapters, real-life situational goals, and authentic *Redemittel* (speech phrases).
- 🎙️ **Voice Input & Natural Speech Output**
  Integrated browser speech recognition (STT) and text-to-speech (TTS) allowing hands-free conversational practice and listening comprehension drills.
- 🔍 **Intelligent Mistake Tracking & Review**
  Automatic detection of grammatical, lexical, and prepositional mistakes with actionable corrections, stored in a personalized mistake journal for spaced repetition.
- 🥨 **Franconian & Regional Cultural Flavour**
  Local Ansbach landmarks, Middle Franconian dialetical awareness (*Grüß Gott*, *Servus*, local customs), and authentic Bavarian administrative scenarios.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio / Voice:** Web Speech API (SpeechRecognition & SpeechSynthesis)
- **HTTP Client:** Axios / Fetch API

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (>= 18.0.0)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`@google/genai` / `@google/generative-ai`)

### Deployment & Tooling
- **Hosting:** [Render.com](https://render.com/) (Web Service with `render.yaml`)
- **Package Management:** NPM Workspaces / Monorepo root scripts

---

## 📂 Project Structure

```text
FrankenFluent/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── assets/             # Static assets & illustrations
│   │   ├── components/         # Reusable UI & dialogue components
│   │   ├── hooks/              # Speech & audio custom hooks
│   │   ├── pages/              # Roadmap, Practice, Mistake Review
│   │   └── services/           # Backend API integration
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Express + TypeScript application
│   ├── src/
│   │   ├── config/             # DB connection & environment setup
│   │   ├── controllers/        # Route handlers & logic
│   │   ├── models/             # Mongoose schemas (User, Session, Mistake)
│   │   ├── routes/             # REST API endpoints
│   │   ├── services/           # Gemini AI & prompt engineering
│   │   └── seeds/              # Database seeder scripts
│   ├── package.json
│   └── tsconfig.json
├── Resource/                   # Curated curriculum data
│   ├── curriculum_a2_frankenfluent.json
│   └── curriculum_b1_frankenfluent.json
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git ignore rules
├── package.json                # Monorepo scripts & orchestrator
├── render.yaml                 # Render Blueprint configuration
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project server directory (or root according to your setup) based on `.env.example`:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `10000` |
| `MONGODB_URI` | MongoDB connection connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/frankenfluent` |
| `GEMINI_API_KEY` | API key from Google AI Studio | `AIzaSy...` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/frankenfluent.git
cd frankenfluent
```

### 2. Install Dependencies
Install dependencies for both client and server from the root directory:
```bash
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env` and provide your credentials:
```bash
cp .env.example server/.env
```
Open `server/.env` and set your `MONGODB_URI` and `GEMINI_API_KEY`.

### 4. Seed the Database
Populate MongoDB with the CEFR A2 and B1 curriculum chapters, scenarios, and Redemittel:
```bash
npm run seed
```

### 5. Start Development Servers
Run the backend server and frontend client concurrently:

In terminal 1 (Backend):
```bash
npm run dev:server
```

In terminal 2 (Frontend):
```bash
npm run dev:client
```

Access the web interface at `http://localhost:5173` (or port specified by Vite). The backend API will be running at `http://localhost:10000`.

---

## ☁️ Deployment to Render.com

FrankenFluent is pre-configured for automated deployment on [Render](https://render.com) using Infrastructure-as-Code via [render.yaml](file:///Users/amir-doorandish/AntiGravity%20Projects/FrankenFluent/render.yaml).

### Steps to Deploy:
1. Push your repository to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your FrankenFluent repository. Render will automatically detect `render.yaml`.
5. Enter the required secret environment variables when prompted:
   - `MONGODB_URI`: Your production MongoDB Atlas connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
6. Click **Apply**. Render will run:
   - **Build Command:** `npm run render:build` (installs packages and compiles server & client)
   - **Start Command:** `npm run render:start` (starts the production Express server serving client static files)
7. Health checks will automatically monitor `/api/health`.

---

## 📜 Available NPM Scripts

From the root project directory:

- `npm run install:all` - Installs npm dependencies in both `server/` and `client/`.
- `npm run dev:server` - Starts the backend server in development mode with hot reload.
- `npm run dev:client` - Starts the Vite dev server for the React client.
- `npm run build` - Builds the frontend production bundle.
- `npm run seed` - Runs the curriculum database seeding script.
- `npm run render:build` - Builds both server and client for Render production deployment.
- `npm run render:start` - Starts the compiled production server.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
