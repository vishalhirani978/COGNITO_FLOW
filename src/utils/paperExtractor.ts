/**
 * Exam Paper Extraction System
 * Parses raw exam text and extracts structured topic/question data
 * Heuristic-based, ML-ready for future enhancements
 */

import { Paper, ExamType } from "../types/paper";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface Section {
  id: string; // "A", "B", "C", etc.
  title: string;
  marks: number;
  startLine: number;
  endLine: number;
  questions: Question[];
}

interface Question {
  number: number;
  text: string;
  section: string;
  marks: number;
  topics: string[]; // inferred topics
}

const SECTION_PATTERN = /^##\s*Section\s+([A-Z])\s*–?\s*(.+?)(?:\((\d+)\s*Marks?\))?/im;

const TOPIC_KEYWORDS: Record<string, string[]> = {
  Logic: ["proposition", "truth", "negation", "logical", "tautology", "contradiction"],
  "Set Theory": ["set", "subset", "elements", "power set", "union", "intersection"],
  Relations: ["relation", "equivalence", "reflexive", "symmetric", "transitive", "partial order"],
  Functions: ["function", "injective", "surjective", "bijective", "domain", "codomain"],
  Induction: ["induction", "base case", "step", "prove"],
  Combinatorics: ["combination", "permutation", "binomial", "counting", "arrangement"],
  "Lattice & Poset": ["lattice", "poset", "partial order", "hasse", "maximum", "minimum"],
  "Graph Theory": ["graph", "vertex", "edge", "path", "cycle", "connected", "tree"],
  "Formal Languages": ["language", "grammar", "automata", "regex", "context-free"],
  "Number Theory": ["prime", "divisible", "gcd", "lcm", "modular", "congruence"],
};

// ============================================================================
// PRIVATE HELPERS
// ============================================================================

/**
 * Normalize and clean text
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .trim();
}

/**
 * Split text into lines with metadata
 */
function tokenizeLines(text: string): Array<{ text: string; index: number }> {
  return text.split("\n").map((line, index) => ({
    text: line,
    index,
  }));
}

/**
 * Parse sections from text
 * Matches "## Section A – Title (Marks)"
 */
function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  const lines = tokenizeLines(text);

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].text.match(SECTION_PATTERN);
    if (match) {
      const sectionId = match[1];
      const sectionTitle = match[2]?.trim() || `Section ${sectionId}`;
      const marks = match[3] ? Number(match[3]) : 0;

      const section: Section = {
        id: sectionId,
        title: sectionTitle,
        marks,
        startLine: lines[i].index,
        endLine: 0, // will update
        questions: [],
      };

      // Find end of this section (start of next section or end of text)
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].text.match(SECTION_PATTERN)) {
          section.endLine = lines[j].index - 1;
          break;
        }
      }
      if (section.endLine === 0) section.endLine = lines.length - 1;

      sections.push(section);
    }
  }

  return sections;
}

/**
 * Extract questions from section text
 */
function extractQuestions(
  sectionText: string,
  sectionId: string
): Question[] {
  const questions: Question[] = [];

  // Match numbered questions: "1. Question text"
  // Using split approach to avoid regex exec infinite loop
  const questionMatches = sectionText.match(/^\s*\d+\.\s+.+?(?=\n\s*\d+\.|$)/gms);
  
  if (!questionMatches) return questions;

  for (const questionBlock of questionMatches) {
    const match = questionBlock.match(/^\s*(\d+)\.\s+(.+)$/ms);
    if (!match) continue;

    const number = Number(match[1]);
    const text = (match[2] || "").trim();

    if (text.length < 3) continue; // skip garbage

    const question: Question = {
      number,
      text,
      section: sectionId,
      marks: estimateQuestionMarks(text),
      topics: inferTopics(text),
    };

    questions.push(question);
  }

  return questions;
}

/**
 * Estimate marks for a question based on section structure and text length
 */
function estimateQuestionMarks(questionText: string): number {
  // MCQ indicator
  if (
    questionText.match(/^\s*a\)/) ||
    questionText.match(/^\s*\(a\)/) ||
    questionText.includes("choose") ||
    questionText.toLowerCase().includes("mcq")
  ) {
    return 1; // MCQs typically 1 mark each
  }

  // Short question (< 200 chars)
  if (questionText.length < 200) {
    return 2;
  }

  // Long question (> 300 chars, includes "prove", "explain", "discuss")
  if (
    questionText.length > 300 ||
    questionText.toLowerCase().match(/^(prove|explain|discuss|derive|show)/)
  ) {
    return 5;
  }

  return 3; // default medium question
}

/**
 * Infer topics from question text using keyword matching
 */
function inferTopics(questionText: string): string[] {
  const lowerText = questionText.toLowerCase();
  const detectedTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matches = keywords.filter((kw) => lowerText.includes(kw));
    if (matches.length > 0) {
      detectedTopics.push(topic);
    }
  }

  // Default if no keywords matched
  if (detectedTopics.length === 0) {
    detectedTopics.push("General"); // fallback
  }

  return detectedTopics;
}

/**
 * Aggregate questions by topic with statistics
 */
function aggregateTopicStats(
  questions: Question[]
): Record<string, { questions: number; marks: number }> {
  const stats: Record<string, { questions: number; marks: number }> = {};

  for (const q of questions) {
    for (const topic of q.topics) {
      if (!stats[topic]) {
        stats[topic] = { questions: 0, marks: 0 };
      }
      stats[topic].questions += 1;
      stats[topic].marks += q.marks;
    }
  }

  return stats;
}

/**
 * Normalize topic names (remove plurals, standardize)
 */
function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .replace(/s\s*$/, "") // remove trailing s
    .replace(/Theory/, "") // remove redundant suffixes
    .trim();
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Main extraction function
 * Parses raw exam text and returns structured topic/question data
 */
export function extractTopics(
  text: string
): Record<string, { questions: number; marks: number }> {
  try {
    const normalized = normalizeText(text);

    // Parse sections
    let sections = parseSections(normalized);

    // If no markdown sections found, treat entire text as one section
    if (sections.length === 0) {
      sections = [{
        id: "A",
        title: "All Questions",
        marks: 0,
        startLine: 0,
        endLine: normalized.split("\n").length - 1,
        questions: [],
      }];
    }

    // Extract questions from each section
    for (const section of sections) {
      const startIdx = section.startLine;
      const endIdx = section.endLine;
      const lines = tokenizeLines(normalized);

      const sectionText = lines
        .slice(startIdx, endIdx + 1)
        .map((l) => l.text)
        .join("\n");

      section.questions = extractQuestions(sectionText, section.id);
    }

    // Aggregate all questions
    const allQuestions = sections.flatMap((s) => s.questions);

    if (allQuestions.length === 0) {
      console.warn("No questions found in paper");
      return { General: { questions: 0, marks: 0 } };
    }

    // Build topic statistics
    const topicStats = aggregateTopicStats(allQuestions);

    // Normalize and finalize
    const result: Record<string, { questions: number; marks: number }> = {};
    for (const [topic, stats] of Object.entries(topicStats)) {
      const normalized = normalizeTopic(topic);
      result[normalized] = stats;
    }

    return Object.keys(result).length > 0
      ? result
      : { General: { questions: allQuestions.length, marks: allQuestions.length * 5 } };
  } catch (error) {
    console.error("Paper extraction error:", error);
    return { General: { questions: 0, marks: 0 } };
  }
}

/**
 * Legacy function for backward compatibility
 * Uses the new real extraction logic
 */
export function extractPaper(text: string, fileName: string): Paper {
  const subjectMatch = text.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const examMatch = text.match(/Exam:\s*(.+?)(?:\n|$)/i);
  const yearMatch = text.match(/Year:\s*(\d{4})/i);

  const subject = subjectMatch?.[1]?.trim() || "Unknown Subject";
  const examRaw = (examMatch?.[1] || "").toLowerCase();
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  let examType: ExamType = "Other";
  if (examRaw.includes("mid")) examType = "Mid";
  else if (examRaw.includes("final")) examType = "Final";
  else if (examRaw.includes("quiz")) examType = "Quiz";

  // Use new extraction logic
  const topics = extractTopics(text);

  return {
    id: crypto.randomUUID(),
    title: examMatch?.[1]?.trim() || "Exam Paper",
    subject,
    year,
    teacher: "",
    examType,
    fileName,
    topics,
  };
}
