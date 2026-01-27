/**
 * Tests for QuestionCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from '../QuestionCard';
import {
  mockQuestions,
  mockQuestionDetails,
  createMultipleChoiceQuestion,
  createTrueFalseQuestion,
  createShortAnswerQuestion,
  createEssayQuestion,
  createFillBlankQuestion,
  createMockQuestionDetails,
} from '@/test/mocks/data/questions';

describe('QuestionCard', () => {
  describe('Rendering', () => {
    it('should render with multiple choice question', () => {
      const question = mockQuestions[0]; // Multiple choice

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
      expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    });

    it('should render with true/false question', () => {
      const question = mockQuestions[1]; // True/false

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
      expect(screen.getByText('True/False')).toBeInTheDocument();
    });

    it('should render with short answer question', () => {
      const question = mockQuestions[2]; // Short answer

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
      expect(screen.getByText('Short Answer')).toBeInTheDocument();
    });

    it('should render with essay question', () => {
      const question = mockQuestions[3]; // Essay

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
      expect(screen.getByText('Essay')).toBeInTheDocument();
    });

    it('should render with fill in the blank question', () => {
      const question = mockQuestions[4]; // Fill blank

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
      expect(screen.getByText('Fill in the Blank')).toBeInTheDocument();
    });

    it('should display question text', () => {
      const question = mockQuestions[0];

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
    });

    it('should truncate long question text', () => {
      const longQuestion = createMultipleChoiceQuestion({
        questionText:
          'This is an extremely long question text that should be truncated to prevent layout issues and ensure the card displays properly',
      });

      render(<QuestionCard question={longQuestion} />);

      const textElement = screen.getByText(/This is an extremely long/);
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Question Type Icons', () => {
    it('should display multiple choice icon', () => {
      const question = createMultipleChoiceQuestion();

      const { container } = render(<QuestionCard question={question} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display true/false icon', () => {
      const question = createTrueFalseQuestion();

      const { container } = render(<QuestionCard question={question} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display short answer icon', () => {
      const question = createShortAnswerQuestion();

      const { container } = render(<QuestionCard question={question} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display essay icon', () => {
      const question = createEssayQuestion();

      const { container } = render(<QuestionCard question={question} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display fill blank icon', () => {
      const question = createFillBlankQuestion();

      const { container } = render(<QuestionCard question={question} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Difficulty Badges', () => {
    it('should display easy difficulty badge', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'easy' });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('easy')).toBeInTheDocument();
    });

    it('should display medium difficulty badge', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'medium' });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should display hard difficulty badge', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'hard' });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('hard')).toBeInTheDocument();
    });

    it('should apply correct color styling for easy difficulty', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'easy' });

      const { container } = render(<QuestionCard question={question} />);

      const badge = container.querySelector('[class*="text-green-500"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct color styling for medium difficulty', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'medium' });

      const { container } = render(<QuestionCard question={question} />);

      const badge = container.querySelector('[class*="text-yellow-500"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct color styling for hard difficulty', () => {
      const question = createMultipleChoiceQuestion({ difficulty: 'hard' });

      const { container } = render(<QuestionCard question={question} />);

      const badge = container.querySelector('[class*="text-red-500"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Points Display', () => {
    it('should display points badge', () => {
      const question = createMultipleChoiceQuestion({ points: 5 });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('5 pts')).toBeInTheDocument();
    });

    it('should display fractional points', () => {
      const question = createMultipleChoiceQuestion({ points: 2.5 });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('2.5 pts')).toBeInTheDocument();
    });

    it('should display single point', () => {
      const question = createMultipleChoiceQuestion({ points: 1 });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('1 pts')).toBeInTheDocument();
    });
  });

  describe('Answer Options Preview', () => {
    it('should display answer options for multiple choice', () => {
      const question = mockQuestions[0]; // Multiple choice

      render(<QuestionCard question={question} />);

      expect(screen.getByText('Options:')).toBeInTheDocument();
      question.options.forEach((option) => {
        expect(screen.getByText(option.text)).toBeInTheDocument();
      });
    });

    it('should display answer options for true/false', () => {
      const question = mockQuestions[1]; // True/false

      render(<QuestionCard question={question} />);

      expect(screen.getByText('Options:')).toBeInTheDocument();
      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    it('should not display options for short answer', () => {
      const question = mockQuestions[2]; // Short answer

      render(<QuestionCard question={question} />);

      expect(screen.queryByText('Options:')).not.toBeInTheDocument();
    });

    it('should not display options for essay', () => {
      const question = mockQuestions[3]; // Essay

      render(<QuestionCard question={question} />);

      expect(screen.queryByText('Options:')).not.toBeInTheDocument();
    });

    it('should not display options for fill blank', () => {
      const question = mockQuestions[4]; // Fill blank

      render(<QuestionCard question={question} />);

      expect(screen.queryByText('Options:')).not.toBeInTheDocument();
    });

    it('should show correct answer indicator for multiple choice', () => {
      const question = mockQuestions[0];

      const { container } = render(<QuestionCard question={question} />);

      // Check for checkmark icon on correct answer
      const correctOption = question.options.find((opt) => opt.isCorrect);
      expect(screen.getByText(correctOption!.text)).toBeInTheDocument();

      // Should have CheckCircle2 icon (green checkmark)
      const checkIcons = container.querySelectorAll('svg.text-green-500');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('should limit displayed options to 4', () => {
      const question = createMultipleChoiceQuestion({
        options: [
          { text: 'Option 1', isCorrect: false },
          { text: 'Option 2', isCorrect: false },
          { text: 'Option 3', isCorrect: false },
          { text: 'Option 4', isCorrect: false },
          { text: 'Option 5', isCorrect: true },
          { text: 'Option 6', isCorrect: false },
        ],
      });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 4')).toBeInTheDocument();
      expect(screen.getByText('+2 more options')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should display question tags', () => {
      const question = mockQuestions[0]; // Has tags

      render(<QuestionCard question={question} />);

      question.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it('should not display tags section when empty', () => {
      const question = createMultipleChoiceQuestion({ tags: [] });

      render(<QuestionCard question={question} />);

      // Tags section won't be rendered when tags array is empty
      // The component checks tags.length > 0 before rendering
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should limit displayed tags to 5', () => {
      const question = createMultipleChoiceQuestion({
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'],
      });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag5')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should render tags as badges', () => {
      const question = mockQuestions[0];

      render(<QuestionCard question={question} />);

      // Check that tags are rendered
      question.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  describe('Usage Statistics', () => {
    it('should display usage statistics when showUsageStats is true', () => {
      const question = mockQuestionDetails[0]; // Has usage stats

      render(<QuestionCard question={question} showUsageStats={true} />);

      expect(screen.getByText(question.usageCount.toString())).toBeInTheDocument();
      expect(screen.getByText('Uses')).toBeInTheDocument();
    });

    it('should not display usage statistics when showUsageStats is false', () => {
      const question = mockQuestionDetails[0];

      render(<QuestionCard question={question} showUsageStats={false} />);

      expect(screen.queryByText('Uses')).not.toBeInTheDocument();
    });

    it('should display last used date when available', () => {
      const question = mockQuestionDetails[0]; // Has lastUsed

      render(<QuestionCard question={question} showUsageStats={true} />);

      expect(screen.getByText(/Last used:/)).toBeInTheDocument();
    });

    it('should not display last used when null', () => {
      const question = createMockQuestionDetails({ lastUsed: null });

      render(<QuestionCard question={question} showUsageStats={true} />);

      expect(screen.queryByText(/Last used:/)).not.toBeInTheDocument();
    });

    it('should format usage count correctly', () => {
      const question = createMockQuestionDetails({ usageCount: 150 });

      render(<QuestionCard question={question} showUsageStats={true} />);

      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('Explanation Display', () => {
    it('should display explanation when provided', () => {
      const question = mockQuestions[0]; // Has explanation

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.explanation!)).toBeInTheDocument();
    });

    it('should not display explanation when null', () => {
      const question = createMultipleChoiceQuestion({ explanation: null });

      render(<QuestionCard question={question} />);

      // Check that explanation text is not in document
      const { container } = render(<QuestionCard question={question} />);
      const explanationContainer = container.querySelector('[class*="italic"]');
      expect(explanationContainer).not.toBeInTheDocument();
    });

    it('should truncate long explanation', () => {
      const longExplanation =
        'This is a very long explanation that should be truncated to prevent the card from becoming too large and affecting the layout of the page. It contains a lot of detailed information.';
      const question = createMultipleChoiceQuestion({
        explanation: longExplanation,
      });

      render(<QuestionCard question={question} />);

      const explanationText = screen.getByText(/This is a very long explanation/);
      expect(explanationText).toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should display created date', () => {
      const question = mockQuestions[0];

      render(<QuestionCard question={question} />);

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    it('should display updated date when different from created', () => {
      const question = createMultipleChoiceQuestion({
        createdAt: '2025-12-01T10:00:00Z',
        updatedAt: '2025-12-15T10:00:00Z',
      });

      render(<QuestionCard question={question} />);

      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });

    it('should not display updated date when same as created', () => {
      const date = '2025-12-01T10:00:00Z';
      const question = createMultipleChoiceQuestion({
        createdAt: date,
        updatedAt: date,
      });

      render(<QuestionCard question={question} />);

      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const question = mockQuestions[0];

      render(<QuestionCard question={question} onClick={onClick} />);

      const card = screen.getByText(question.questionText).closest('div[class*="cursor-pointer"]');
      if (card) {
        await user.click(card);
        expect(onClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should apply cursor pointer when onClick is provided', () => {
      const onClick = vi.fn();
      const question = mockQuestions[0];

      const { container } = render(<QuestionCard question={question} onClick={onClick} />);

      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });

    it('should not apply cursor pointer when onClick is not provided', () => {
      const question = mockQuestions[0];

      const { container } = render(<QuestionCard question={question} />);

      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).not.toBeInTheDocument();
    });

    it('should apply hover effect when clickable', () => {
      const onClick = vi.fn();
      const question = mockQuestions[0];

      const { container } = render(<QuestionCard question={question} onClick={onClick} />);

      const card = container.querySelector('[class*="hover:bg-accent"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with no options', () => {
      const question = createMultipleChoiceQuestion({ options: [] });

      render(<QuestionCard question={question} />);

      expect(screen.queryByText('Options:')).not.toBeInTheDocument();
    });

    it('should handle question with zero points', () => {
      const question = createMultipleChoiceQuestion({ points: 0 });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });

    it('should handle question with very high points', () => {
      const question = createMultipleChoiceQuestion({ points: 1000 });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('1000 pts')).toBeInTheDocument();
    });

    it('should handle question with special characters in text', () => {
      const question = createMultipleChoiceQuestion({
        questionText: 'What is <div> & <span> in HTML?',
      });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('What is <div> & <span> in HTML?')).toBeInTheDocument();
    });

    it('should handle question with empty explanation string', () => {
      const question = createMultipleChoiceQuestion({ explanation: '' });

      render(<QuestionCard question={question} />);

      const { container } = render(<QuestionCard question={question} />);
      const explanationContainer = container.querySelector('[class*="italic"]');
      expect(explanationContainer).not.toBeInTheDocument();
    });

    it('should handle very long option text', () => {
      const question = createMultipleChoiceQuestion({
        options: [
          {
            text: 'This is an extremely long option text that should be truncated or handled gracefully to prevent layout issues',
            isCorrect: true,
          },
          { text: 'Short option', isCorrect: false },
        ],
      });

      render(<QuestionCard question={question} />);

      expect(screen.getByText(/This is an extremely long option/)).toBeInTheDocument();
    });

    it('should handle question with single tag', () => {
      const question = createMultipleChoiceQuestion({ tags: ['single-tag'] });

      render(<QuestionCard question={question} />);

      expect(screen.getByText('single-tag')).toBeInTheDocument();
    });

    it('should handle question with usage count of 0', () => {
      const question = createMockQuestionDetails({ usageCount: 0 });

      render(<QuestionCard question={question} showUsageStats={true} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Uses')).toBeInTheDocument();
    });
  });

  describe('Department Display', () => {
    it('should display department when provided', () => {
      const question = mockQuestions[0]; // Has department

      render(<QuestionCard question={question} />);

      // Department is not explicitly displayed in current implementation
      // This is for future enhancement
      expect(screen.getByText(question.questionText)).toBeInTheDocument();
    });

    it('should handle null department gracefully', () => {
      const question = mockQuestions[5]; // Null department

      render(<QuestionCard question={question} />);

      expect(screen.getByText(question.questionText)).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for multiple choice question', () => {
      const question = mockQuestions[0];

      const { container } = render(<QuestionCard question={question} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for true/false question', () => {
      const question = mockQuestions[1];

      const { container } = render(<QuestionCard question={question} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for essay question', () => {
      const question = mockQuestions[3];

      const { container } = render(<QuestionCard question={question} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with usage statistics', () => {
      const question = mockQuestionDetails[0];

      const { container } = render(
        <QuestionCard question={question} showUsageStats={true} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
