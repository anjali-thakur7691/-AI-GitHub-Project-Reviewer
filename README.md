
<div align="center">

# ⚡ CodeLens AI — Advanced Code Intelligence & Repository Auditor

<img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop" alt="CodeLens AI Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

**A state-of-the-art, enterprise-grade developer productivity platform engineered to seamlessly monitor, audit, refactor, and secure complex codebases in real time.**

[![React](https://img.shields.io/badge/React-v18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 About The Project

**CodeLens AI** is an intelligent assistant platform designed for modern software engineering teams. It bridges the gap between raw code and automated code health analysis. By combining real-time repository metrics, AI chat assistance, automated bug detection, and precise code diff visualizations, CodeLens AI empowers developers to write cleaner, safer, and more efficient code.

---

## ✨ Comprehensive Features & Capabilities

* **📊 Interactive Dashboard & Health Gauge:**
  * Real-time circular health score meter (e.g., 94/100 code quality rating).
  * Instant metrics tracking for code smells, technical debt, and memory leak warnings.

* **🔍 Issues & Fix Suggestions Viewer:**
  * Automated scanning and categorization of critical errors, warnings, and code smells.
  * **Interactive Code Diff Viewer:** Side-by-side comparison tool highlighting exact modifications (`Original / Before` vs `Optimized / After`) with custom color-coded syntax highlights.

* **🛡️ Security & Vulnerability Audit:**
  * Deep scans across dependency trees and code layers to detect security risks and exposed API credentials.

* **🤖 AI Chat Assistant with Quick Action Chips:**
  * Fully responsive conversational AI interface equipped with rapid prompt shortcuts (*"🔍 Explain this error log"*, *"⚡ Optimize performance"*, *"🛡️ Check security"*, *"🧪 Write unit tests"*).

* **📦 Tech Stack & Dependency Analyzer:**
  * Complete, organized inventory of frameworks, libraries, plugins, and tools powering the repository.

* **📄 Markdown Exportable Audit Reports:**
  * One-click client-side report generator utilizing Blob APIs to export detailed code health sheets directly as downloadable `.md` files.

* **🌓 Persistent Dark/Light Mode Theme:**
  * Fully integrated responsive styling with smooth custom keyframe animations and persistent local storage theme switching.

---

## 🛠️ Complete Tech Stack & Tools Used

Yahan aapke project mein use hone wali har ek technology aur library ki complete list di gayi hai:

| Category | Technology / Library | Purpose / Role |
| :--- | :--- | :--- |
| **Frontend Core** | React.js (v18+) | Component-based UI architecture & virtual DOM rendering |
| **Build System** | Vite | Lightning-fast module bundling & Hot Module Replacement (HMR) |
| **Styling Framework** | Tailwind CSS | Utility-first responsive styling, custom animations & dark mode |
| **Iconography** | Lucide React | Modern, clean, scalable vector icons across all app views |
| **State & Storage** | React Hooks (`useState`, `useEffect`) | Local state management & persistent UI preferences |
| **Diff Engine** | Custom Code Diff UI | Side-by-side comparison of code refactoring results |
| **Export Engine** | Browser Blob API | Client-side generation and downloading of `.md` reports |

---

## 📂 Project Architecture & Folder Structure

Aapke project ka complete directory structure aur file organization kuch is tarah hai:

```text
codelens-ai/
├── 📁 public/                 # Static assets, icons, and favicon
├── 📁 src/
│   ├── 📁 components/         # Reusable modular UI components
│   │   ├── CodeDiffViewer.jsx # Side-by-side code changes diff tool
│   │   ├── HealthGauge.jsx    # Circular code health score meter
│   │   ├── Navbar.jsx         # Top navigation bar with theme toggle & actions
│   │   └── Sidebar.jsx        # Navigation sidebar for switching views
│   ├── 📁 data/               # Mock data sources & repository configs
│   │   └── mockData.js        # Repository issues, code snippets, and metrics
│   ├── 📁 views/              # Main page views / routing screens
│   │   ├── AuthView.jsx       # Authentication & login screen
│   │   ├── ChatView.jsx       # AI assistant chat interface with quick prompt chips
│   │   ├── DashboardView.jsx  # Main summary and repository health overview
│   │   ├── FixSuggestionView.jsx# AI-recommended code fixes & diff previews
│   │   ├── IssuesView.jsx     # Detected bugs, warnings, and code smells list
│   │   ├── LandingView.jsx    # Welcome and product introduction screen
│   │   ├── ReportView.jsx     # Comprehensive audit report & Markdown report export
│   │   ├── SecurityView.jsx   # Security vulnerability audit panel
│   │   └── TechStackView.jsx  # Detected technologies and package dependencies
│   ├── App.jsx                # Main application component & layout controller
│   ├── index.css              # Global styles & Tailwind CSS directive imports
└── └── main.jsx               # React DOM entry point
```

---

### 🗺️ Visual Architecture Flow

```mermaid
graph TD
    A[main.jsx] --> B[App.jsx]
    B --> C[Navbar.jsx]
    B --> D[Sidebar.jsx]
    B --> E[Views Router]
    E --> F[DashboardView]
    E --> G[ChatView]
    E --> H[FixSuggestionView]
    E --> I[ReportView]
    F --> J[HealthGauge.jsx]
    H --> K[CodeDiffViewer.jsx]
```

---

## ⚙️ Installation & Local Setup

Apne local machine par CodeLens AI ko run karne ke liye in simple steps ko follow karein:

### 1. Prerequisites
Ensure karein ki aapke system par **Node.js** (v16 ya higher) installed hai.

### 2. Navigate to Project Directory
```bash
cd codelens-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
*Yeh command aapke browser ke liye ek local development server start karegi (e.g., `http://localhost:5173`).*

### 5. Build for Production
```bash
npm run build
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <p>Crafted with ❤️ by Anjali Thakur Prerna, Yamini, Mitali, , Kasis for advanced software code intelligence.</p>
</div>
