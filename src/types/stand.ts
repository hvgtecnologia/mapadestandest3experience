export type StandStatus = 'disponivel' | 'reservado' | 'vendido';

export type StandType = 'ouro' | 'prata' | 'bronze' | 'master' | 'outro' | 'bar' | 'palco' | 'area';

/** Terços de um stand: A (esquerda), B (meio), C (direita). */
export type ParteId = 'A' | 'B' | 'C';

export interface Parte {
  status: StandStatus;
  empresa: string | null;
}

/** vertical = A | B | C lado a lado · horizontal = A em cima, B no meio, C embaixo */
export type Orientacao = 'vertical' | 'horizontal';

export interface StandPartes {
  A: Parte;
  B: Parte;
  C: Parte;
  /** Definida por quem divide o stand primeiro; as outras partes seguem a mesma. */
  orientacao?: Orientacao;
}

export interface Stand {
  id: string;
  numero: number;
  /** Resumo do stand. Quando dividido: 'disponivel' se algum terço está livre. */
  status: StandStatus;
  empresa: string | null;
  tipo: StandType;
  /** null/ausente = stand inteiro; preenchido = stand dividido em terços. */
  partes?: StandPartes | null;
  created_at: string;
  updated_at: string;
}

/** O que foi escolhido de um stand: ele inteiro ou alguns terços (com a orientação da divisão). */
export interface EscolhaParcial {
  partes: ParteId[];
  orientacao: Orientacao;
}
export type Escolha = 'inteiro' | EscolhaParcial;

export interface Expositor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  stand_id: string;
}
