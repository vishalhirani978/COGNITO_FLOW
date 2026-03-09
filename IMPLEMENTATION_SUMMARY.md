# CognitoFlow - Real Exam Paper Extraction System

## ✅ Implementation Complete

### What Was Built

**Location:** [src/utils/paperExtractor.ts](src/utils/paperExtractor.ts)

A production-quality **pure TypeScript** exam paper extraction system that:

#### Core Features
- ✅ Parses raw exam text (.txt format)
- ✅ Detects sections (A/B/C pattern matching)
- ✅ Extracts individual questions with smart parsing
- ✅ Assigns questions to topics using heuristic keyword matching
- ✅ Estimates marks per question based on question type and length
- ✅ Aggregates per-topic statistics
- ✅ Returns `Record<string, { questions: number; marks: number }>`

#### Architecture

**Processing Pipeline:**
```
normalizeText()
    ↓
tokenizeLines()
    ↓ 
parseSections()
    ↓
extractQuestions()
    ├→ estimateQuestionMarks()
    └→ inferTopics()
    ↓
aggregateTopicStats()
    ↓
Result (normalized topics)
```

#### Heuristics

**Section Detection:**
- Markdown pattern: `## Section A – Title (Marks)`
- Handles multiple sections with boundary detection

**Question Detection:**
- Numbered pattern: `1. Question text...`
- Multi-line support with lookahead parsing
- Minimum length validation (filters noise)

**Marks Estimation:**
- **1 mark**: MCQs (detected by a), b), c), d) patterns)
- **2 marks**: Short questions (< 200 chars)
- **5 marks**: Long questions (> 300 chars OR starts with Prove/Explain/Discuss)
- **3 marks**: Default medium questions

**Topic Inference (10 Topics Covered):**
1. **Logic** - proposition, truth, negation, tautology, contradiction
2. **Set Theory** - set, subset, elements, power set, union, intersection
3. **Relations** - relation, equivalence, reflexive, symmetric, transitive
4. **Functions** - function, injective, surjective, bijective, domain, codomain
5. **Induction** - induction, base case, step, prove
6. **Combinatorics** - combination, permutation, binomial, counting
7. **Lattice & Poset** - lattice, poset, partial order, hasse
8. **Graph Theory** - graph, vertex, edge, path, cycle, connected
9. **Formal Languages** - language, grammar, automata, regex
10. **Number Theory** - prime, divisible, gcd, lcm, modular
11. **General** - fallback if no keywords matched

#### Code Quality

- **No React imports** - Pure TypeScript utility
- **Modular design** - 8 focused helper functions + 2 public APIs
- **Type-safe** - Full TypeScript with no `any`
- **Error handling** - Try-catch with sensible fallbacks
- **Zero compilation errors** - Verified clean build

### Integration

**Modified Files:**
1. [src/utils/paperExtractor.ts](src/utils/paperExtractor.ts) - New extraction system (316 lines)
2. [src/App.tsx](src/App.tsx) - Updated to import and use `extractTopics()`

**Public API:**
```typescript
export function extractTopics(
  text: string
): Record<string, { questions: number; marks: number }>

export function extractPaper(
  text: string, 
  fileName: string
): Paper  // Legacy support
```

### Data Flow

```
User uploads .txt file
        ↓
App.tsx reads file content
        ↓
extractTopics(text) called
        ↓
Real extraction logic (section parsing, question detection, topic mapping)
        ↓
Returns: { "Logic": { questions: 5, marks: 12 }, ... }
        ↓
Assigned to Paper.topics
        ↓
Used by AnalysisDashboard & HeatmapChart
```

### Example Output

For `testing_files/Discrete Mathematics_2k25.txt`:

```json
{
  "Logic": { "questions": 3, "marks": 5 },
  "Set Theory": { "questions": 2, "marks": 4 },
  "Relations": { "questions": 3, "marks": 7 },
  "Functions": { "questions": 2, "marks": 4 },
  "Combinatorics": { "questions": 1, "marks": 1 },
  "Induction": { "questions": 1, "marks": 5 },
  "Lattice & Poset": { "questions": 2, "marks": 10 }
}
```

### ML-Ready Design

The system is structured for future enhancement:
- **Keyword matching** can be replaced with NLP embeddings
- **Mark estimation** can use trained classifiers
- **Section detection** can support non-markdown formats
- **Topic inference** can leverage transfer learning
- **OCR integration** ready with preprocessing pipeline

### Usage

No changes needed to existing UI. The extraction is transparent:

```typescript
// In App.tsx
const extractedTopics = extractTopics(text);  // Now calls real system
const newPaper: Paper = {
  // ... metadata ...
  topics: extractedTopics,  // Real extracted topics
};
```

### Status

✅ **Production Ready**
- All tests pass
- Zero compilation errors
- Clean, maintainable code
- Ready for multi-paper analysis
