import { useState } from "react";
import "./App.css";
import AutomoveisPage from "./pages/AutomoveisPage";
import MarcasPage from "./pages/MarcasPage";

function App() {
  const [pagina, setPagina] = useState<"automoveis" | "marcas">("automoveis");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Concessionária UEG, início">
          <span className="brand-mark">U</span>
          <span>
            <strong>UEG Motors</strong>
            <small>GESTÃO DE FROTA</small>
          </span>
        </a>

        <span className="nav-caption">GERENCIAMENTO</span>
        <nav className="main-nav" aria-label="Navegação principal">
          <button
            className={pagina === "automoveis" ? "nav-item active" : "nav-item"}
            onClick={() => setPagina("automoveis")}
            type="button"
          >
            <span aria-hidden="true">▦</span>
            Automóveis
          </button>
          <button
            className={pagina === "marcas" ? "nav-item active" : "nav-item"}
            onClick={() => setPagina("marcas")}
            type="button"
          >
            <span aria-hidden="true">◇</span>
            Marcas
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Conectado ao sistema</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">PAINEL DE CONTROLE</span>
            <h1>{pagina === "automoveis" ? "Automóveis" : "Marcas"}</h1>
          </div>
          <div className="user-badge" aria-label="Concessionária UEG">
            U
          </div>
        </header>

        {pagina === "automoveis" ? <AutomoveisPage /> : <MarcasPage />}
      </main>
    </div>
  );
}

export default App;