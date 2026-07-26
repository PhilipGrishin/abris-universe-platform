/**
 * Browser entry point for the Phase 0 local-first vertical slice.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Application root is missing.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
