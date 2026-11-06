# GameStore Full-Stack Application

A lightweight full-stack game catalog management application built with **ASP.NET Core Minimal APIs** and an **Angular** frontend.

---

## 📌 Overview

**GameStore** is a full-stack web application designed to manage a library of video games and their associated genres. It provides a clean, responsive web interface backed by a RESTful API and persistent SQLite database.

---

## 🚀 Features

### Games Management
- **Catalog View**: Browse games showing name, genre, price, and release date.
- **Create & Edit**: Add new games or update existing records with validation.
- **Delete**: Remove games from the collection.

### Genres Management
- **Genre Directory**: View all active game genres.
- **Create Genres**: Add custom genres with duplicate name checks.
- **Protected Deletion**: Prevents deletion of genres currently assigned to existing games.

### Backend & Persistence
- **RESTful Minimal APIs**: Lightweight, route-grouped endpoint architecture (`/games`, `/genres`).
- **Automatic Migration & Seeding**: Database migrations apply automatically at startup, seeding default genres (Action, RPG, Multiplayer, Racing, Simulation, Story).
- **CORS Enabled**: Configured for local frontend communication (`http://localhost:4200`).

---

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET 10 (ASP.NET Core Minimal API)
- **Database**: SQLite (`GameStore.db`)
- **ORM**: Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.Sqlite`)
- **Architecture**: DTOs, Extension-based endpoint mapping, EF Migrations & Seeding

### Frontend
- **Framework**: Angular 22 (Standalone Components, Signals & Reactive patterns)
- **Language**: TypeScript
- **Styling / UI**: Bootstrap 5, Bootstrap Icons
- **HTTP & Routing**: Angular `@angular/router`, `HttpClient`, RxJS
- **Build / Tooling**: Angular CLI, Vite / Vitest

---

## 📁 Project Structure

```
GameProject_FullStack/
├── Data/                   # EF Core DbContext, migrations & seeding logic
├── Dtos/                   # Data Transfer Objects for API requests/responses
├── Enpoints/               # Minimal API endpoint groups (Games & Genres)
├── Models/                 # Domain entities (Game, Genre)
├── frontend/               # Angular client application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # GameList, GameForm, GenreList, Navbar
│   │   │   ├── models/     # TypeScript models & interfaces
│   │   │   └── services/   # Game and Genre HTTP API services
│   │   └── environments/   # Environment configs (API URLs)
│   └── package.json
├── GameProject.csproj      # .NET project configuration
└── Program.cs              # ASP.NET Core startup & middleware configuration
```

---

## ⚡ Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (v18+ recommended) and `npm`

### 1. Run the Backend API
```bash
# From the project root
dotnet restore
dotnet run
```
> The API will start on **`http://localhost:5114`**. SQLite migrations and seeding run automatically on launch.

### 2. Run the Frontend
```bash
# From the project root
cd frontend
npm install
npm start
```
> The Angular app will be served at **`http://localhost:4200`**.
