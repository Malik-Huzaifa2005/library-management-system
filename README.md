# 📚 LibraryPro — Library Management System

A complete full-stack Library Management System built with **Node.js**, **Express**, and a **JSON file database**. No MongoDB or MySQL required!

---

## 🚀 Features

- **Books Management** — Add, view, update, delete books with full details
- **Members Management** — Register and manage library members
- **Issue / Return System** — Issue books to members and track returns
- **Search & Filter** — Search books by title/author and filter by category
- **Overdue Detection** — Highlights overdue books in the issue tracker
- **Live Dashboard** — Home page with stats, recent books, and transactions
- **Toast Notifications** — Success/error feedback on every action
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🗂️ Project Structure

```
library-management-system/
├── server.js                  # Express server entry point
├── .env                       # Environment configuration
├── package.json
├── README.md
├── API_DOCS.md                # REST API documentation
│
├── data/                      # JSON "database" files
│   ├── books.json
│   ├── users.json
│   └── issues.json
│
├── routes/                    # Express route definitions
│   ├── bookRoutes.js
│   ├── userRoutes.js
│   └── issueRoutes.js
│
├── controllers/               # Business logic for each resource
│   ├── bookController.js
│   ├── userController.js
│   └── issueController.js
│
├── middleware/                # Custom Express middleware
│   ├── logger.js              # Request logger (color-coded)
│   └── errorHandler.js        # Global error handler
│
└── public/                    # Frontend static files
    ├── index.html             # Home / Dashboard page
    ├── books.html             # Books Management page
    ├── users.html             # Members Management page
    ├── issues.html            # Issue / Return page
    ├── css/
    │   └── style.css          # Custom dark-theme CSS
    └── js/
        ├── books.js           # Books page frontend logic
        ├── users.js           # Members page frontend logic
        └── issues.js          # Issue/Return page frontend logic
```

---

## ⚙️ How to Run Locally (VS Code Step-by-Step)

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher installed
- A terminal (PowerShell, Git Bash, or VS Code integrated terminal)

### Steps

**1. Open the project folder in VS Code**
```
File → Open Folder → select `library-management-system`
```

**2. Open the integrated terminal**
```
View → Terminal  (or press Ctrl + `)
```

**3. Install dependencies**
```bash
npm install
```

**4. Start the server**
```bash
node server.js
```

**5. Open in your browser**
```
http://localhost:3000
```

That's it! 🎉 The app is running. All data is stored in the `data/` folder as JSON files.

---

## 🔄 For Development (Auto-Restart on Save)

Install nodemon globally (one-time):
```bash
npm install -g nodemon
```

Then run:
```bash
npm run dev
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/users` | Get all members |
| GET | `/api/users/:id` | Get one member |
| POST | `/api/users` | Add a member |
| PUT | `/api/users/:id` | Update a member |
| DELETE | `/api/users/:id` | Delete a member |
| GET | `/api/issues` | Get all issue records |
| POST | `/api/issues` | Issue a book |
| PUT | `/api/issues/:id` | Return a book |
| DELETE | `/api/issues/:id` | Delete an issue record |
| GET | `/api/health` | Health check |

See **API_DOCS.md** for full details and query parameters.

---

## ☁️ Deployment

### Deploy to Render (Free)

1. Push your project to a **GitHub repository**
2. Go to [render.com](https://render.com) and sign up / log in
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:** Add `PORT=3000`, `NODE_ENV=production`
6. Click **Deploy**

### Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project → Deploy from GitHub Repo**
3. Select your repository
4. Railway auto-detects Node.js — it will run `npm start` automatically
5. Set environment variables: `PORT`, `NODE_ENV=production`
6. Your app gets a public URL instantly!

> **Note:** On cloud platforms, the JSON files in `data/` are reset on each deploy. For persistent storage, migrate to a database like MongoDB Atlas (free tier).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | JSON files (fs module) |
| ID Generation | uuid |
| Logging | morgan + custom middleware |
| Frontend | HTML5, CSS3, Bootstrap 5 |
| Icons | Bootstrap Icons |
| Fonts | Google Fonts (Inter) |

---

## 📝 License

MIT — free to use and modify.
