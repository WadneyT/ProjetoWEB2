import type { Marca } from "./Marca";

export interface Automovel {
  codigo: number;
  nome: string;
  modelo: string;
  dataFabricacao: string | null;
  quantidade: number;
  precoVenda: number;
  trioEletrico: boolean;
  marca: Marca;
}

export interface AutomovelInput {
  nome: string;
  modelo: string;
  dataFabricacao: string;
  quantidade: number;
  precoVenda: number;
  trioEletrico: boolean;
  marca: { codigo: number };
}
