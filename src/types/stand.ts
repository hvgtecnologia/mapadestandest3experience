export type StandStatus = 'disponivel' | 'reservado' | 'vendido';

export type StandType = 'ouro' | 'prata' | 'bronze' | 'master' | 'outro' | 'bar' | 'palco' | 'area';

export interface Stand {
  id: string;
  numero: number;
  status: StandStatus;
  empresa: string | null;
  tipo: StandType;
  created_at: string;
  updated_at: string;
}

export interface Expositor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  stand_id: string;
}
