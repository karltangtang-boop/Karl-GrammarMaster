
export enum Difficulty {
  Beginner = "初级",
  Intermediate = "中级",
  Advanced = "高级"
}

export enum GrammarCategory {
  RelativeClause = "定语从句",
  AdverbialClause = "状语从句",
  NonFiniteVerb = "非谓语动词",
  Conjunction = "连词",
  NounClause = "名词性从句",
  Tense = "时态"
}

export interface Option {
  id: string;
  text: string;
}

export interface Explanation {
  correctAnswer: string;
  rule: string;
  example: string;
  commonMistake: string;
  reviewLink?: string;
}

export interface Question {
  id: number;
  sentence: string; // Use "____" for blanks
  options: Option[];
  correctOptionId: string;
  difficulty: Difficulty;
  category: GrammarCategory;
  explanation: Explanation;
}

export interface UserAnswer {
  questionId: number;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
}

export interface MistakeRecord {
  questionId: number;
  consecutiveCorrect: number;
}
