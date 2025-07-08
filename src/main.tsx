import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress specific React warnings from Recharts library (development only)
if (import.meta.env.DEV) {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    // Suppress defaultProps warnings from Recharts components
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Support for defaultProps will be removed from function components",
      ) &&
      (args[0].includes("XAxis") ||
        args[0].includes("YAxis") ||
        args[0].includes("Recharts"))
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
