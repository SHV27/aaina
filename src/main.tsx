import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./v2/styles/aaina.css";

declare global {
  const __BUILD_ID__: string;
}

document.documentElement.dataset.build = __BUILD_ID__;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
