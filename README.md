# 🔗 ShortLink — URL Shortener System

A full-stack URL Shortener web application with click analytics and a modern dashboard. Built with **Node.js**, **Express**, and **MongoDB**.

> [!IMPORTANT]
> **Ready for deployment!** Check out the [deployment guide](file:///C:/Users/Predator/.gemini/antigravity/brain/5cb68bec-ea75-479a-b830-ee6f19e6b586/deployment_guide.md) for instructions on how to set up a "proper link" (live URL).

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-brightgreen)

---

## ✨ Features

- **Shorten URLs** — Paste a long URL and get a clean short link instantly
- **Click Analytics** — Track how many times each link is clicked
- **Dashboard** — View all your links with click counts and creation dates
- **Input Validation** — Client & server-side validation for invalid/empty URLs
- **Persistent Storage** — All data stored in MongoDB (survives restarts)
- **Modern UI** — Dark theme with glassmorphism, smooth animations, responsive design

---

## 📁 Project Structure

```
url-shortener/
├── server.js              # Express server entry point
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
├── .gitignore             # Git ignore rules
├── models/
│   └── Url.js             # Mongoose URL model
├── routes/
│   └── url.js             # API routes (shorten, get all)
├── utils/
│   └── generateCode.js    # Short code generator (nanoid)
└── public/
    ├── index.html          # Home page (shorten URLs)
    ├── dashboard.html      # Dashboard page (analytics)
    ├── css/
    │   └── style.css       # Complete stylesheet
    └── js/
        ├── app.js          # Home page logic
        └── dashboard.js    # Dashboard logic
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher — [Download](https://nodejs.org/)
- **MongoDB** — Either local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd url-shortener

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Edit the .env file with your MongoDB URI:
#   MONGO_URI=mongodb://localhost:27017/urlshortener
#   PORT=3000
#   BASE_URL=http://localhost:3000

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000**.

### Using MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Get your connection string and update `.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/urlshortener
   ```

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                              |
|--------|--------------------|------------------------------------------|
| POST   | `/api/url/shorten` | Create a shortened URL                   |
| GET    | `/api/url/all`     | Get all URLs with analytics              |
| GET    | `/:code`           | Redirect to original URL (+ track click) |

### Example: Shorten a URL

```bash
curl -X POST http://localhost:3000/api/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://www.example.com/very/long/url",
    "shortUrl": "http://localhost:3000/aBc4567",
    "shortCode": "aBc4567",
    "clicks": 0,
    "createdAt": "2026-03-09T04:00:00.000Z"
  }
}
```

---

## 🌐 Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [Render](https://render.com/) and create a **New Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in the Render dashboard:
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `PORT` — `3000` (Render auto-assigns, but useful as fallback)
   - `BASE_URL` — Your Render URL (e.g., `https://your-app.onrender.com`)
6. Click **Deploy**

### Deploy to Vercel

> **Note:** Vercel is optimized for serverless functions. For a traditional Express app, Render is recommended. To deploy on Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Create a `vercel.json` in the project root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "server.js" }
     ]
   }
   ```
3. Run `vercel` and follow the prompts
4. Set environment variables in the Vercel dashboard

---

## 🛠️ Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | HTML, CSS, JavaScript |
| Backend   | Node.js, Express   |
| Database  | MongoDB, Mongoose  |
| Shortener | nanoid             |
| Validator | valid-url          |

---

## 📝 License

MIT License — feel free to use this project for any purpose.
