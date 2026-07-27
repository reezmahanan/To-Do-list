# 📝 TaskFlow | Advanced Glassmorphic To-Do Application

TaskFlow is a premium, feature-rich, and visually stunning productivity dashboard built with **TypeScript** and bundled with **Vite**. 

Featuring a modern glassmorphic interface, TaskFlow goes beyond basic lists to provide subtask checklists, dynamic monthly calendars, custom SVG analytics charts, browser desktop notifications, synthesized completion chimes, and LocalStorage data portability.

---

## ✨ Upgraded Features

- **🎨 Modern Glassmorphic Design** – A responsive visual dashboard utilizing HSL tailored colors, smooth blur backdrops (`backdrop-filter`), and fluid micro-animations for Light & Dark modes.
- **📅 Interactive Calendar Grid** – A monthly grid mapping task deadlines with color-coded priority indicators. Click a day cell to filter tasks due on that day.
- **📊 Weekly Analytics & SVG Graphs** – Real-time visual insights generated dynamically with inline SVG:
  - Weekly task completion chart (last 7 days).
  - Category task volume share.
  - Priority weight distribution.
- **🔔 Reminders & Volume Chimes** – Programmatic dual-tone chime sound synthesized on-the-fly using the HTML5 `AudioContext` (no asset downloads required), combined with native browser notifications for tasks due today.
- **🔁 Recurring/Repeating Tasks** – Set tasks to repeat `Daily`, `Weekly`, or `Monthly`. Completing a recurring task automatically logs it in historical analytics and generates a new copy advanced to the next period.
- **📂 Data Backup (Import/Export)** – Easily export your task list as a JSON file to transfer devices or secure backup saves, and restore them with schema validation checks.
- **💾 LocalStorage Persistence** – Automatically saves task databases and mute/theme configurations between page loads.

---

## 🖥️ Preview

![TaskFlow Screenshot](https://github.com/reezmahanan/TaskFlow/blob/main/Screenshot%20TaskFlow.png)

---

## 📦 Project Structure

```
To-Do-list/
│
├── public/                 # Static assets
│   └── todo_background.jpg # Generated workspace backdrop image
│
├── src/                    # Source files
│   ├── main.ts             # Main initialization script
│   │
│   ├── types/
│   │   └── todo.ts         # TypeScript structural interface definitions
│   │
│   ├── modules/
│   │   ├── Storage.ts      # LocalStorage persistence utility
│   │   ├── TodoService.ts  # Task business logic, analytics calculations & recurrence
│   │   ├── ThemeManager.ts # Light/Dark mode state controller
│   │   ├── SoundManager.ts # Synthesizes dual-note success audio bell chime
│   │   ├── NotificationManager.ts # Fires native desktop reminder alerts
│   │   └── UI.ts           # DOM renderer, tabs, calendars, and SVG chart graphics
│   │
│   └── styles/
│       └── main.css        # Curated HSL glassmorphism styles and dark overlays
│
├── index.html              # Entry point linking to src/main.ts
├── package.json            # Node project configuration and script commands
├── tsconfig.json           # strict TypeScript compiler options
└── README.md               # Project documentation
```

---

## 🛠️ Technologies Used

- **TypeScript** – Full type-safety, object-oriented module classes, and compiler verification.
- **Vite** – Instant HMR (Hot Module Replacement) bundler and build compiler.
- **Web Audio API** – Mathematical oscillator synthesis to play bell chime sounds.
- **Web Notification API** – Native OS-level alerts.
- **HTML5 & Vanilla CSS3** – Semantic layout and customized styling variables.
- **Font Awesome** – UI Icon set vectors.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and `npm` installed.

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/reezmahanan/To-Do-list.git
   ```
2. **Navigate to the project folder:**
   ```bash
   cd To-Do-list
   ```
3. **Install the dependencies:**
   ```bash
   npm install
   ```
4. **Start the local development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser** to the URL provided in the terminal (usually `http://localhost:5173`) to experience TaskFlow.

---

## ⚙️ Build for Production

To compile and bundle the application for static hosting (outputs to the `dist/` directory):

```bash
npm run build
```

The production assets can be deployed onto GitHub Pages, Netlify, Vercel, or any simple static host.

---

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## ⭐ Support & Feedback

If you found this upgraded project useful or inspiring, please consider giving it a ⭐ star on [GitHub](https://github.com/reezmahanan/To-Do-list)! Feel free to open a pull request or file issues for feature additions.
