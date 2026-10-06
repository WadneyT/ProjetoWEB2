import { useCallback, useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../services/api";
import type { Automovel, AutomovelInput } from "../types/Automovel";
import type { Marca } from "../types/Marca";

interface AutomovelForm {
  nome: string;
  modelo: string;
  dataFabricacao: string;
  quantidade: string;
  precoVenda: string;
  trioEletrico: boolean;
  marcaCodigo: string;
}

const formularioInicial: AutomovelForm = {
  nome: "",
  modelo: "",
  dataFabricacao: "",
  quantidade: "1",
  precoVenda: "",
  trioEletrico: false,
  marcaCodigo: "",
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarData(data: string | null): string {
  if (!data) {
    return "—";
  }
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function AutomoveisPage() {
  const [automoveis, setAutomoveis] = useState<Automovel[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [formulario, setFormulario] = useState<AutomovelForm>(formularioInicial);
  const [editando, setEditando] = useState<Automovel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    try {
      const [respostaAutomoveis, respostaMarcas] = await Promise.all([
        api.get<Automovel[]>("/automoveis"),
        api.get<Marca[]>("/marcas"),
      ]);
      setAutomoveis(respostaAutomoveis.data);
      setMarcas(respostaMarcas.data);
      setErro("");
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível carregar os dados da frota."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(carregarDados);
  }, [carregarDados]);

  function iniciarCadastro() {
    setFormulario({
      ...formularioInicial,
      marcaCodigo: marcas[0] ? String(marcas[0].codigo) : "",
    });
    setEditando(null);
    setErro("");
    setMostrarFormulario(true);
  }

  function iniciarEdicao(automovel: Automovel) {
    setFormulario({
      nome: automovel.nome,
      modelo: automovel.modelo,
      dataFabricacao: automovel.dataFabricacao ?? "",
      quantidade: String(automovel.quantidade),
      precoVenda: String(automovel.precoVenda),
      trioEletrico: automovel.trioEletrico,
      marcaCodigo: String(automovel.marca.codigo),
    });
    setEditando(automovel);
    setErro("");
    setMostrarFormulario(true);
  }

  function cancelarEdicao() {
    setMostrarFormulario(false);
    setEditando(null);
    setFormulario(formularioInicial);
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const dados: AutomovelInput = {
      nome: formulario.nome.trim(),
      modelo: formulario.modelo.trim(),
      dataFabricacao: formulario.dataFabricacao,
      quantidade: Number(formulario.quantidade),
      precoVenda: Number(formulario.precoVenda),
      trioEletrico: formulario.trioEletrico,
      marca: { codigo: Number(formulario.marcaCodigo) },
    };

    try {
      if (editando) {
        await api.put(`/automoveis/${editando.codigo}`, dados);
      } else {
        await api.post("/automoveis", dados);
      }
      cancelarEdicao();
      await carregarDados();
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível salvar o automóvel."));
    }
  }

  async function excluir(automovel: Automovel) {
    if (!window.confirm(`Excluir ${automovel.nome} ${automovel.modelo}?`)) {
      return;
    }
    setErro("");
    try {
      await api.delete(`/automoveis/${automovel.codigo}`);
      await carregarDados();
    } catch (error) {
      setErro(getErrorMessage(error, "Não foi possível excluir o automóvel."));
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <h2>Estoque de automóveis</h2>
          <p>Consulte e mantenha os veículos disponíveis na concessionária.</p>
        </div>
        {!mostrarFormulario && (
          <button
            className="primary-button"
            disabled={marcas.length === 0}
            onClick={iniciarCadastro}
            title={marcas.length === 0 ? "Cadastre uma marca antes de adicionar automóveis" : undefined}
            type="button"
          >
            <span aria-hidden="true">＋</span>
            Novo automóvel
          </button>
        )}
      </div>

      {erro && <div className="notice error" role="alert">{erro}</div>}

      {marcas.length === 0 && !carregando && (
        <div className="notice error" role="status">
          Cadastre uma marca antes de incluir automóveis no estoque.
        </div>
      )}

      {mostrarFormulario && (
        <form className="panel form-panel" onSubmit={salvar}>
          <h3>{editando ? "Editar automóvel" : "Cadastrar automóvel"}</h3>
          <div className="form-grid vehicle-form">
            <div className="field">
              <label htmlFor="automovel-nome">Nome</label>
              <input
                autoFocus
                id="automovel-nome"
                maxLength={100}
                onChange={(event) => setFormulario({ ...formulario, nome: event.target.value })}
                placeholder="Ex.: Corolla"
                required
                value={formulario.nome}
              />
            </div>
            <div className="field">
              <label htmlFor="automovel-modelo">Modelo</label>
              <input
                id="automovel-modelo"
                maxLength={100}
                onChange={(event) => setFormulario({ ...formulario, modelo: event.target.value })}
                placeholder="Ex.: XEi 2.0"
                required
                value={formulario.modelo}
              />
            </div>
            <div className="field">
              <label htmlFor="automovel-marca">Marca</label>
              <select
                id="automovel-marca"
                onChange={(event) => setFormulario({ ...formulario, marcaCodigo: event.target.value })}
                required
                value={formulario.marcaCodigo}
              >
                <option value="">Selecione uma marca</option>
                {marcas.map((marca) => (
                  <option key={marca.codigo} value={marca.codigo}>{marca.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="automovel-data">Data de fabricação</label>
              <input
                id="automovel-data"
                onChange={(event) => setFormulario({ ...formulario, dataFabricacao: event.target.value })}
                required
                type="date"
                value={formulario.dataFabricacao}
              />
            </div>
            <div className="field">
              <label htmlFor="automovel-quantidade">Quantidade em estoque</label>
              <input
                id="automovel-quantidade"
                min="0"
                onChange={(event) => setFormulario({ ...formulario, quantidade: event.target.value })}
                required
                type="number"
                value={formulario.quantidade}
              />
            </div>
            <div className="field">
              <label htmlFor="automovel-preco">Preço de venda (R$)</label>
              <input
                id="automovel-preco"
                min="0.01"
                onChange={(event) => setFormulario({ ...formulario, precoVenda: event.target.value })}
                required
                step="0.01"
                type="number"
                value={formulario.precoVenda}
              />
            </div>
            <label className="checkbox-field">
              <input
                checked={formulario.trioEletrico}
                onChange={(event) => setFormulario({ ...formulario, trioEletrico: event.target.checked })}
                type="checkbox"
              />
              Possui trio elétrico
            </label>
          </div>
          <div className="form-actions">
            <button className="secondary-button" onClick={cancelarEdicao} type="button">
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              {editando ? "Salvar alterações" : "Cadastrar automóvel"}
            </button>
          </div>
        </form>
      )}

      <section className="panel" aria-label="Estoque de automóveis">
        <div className="panel-header">
          <h3>Veículos</h3>
          <span>{automoveis.length} {automoveis.length === 1 ? "veículo" : "veículos"}</span>
        </div>
        {carregando ? (
          <p className="loading">Carregando estoque…</p>
        ) : automoveis.length === 0 ? (
          <p className="empty-state">Nenhum automóvel cadastrado. Adicione veículos para preencher o estoque.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Automóvel</th>
                  <th>Marca</th>
                  <th>Fabricação</th>
                  <th>Estoque</th>
                  <th>Preço de venda</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {automoveis.map((automovel) => (
                  <tr key={automovel.codigo}>
                    <td>
                      <span className="vehicle-name">{automovel.nome}</span>
                      <span className="vehicle-model">{automovel.modelo}</span>
                    </td>
                    <td>{automovel.marca.nome}</td>
                    <td>{formatarData(automovel.dataFabricacao)}</td>
                    <td><span className="stock-badge">{automovel.quantidade} un.</span></td>
                    <td>{moeda.format(automovel.precoVenda)}</td>
                    <td>
                      <div className="actions">
                        <button className="icon-button" onClick={() => iniciarEdicao(automovel)} type="button">
                          Editar
                        </button>
                        <button className="icon-button danger" onClick={() => void excluir(automovel)} type="button">
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

export default AutomoveisPage;
