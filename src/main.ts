import { StrictMode } from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./lib/AuthContext";
import "./index.css";

createRoot(document.getElementById("app")!).render(
  createElement(
    StrictMode,
    null,
    createElement(AuthProvider, null, createElement(BrowserRouter, null, createElement(App))),
  ),
);
