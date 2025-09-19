import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/responsive.css";
// import { initOneSignal } from "./modules/notifications/onesignal";

// Initialize OneSignal - temporarily disabled to fix white screen
// initOneSignal().catch(console.warn);

createRoot(document.getElementById("root")!).render(<App />);
