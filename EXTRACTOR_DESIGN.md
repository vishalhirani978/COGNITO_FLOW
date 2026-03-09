# Extractor Design & Architecture

## System Overview

**Location:** `src/utils/paperExtractor.ts` (316 lines)

A production-quality exam paper extraction system that:
- Parses raw exam text (.txt format)
- Detects sections (A/B/C etc.)
- Extracts individual questions
- Assigns questions to topics using heuristics
- Estimates marks per question
- Aggregates per-topic statistics
- Returns: `Record<string, { questions: number; marks: number }>`

## Processing Pipeline

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

## Parsing Heuristics

### Section Detection
- **Pattern**: `## Section [A-Z] – Title (Marks)`
- Markdown-style headers for section identification
- Marks extracted from header when available
- Section boundaries detected for question extraction

### Question Detection
- **Pattern**: `1. Question text...`
- Supports multi-line questions with lookahead parsing
- Minimum length validation (filters noise)
- Ends at next question number or EOF

### Marks Estimation
| Type | Marks | Detection |
|------|-------|-----------|
| MCQ | 1 | Contains `a)`, `b)`, `c)`, `d)` or "choose"/"MCQ" |
| Short | 2 | Text length < 200 characters |
| Long | 5 | Text length > 300 chars OR starts with Prove/Explain/Discuss |
| Medium | 3 | Default fallback |

### Topic Inference (10 Categories)

1. **Logic** - proposition, truth, negation, logical, tautology, contradiction
2. **Set Theory** - set, subset, elements, power set, union, intersection
3. **Relations** - relation, equivalence, reflexive, symmetric, transitive, partial order
4. **Functions** - function, injective, surjective, bijective, domain, codomain
5. **Induction** - induction, base case, step, prove
6. **Combinatorics** - combination, permutation, binomial, counting, arrangement
7. **Lattice & Poset** - lattice, poset, partial order, hasse, maximum, minimum
8. **Graph Theory** - graph, vertex, edge, path, cycle, connected, tree
9. **Formal Languages** - language, grammar, automata, regex, context-free
10. **Number Theory** - prime, divisible, gcd, lcm, modular, congruence
11. **General** - fallback if no keywords matched

## Code Quality

- **Pure TypeScript** - No React imports
- **Modular Design** - 8 focused helper functions + 2 public APIs
- **Type-Safe** - Full TypeScript, no implicit `any`
- **Error Handling** - Try-catch with sensible fallbacks
- **Zero Compilation Errors** - Verified clean build

## Integration with App

```typescript
// In src/App.tsx
import { extractTopics } from "./utils/paperExtractor"

const handleFileUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    
    // Call real extraction
    const extractedTopics = extractTopics(text)
    
    const newPaper: Paper = {
      id: crypto.randomUUID(),
      title, subject, year, teacher, examType, fileName,
      topics: extractedTopics,  // Real extracted topics
    }
    
    setPapers((prev) => [...prev, newPaper])
  }
}
```

## Example Output

**Input:** `testing_files/Discrete Mathematics_2k25.txt`

**Output:**
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

## ML/Future Enhancement Points

The modular design is ready for:
- **NLP Enhancement**: Replace keyword matching with embeddings
- **Mark Estimation**: Train classifier on labeled papers
- **Format Flexibility**: Support non-markdown section layouts
- **OCR Integration**: Handle scanned papers with preprocessing
- **Multi-language**: Support different languages
- **Difficulty Extraction**: Auto-detect question difficulty levels

All enhancement points require only modular function replacement, not system redesign.

## Status

✅ **Production Ready**
- All tests pass
- Zero compilation errors
- Clean, maintainable code
- Ready for multi-paper analysis
