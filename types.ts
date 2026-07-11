export interface Professional {
  id: string;
  user_id: string;
  name: string;
  cargo: string;
  especialidade: string;
  foto: string;
  bio: string;
  created_at: string;
  professional_percentage: number;
  percentage_commission: number;
  link_id?: string;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  cpf: string;
  observacoes: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  contato_id: string;
  date: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM:SS
  hora_termino: string; // HH:MM:SS
  procedimento: string;
  status: string;
  valor: number;
  observacoes: string;
  criado_em: string;
  professional_name: string;
  sendConfirmMessage: boolean;
  professional_id: string;
  service_id: string;
  clinica_contatos?: Client; // Join
}

export interface Commission {
  id: string;
  appointment_id: string;
  professional_id: string;
  base_value: number;
  percentage: number;
  commission_value: number;
  status: 'Pendente' | 'Pago' | 'Cancelado';
  created_at: string;
  paid_at?: string;
  clinica_agendamentos?: Appointment; // Join
}

export interface Anamnesis {
  id: string;
  contato_id: string;
  professional_id: string;
  titulo: string;
  respostas: Record<string, any>;
  observacoes: string;
  created_at: string;
}

export interface ClinicInfo {
  id: string;
  nome_fantasia: string;
  endereco: string;
  telefone: string;
  logo_url: string;
}

export interface Service {
  id: string;
  professional_id: string;
  nome: string;
  duracao_minutos: number;
  preco: number;
  descricao: string;
  ativo: boolean;
}

export interface WorkSchedule {
  id?: string;
  professional_id: string;
  dia_semana: number; // 0-6
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

export interface AnamnesisModel {
  id: string;
  professional_id: string;
  titulo: string;
  perguntas: string[]; // Simplificado para array de strings (perguntas)
}