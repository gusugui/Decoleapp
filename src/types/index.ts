export type Subject = 
  | "Regulamentos de Tráfego Aéreo"
  | "Navegação Aérea"
  | "Meteorologia"
  | "Teoria de Voo"
  | "Conhecimentos Técnicos"
  | "Motores"
  | "Segurança de Voo"
  | "Fraseologia"
  | "Performance"
  | "Planejamento de Voo"
  | "Emergências"
  | "Instrumentos"
  | "Motores"
  | "Performance"
  | "Emergências"
  | "Segurança de Voo"
  | "Primeiros Socorros";

export interface Question {
  id: string;
  subject: Subject;
  topic?: string;
  statement: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  isPremium: boolean;
  totalAnswered: number;
  totalCorrect: number;
  statsBySubject: Record<string, { total: number; correct: number }>;
  createdAt: string;
}

export interface SimulationResult {
  id: string;
  userId: string;
  date: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  subject: Subject | "Simulado Completo";
  answers: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }[];
}
