import { Paper, ExamType } from "../types/paper";

/* ---------- FILTER ENGINE ---------- */

export type Filters = {
  subject?: string;
  teacher?: string;
  examType?: ExamType;
  fromYear?: number;
  toYear?: number;
};

export function filterPapers(papers: Paper[], filters: Filters) {
  return papers.filter((p) => {
    if (filters.subject && p.subject !== filters.subject) return false;
    if (filters.teacher && p.teacher !== filters.teacher) return false;
    if (filters.examType && p.examType !== filters.examType) return false;

    if (filters.fromYear !== undefined && p.year < filters.fromYear)
      return false;

    if (filters.toYear !== undefined && p.year > filters.toYear)
      return false;

    return true;
  });
}

/* ---------- TOPIC AGGREGATION ---------- */

export function aggregateTopics(papers: Paper[]) {
  const map: Record<string, { questions: number; marks: number }> = {};

  papers.forEach((paper) => {
    Object.entries(paper.topics).forEach(([topic, data]) => {
      if (!map[topic]) {
        map[topic] = { questions: 0, marks: 0 };
      }

      map[topic].questions += data.questions;
      map[topic].marks += data.marks;
    });
  });

  return map;
}
