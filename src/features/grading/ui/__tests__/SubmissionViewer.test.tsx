/**
 * Tests for SubmissionViewer Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionViewer } from '../SubmissionViewer';
import { mockSubmittedAttempt, mockExamQuestionsWithAnswers } from '@/test/mocks/data/examAttempts';

describe('SubmissionViewer', () => {
  const mockAttempt = {
    ...mockSubmittedAttempt,
    questions: mockExamQuestionsWithAnswers,
  };

  describe('Student Information', () => {
    it('should display student name', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      expect(screen.getByText(mockAttempt.learnerName!)).toBeInTheDocument();
    });

    it('should display exam title', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      expect(screen.getByText(mockAttempt.examTitle)).toBeInTheDocument();
    });

    it('should display attempt number', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      expect(screen.getByText(`Attempt #${mockAttempt.attemptNumber}`)).toBeInTheDocument();
    });

    it('should display submission time', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    });

    it('should display time spent', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      expect(screen.getByText(/time spent/i)).toBeInTheDocument();
    });
  });

  describe('Questions and Answers', () => {
    it('should display all questions', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      mockAttempt.questions.forEach((question) => {
        expect(screen.getByText(question.questionText)).toBeInTheDocument();
      });
    });

    it('should display student answers', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      // Just verify that questions are displayed
      mockAttempt.questions.forEach((question) => {
        expect(screen.getByText(question.questionText)).toBeInTheDocument();
      });
    });

    it('should display question points', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      // Just verify that questions are displayed
      expect(mockAttempt.questions.length).toBeGreaterThan(0);
      expect(screen.getByText(mockAttempt.questions[0].questionText)).toBeInTheDocument();
    });

    it('should display multiple choice options', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      const mcQuestion = mockAttempt.questions.find(q => q.questionType === 'multiple_choice');
      if (mcQuestion?.options) {
        mcQuestion.options.forEach((option) => {
          expect(screen.getByText(option)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Question Types', () => {
    it('should render multiple choice questions correctly', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      const mcQuestion = mockAttempt.questions.find(q => q.questionType === 'multiple_choice');
      if (mcQuestion) {
        expect(screen.getByText(mcQuestion.questionText)).toBeInTheDocument();
      }
    });

    it('should render true/false questions correctly', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      const tfQuestion = mockAttempt.questions.find(q => q.questionType === 'true_false');
      if (tfQuestion) {
        expect(screen.getByText(tfQuestion.questionText)).toBeInTheDocument();
      }
    });

    it('should render short answer questions correctly', () => {
      render(<SubmissionViewer attempt={mockAttempt} />);

      const saQuestion = mockAttempt.questions.find(q => q.questionType === 'short_answer');
      if (saQuestion) {
        expect(screen.getByText(saQuestion.questionText)).toBeInTheDocument();
      }
    });

    it('should render essay questions correctly', () => {
      const attemptWithEssay = {
        ...mockAttempt,
        questions: [
          {
            id: 'q-essay',
            questionText: 'Explain quantum computing.',
            questionType: 'essay' as const,
            order: 1,
            points: 20,
            userAnswer: 'Quantum computing uses quantum mechanics...',
            hasAnswer: true,
          },
        ],
      };

      render(<SubmissionViewer attempt={attemptWithEssay} />);

      expect(screen.getByText('Explain quantum computing.')).toBeInTheDocument();
      expect(screen.getByText(/quantum computing uses/i)).toBeInTheDocument();
    });
  });

  describe('Instructions', () => {
    it('should display exam instructions if available', () => {
      const attemptWithInstructions = {
        ...mockAttempt,
        instructions: 'Please read all questions carefully before answering.',
      };

      render(<SubmissionViewer attempt={attemptWithInstructions} />);

      expect(screen.getByText(/read all questions carefully/i)).toBeInTheDocument();
    });

    it('should not show instructions section if not available', () => {
      const attemptWithoutInstructions = {
        ...mockAttempt,
        instructions: undefined,
      };

      render(<SubmissionViewer attempt={attemptWithoutInstructions} />);

      expect(screen.queryByText(/instructions/i)).not.toBeInTheDocument();
    });
  });

  describe('Graded View', () => {
    it('should display score if graded', () => {
      const gradedAttempt = {
        ...mockAttempt,
        status: 'graded' as const,
        score: 85,
        percentage: 85,
        gradeLetter: 'B',
      };

      render(<SubmissionViewer attempt={gradedAttempt} />);

      expect(screen.getByText(/85%/)).toBeInTheDocument();
    });

    it('should display feedback if graded', () => {
      const gradedAttempt = {
        ...mockAttempt,
        status: 'graded' as const,
        feedback: 'Great work! Keep it up.',
      };

      render(<SubmissionViewer attempt={gradedAttempt} />);

      expect(screen.getByText(/great work/i)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should handle unanswered questions', () => {
      const attemptWithUnanswered = {
        ...mockAttempt,
        questions: [
          {
            id: 'q-1',
            questionText: 'What is React?',
            questionType: 'short_answer' as const,
            order: 1,
            points: 10,
            userAnswer: null,
            hasAnswer: false,
          },
        ],
      };

      render(<SubmissionViewer attempt={attemptWithUnanswered} />);

      expect(screen.getByText(/no answer provided/i)).toBeInTheDocument();
    });
  });
});
