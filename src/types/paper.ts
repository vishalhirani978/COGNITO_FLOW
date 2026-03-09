export type ExamType = "Mid" | "Final" | "Quiz" | "Other";

export type Paper = {
  id: string;
  title: string;
  subject: string;
  year: number;
  teacher: string;
  examType: ExamType;
  fileName: string;
  topics: Record<string, { questions: number; marks: number }>;
};
