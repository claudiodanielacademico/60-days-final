import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    console.error("Failed to find the root element");
} else {
    try {
        // Basic check for Supabase keys to prevent silent failures
        const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
        const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        if (!hasUrl || !hasKey) {
            console.warn("Supabase credentials missing in environment variables.");
        }

        createRoot(rootElement).render(<App />);
    } catch (error) {
        console.error("Application crashed during mount:", error);
        rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center; color: #333;">
        <h1 style="color: #e11d48;">Ops! Erro ao carregar o aplicativo.</h1>
        <p>Houve um erro técnico durante o carregamento.</p>
        <div style="text-align: left; background: #f4f4f5; padding: 15px; border-radius: 8px; font-family: monospace; overflow: auto; max-width: 600px; margin: 20px auto; border: 1px solid #ddd;">
          ${error instanceof Error ? error.message : "Erro desconhecido"}
        </div>
        <button onclick="window.location.reload()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
          Tentar Novamente
        </button>
      </div>
    `;
    }
}
