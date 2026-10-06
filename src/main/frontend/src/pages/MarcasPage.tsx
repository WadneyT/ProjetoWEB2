import { useCallback, useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../services/api";
import type { Marca } from "../types/Marca";

function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nome, setNome] = useState("");
  const [editando, setEditando] = useState<Marca | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [erro, setErro] = useState("");

  const carregarMarcas = useCallback(async () => {
    try {
      const resposta = await api.get<Marca[]>("/marcas");
      setMarcas(resposta.data);
      setErro("");
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível carregar as marcas."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(carregarMarcas);
  }, [carregarMarcas]);

  function iniciarCadastro() {
    setNome("");
    setEditando(null);
    setErro("");
    setMostrarFormulario(true);
  }

  function iniciarEdicao(marca: Marca) {
    setNome(marca.nome);
    setEditando(marca);
    setErro("");
    setMostrarFormulario(true);
  }

  function cancelarEdicao() {
    setMostrarFormulario(false);
    setEditando(null);
    setNome("");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    try {
      if (editando) {
        await api.put(`/marcas/${editando.codigo}`, { nome: nome.trim() });
      } else {
        await api.post("/marcas", { nome: nome.trim() });
      }
      cancelarEdicao();
      await carregarMarcas();
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível salvar a marca."));
    }
  }

  async function excluir(marca: Marca) {
    if (!window.confirm(`Excluir a marca ${marca.nome}?`)) {
      return;
    }
    setErro("");
    try {
      await api.delete(`/marcas/${marca.codigo}`);
      await carregarMarcas();
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível excluir a marca."));
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Marcas cadastradas</h2>
          <p>Organize as fabricantes disponíveis no catálogo.</p>
        </div>
        {!mostrarFormulario && (
          <button className="primary-button" onClick={iniciarCadastro} type="button">
            <span aria-hidden="true">＋</span>
            Nova marca
          </button>
        )}
      </div>

      {erro && <div className="notice error" role="alert">{erro}</div>}

      {mostrarFormulario && (
        <form className="panel form-panel" onSubmit={salvar}>
          <h3>{editando ? "Editar marca" : "Cadastrar marca"}</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="marca-nome">Nome da marca</label>
              <input
                autoFocus
                id="marca-nome"
                maxLength={100}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Toyota"
                required
                value={nome}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="secondary-button" onClick={cancelarEdicao} type="button">
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              {editando ? "Salvar alterações" : "Cadastrar marca"}
            </button>
          </div>
        </form>
      )}

      <section className="panel" aria-label="Lista de marcas">
        <div className="panel-header">
          <h3>Marcas</h3>
          <span>{marcas.length} {marcas.length === 1 ? "marca" : "marcas"}</span>
        </div>
        {carregando ? (
          <p className="loading">Carregando marcas…</p>
        ) : marcas.length === 0 ? (
          <p className="empty-state">Nenhuma marca cadastrada. Adicione a primeira para começar.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome da marca</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {marcas.map((marca) => (
                  <tr key={marca.codigo}>
                    <td>#{marca.codigo}</td>
                    <td className="vehicle-name">{marca.nome}</td>
                    <td>
                      <div className="actions">
                        <button className="icon-button" onClick={() => iniciarEdicao(marca)} type="button">
                          Editar
                        </button>
                        <button className="icon-button danger" onClick={() => void excluir(marca)} type="button">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default MarcasPage;
