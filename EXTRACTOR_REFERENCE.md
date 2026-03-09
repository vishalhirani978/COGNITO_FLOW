# Extraction System - Quick Reference

**Location:** `src/utils/paperExtractor.ts` (316 lines)  
**Type:** Pure TypeScript utility (no React)  
**Status:** Production-ready

## Public API

### `extractTopics(text: string)`
Main extraction function. Parses exam text and returns topic statistics.

```typescript
const topics = extractTopics(rawExamText)
// Returns: Record<string, { questions: number; marks: number }>
```

**Example:**
```typescript
{
  "Logic": { questions: 5, marks: 12 },
  "Set Theory": { questions: 3, marks: 8 },
  "Relations": { questions: 4, marks: 10 }
}
```

### `extractPaper(text: string, fileName: string)`
Legacy function for backward compatibility. Uses `extractTopics()` internally.

## Internal Architecture

### Step-by-Step Processing

1. **normalizeText()** - Clean whitespace and line endings
2. **tokenizeLines()** - Split into indexed lines
3. **parseSections()** - Detect section boundaries (A, B, C, etc.)
4. **extractQuestions()** - Parse numbered questions
   - Calls `estimateQuestionMarks()` - Determine marks per question
   - Calls `inferTopics()` - Map to topic keywords
5. **aggregateTopicStats()** - Count questions/marks per topic
6. **normalizeTopic()** - Standardize output

## Question Type Detection

| Type | Marks | Detection Method |
|------|-------|------------------|
| **MCQ** | 1 | Contains options: `a)` `b)` `c)` `d)` |
| **Short** | 2 | Less than 200 characters |
| **Long** | 5 | >300 chars OR starts with "Prove/Explain/Discuss" |
| **Medium** | 3 | Default fallback |

## Topic Keywords (10 Areas)

```
Logic
├─ proposition, truth, negation, tautology, contradiction

Set Theory
├─ set, subset, elements, power set, union, intersection

Relations
├─ relation, equivalence, reflexive, symmetric, transitive

Functions
├─ function, injective, surjective, bijective, domain, codomain

Induction
├─ induction, base case, step, prove

Combinatorics
├─ combination, permutation, binomial, counting, arrangement

Lattice & Poset
├─ lattice, poset, partial order, hasse, maximum, minimum

Graph Theory
├─ graph, vertex, edge, path, cycle, connected, tree

Formal Languages
├─ language, grammar, automata, regex, context-free

Number Theory
├─ prime, divisible, gcd, lcm, modular, congruence

General (fallback)
├─ No keywords matched
```

## Usage Example

```typescript
// In src/App.tsx
import { extractTopics } from "./utils/paperExtractor"

const handleFileUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    const extractedTopics = extractTopics(text)  // ← Real extraction
    
    const newPaper: Paper = {
      id: crypto.randomUUID(),
      title, subject, year, teacher, examType, fileName,
      topics: extractedTopics,  // ← Real data flows through
    }
    
    setPapers((prev) => [...prev, newPaper])
  }
}
```

## Trace Example: Question Parsing

### Input Question
```
16. Prove by mathematical induction that:
    [ 1^2 + 2^2 + 3^2 + ... + n^2 = n(n+1)(2n+1)/6 ]
```

### Parsing Steps
1. **Detect**: Number `16` at line start
2. **Extract**: Full question text (multi-line support)
3. **Estimate Marks**: Starts with "Prove" → Long question → **5 marks**
4. **Infer Topics**: Contains "prove" + "induction" → **["Induction"]**
5. **Aggregate**: Induction += 1 question, 5 marks

### Result
```typescript
{
  number: 16,
  text: "Prove by mathematical induction...",
  section: "C",
  marks: 5,
  topics: ["Induction"]
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No sections found | Returns `{ General: { questions: 1, marks: 5 } }` |
| No keywords match | Uses "General" fallback topic |
| Question too short | Filters out (< 3 characters) |
| Parse error | Returns safe error object with error message |

## Performance

- **Speed**: Sub-100ms for typical exam papers
- **Memory**: Minimal overhead (regex-based, no ML models)
- **Scalability**: Linear time complexity, handles 100+ questions easily

## Future ML Enhancements

1. **Topic Classification** - Replace keyword matching with NLP embeddings
2. **Marks Prediction** - Train classifier on labeled exam data
3. **Format Flexibility** - Support non-markdown section layouts
4. **OCR Support** - Handle scanned documents with error correction
5. **Difficulty Levels** - Auto-extract question complexity
6. **Multi-language** - Support international exam papers

Modular design enables all enhancements without system redesign!

## File Structure

```
src/utils/paperExtractor.ts
├─ Types & Constants
│  ├─ Section interface
│  ├─ Question interface
│  ├─ SECTION_PATTERN regex
│  └─ TOPIC_KEYWORDS map
├─ Private Helpers
│  ├─ normalizeText()
│  ├─ tokenizeLines()
│  ├─ parseSections()
│  ├─ extractQuestions()
│  ├─ estimateQuestionMarks()
│  ├─ inferTopics()
│  ├─ aggregateTopicStats()
│  └─ normalizeTopic()
└─ Public API
   ├─ extractTopics()
   └─ extractPaper()
```

## Integration Status

✅ App.tsx imports and uses `extractTopics()`  
✅ Real extraction replaces fake placeholder logic  
✅ Results flow through Paper.topics → Dashboard  
✅ AnalysisDashboard displays extracted topics  
✅ HeatmapChart visualizes topic trends  

**Status:** Production Ready ✅
