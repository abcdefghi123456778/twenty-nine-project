# 💖 A Special Gift: Personal Web App

This project was entirely made with love as a special gift for my girlfriend. Every detail has been designed and curated to create a unique and personal experience.

---

## 📘 Project Overview

This is a complete web app that includes an interactive frontend and a robust backend for file management. The site is designed to be a smooth, simple, and heartfelt experience.

Key features include:
*   A welcoming **landing page**.
*   A **gallery** to display uploaded photos, with secure Dropbox integration.
*   **Interactive games** like Memory and various puzzles to have fun together.

---

## 📁 Project Structure

The project is organized in the following structure for a clear separation between frontend and backend:
project-root/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── galleria.html
│   ├── memory.html
│   ├── puzzle_1.html
│   ├── puzzle_2.html
│   ├── ... (altri puzzle)
│   ├── assets/
│   │   └── (immagini, icone, ecc.)
│   └── style.css
└── README.md
---

## 🖥️ Technical Details

### Backend (Node.js & Express)
The backend handles the server logic and integration with external services.

*   **`server.js`**:
    *   Sets up an Express server to handle API routes.
    *   Uses **`axios`** to make HTTP requests to the Dropbox API.
    *   Enables **CORS** (`cors`) to allow secure communication between the frontend and backend.
    *   Manages upload and display operations for user-uploaded images.

*   **Main Dependencies** (`package.json`):
    *   `express`: Framework for the server.
    *   `axios`: HTTP client for API calls.
    *   `cors`: Middleware for cross-origin requests.

### 🌐 Frontend (HTML, CSS)
The user interface consists of several static pages, each with a specific purpose.

*   **HTML Pages**:
    *   `index.html`: The main page and entry point of the site.
    *   `galleria.html`: Page dedicated to displaying images.
    *   `memory.html`: Interactive Memory game.
    *   `puzzle_#.html`: Series of pages for custom puzzles.

*   **Styles and Assets**:
    *   `style.css`: Centralized stylesheet that defines the design, animations, and ensures a consistent user experience across all pages.
    *   `assets/`: Folder containing all graphic resources such as images, icons, and other media files.

---

## 🔐 Final Thoughts

Dropbox integration ensures that uploading and viewing photos is done securely and reliably. Every element of this project, from the code structure to the design, has been curated to express a personal and original thought, turning technology into a gesture of affection.
