import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  ConversationProvider,
} from "@elevenlabs/react";

import "./index.css";

import App from "./App";
import { DemoPage } from "./pages/DemoPage";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <ConversationProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<App />}
          />

          <Route
            path="/demo"
            element={<DemoPage />}
          />
        </Routes>
      </BrowserRouter>
    </ConversationProvider>
  </StrictMode>,
);