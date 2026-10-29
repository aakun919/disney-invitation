import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* フォントは Fontsource（セルフホスト・unicode-range分割）で読み込む。外部リクエストなし */
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/shippori-mincho-b1/500.css";
import "@fontsource/shippori-mincho-b1/600.css";
import "@fontsource/zen-kaku-gothic-new/400.css";
import "@fontsource/zen-kaku-gothic-new/500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
