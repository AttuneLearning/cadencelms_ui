# Pattern: Type Sharing Between Entities

**Category:** Architecture
**Created:** 2026-01-29
**Tags:** #pattern #types #entities #architecture

## Problem

Multiple entities define the same type locally, leading to:
- Type drift (definitions diverge over time)
- Inconsistent capabilities (one entity has more values than another)
- Maintenance burden (changes must be made in multiple places)
- Runtime errors when types don't match API expectations

**Example Problem:**
```typescript
// Question entity - comprehensive
type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' |
                    'short_answer' | 'long_answer' | 'matching' |
                    'flashcard' | 'fill_in_blank';

// Exercise entity - incomplete (type drift!)
type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' |
                    'essay' | 'matching';
// Missing: multiple_select, flashcard, fill_in_blank, long_answer
```

## Solution

Define shared types in one authoritative entity and import into dependent entities.

```typescript
// Source entity (Question) - owns the type definition
// src/entities/question/model/types.ts
export type QuestionType =
  | 'multiple_choice' | 'multiple_select' | 'true_false'
  | 'short_answer' | 'long_answer' | 'matching'
  | 'flashcard' | 'fill_in_blank';

// Dependent entity (Exercise) - imports the type
// src/entities/exercise/model/types.ts
import type { QuestionType, FlashcardData, MatchingData } from '@/entities/question';

// Re-export for convenience if needed
export type { QuestionType };
```

## Example

```typescript
// BEFORE (Bad - duplicate definitions)
// src/entities/exercise/model/types.ts
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';

export interface ExerciseQuestion {
  questionType: QuestionType;  // Limited to local definition
  // ...
}

// AFTER (Good - shared type)
// src/entities/exercise/model/types.ts
import type {
  QuestionType,
  FlashcardData,
  MatchingData,
  MediaContent
} from '@/entities/question';

export interface ExerciseQuestion {
  questionTypes: QuestionType[];  // Full range from Question entity
  flashcardData?: FlashcardData;  // Can use related types
  matchingData?: MatchingData;
  // ...
}
```

## When to Use

- Multiple entities reference the same domain concept
- One entity is the "source of truth" for a type
- Types need to stay synchronized with API contracts
- Adding new values should automatically propagate

## When NOT to Use

- Entities are truly independent with different requirements
- Type has different semantics in different contexts
- Would create circular dependencies
- Shared type would expose internal implementation details

## Rules for Choosing Source Entity

1. **Closest to API contract** - Entity that mirrors API types
2. **Most comprehensive** - Entity with the most complete definition
3. **Most stable** - Entity least likely to change
4. **Logical ownership** - Entity that conceptually "owns" the domain

## Related Patterns

- Feature-Sliced Design (cross-layer imports)
- API Contract Types (contracts as source of truth)

## Examples in Codebase

- `src/entities/exercise/model/types.ts` - Should import from Question (UI-ISS-075)
- `src/entities/exam-attempt/model/types.ts` - Should import from Question

## Links

- Memory log: [[../memory-log]]
- Related entities: [[../entities/question-system]]
- Issue: UI-ISS-075 (Type System Alignment)
