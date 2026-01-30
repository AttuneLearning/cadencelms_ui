# Entity: Question System (Monolithic Design)

**Type:** Model
**Created:** 2026-01-29
**Tags:** #entity #question #monolithic #flashcard #matching

## Summary

The Question System uses a **monolithic design** where a single Question can support multiple presentations (quiz, flashcard, matching) without content duplication. This enables content reuse across different learning contexts while maintaining a unified authoring experience.

## Key Characteristics

- **Multi-Type Support:** `questionTypes: QuestionType[]` array allows one question to be rendered multiple ways
- **Unified Content:** `questionText` serves as prompt/front-of-card/Column A depending on context
- **Flexible Answers:** `correctAnswers: string[]` array supports single and multiple correct answers
- **Distractors:** `distractors: string[]` provides wrong answers for matching exercises
- **Type Extensions:** Optional `flashcardData` and `matchingData` for type-specific content

## Data Structure

```typescript
interface Question {
  id: string;
  questionText: string;           // Prompt / front-of-card / Column A
  questionTypes: QuestionType[];  // ['multiple_choice', 'flashcard', 'matching']
  correctAnswers: string[];       // Answers / back-of-card / Column B match
  distractors?: string[];         // Wrong answers for matching

  // Type-specific extensions
  flashcardData?: {
    prompts: string[];
    frontMedia?: MediaContent;
    backMedia?: MediaContent;
  };
  matchingData?: {
    columnAMedia?: MediaContent;
    columnBMedia?: MediaContent;
  };

  // Standard fields
  options: AnswerOption[];
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  explanation: string | null;
}
```

## Supported Question Types

| Type | Description | Uses Options | Uses Distractors |
|------|-------------|--------------|------------------|
| multiple_choice | Single correct answer | Yes | No |
| multiple_select | Multiple correct answers | Yes | No |
| true_false | Binary choice | Yes (fixed) | No |
| short_answer | Text input | No | No |
| long_answer | Essay/textarea | No | No |
| fill_in_blank | Inline blanks | No | No |
| flashcard | Front/back card | No | No |
| matching | Column A to B | No | Yes |

## Relationships

- Used by: [[../patterns/type-sharing-between-entities]]
- API Issues: API-ISS-009, API-ISS-010, API-ISS-011
- UI Issues: UI-ISS-071, UI-ISS-072, UI-ISS-075 through UI-ISS-080

## Location

**Files:**
- `src/entities/question/model/types.ts` - Type definitions
- `src/entities/question/ui/QuestionForm.tsx` - Authoring form
- `src/features/exercises/ui/QuestionRenderer.tsx` - Learner rendering

## Benefits

1. **Content Reuse:** Same content for quizzes, flashcards, and matching
2. **Unified Question Bank:** Single source of truth for all questions
3. **Consistent Authoring:** Staff learn one interface
4. **Flexible Delivery:** Render based on exercise context

## Notes

- Legacy support: `questionType?: QuestionType` (singular) maintained for backward compatibility
- Legacy support: `correctAnswer?: string` maintained for old data
- API v1.2.0 implements full monolithic design
- Exercise entity must import QuestionType from Question entity (see [[../patterns/type-sharing-between-entities]])

## Links

- Memory log: [[../memory-log]]
- Related patterns: [[../patterns/type-sharing-between-entities]]
- Migration plan: `dev_communication/plans/QUESTION_SYSTEM_MIGRATION_PLAN.md`
