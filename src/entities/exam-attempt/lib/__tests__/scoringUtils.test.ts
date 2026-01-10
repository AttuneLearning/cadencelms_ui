/**
 * Tests for Scoring Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculateTotalScore,
  determinePassedStatus,
  calculateAnsweredCount,
  calculateCorrectCount,
} from '../scoringUtils';
import type { ExamQuestion } from '../../model/types';

describe('scoringUtils', () => {
  const mockQuestions: ExamQuestion[] = [
    {
      id: 'q-1',
      questionText: 'Question 1',
      questionType: 'multiple_choice',
      order: 1,
      points: 10,
      scoreEarned: 10,
      isCorrect: true,
    },
    {
      id: 'q-2',
      questionText: 'Question 2',
      questionType: 'true_false',
      order: 2,
      points: 5,
      scoreEarned: 5,
      isCorrect: true,
    },
    {
      id: 'q-3',
      questionText: 'Question 3',
      questionType: 'short_answer',
      order: 3,
      points: 15,
      scoreEarned: 12,
      isCorrect: false,
    },
    {
      id: 'q-4',
      questionText: 'Question 4',
      questionType: 'essay',
      order: 4,
      points: 20,
      scoreEarned: 0,
      isCorrect: false,
    },
  ];

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(85, 100)).toBe(85);
      expect(calculatePercentage(45, 50)).toBe(90);
      expect(calculatePercentage(7, 10)).toBe(70);
    });

    it('should return 0 when maxScore is 0', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });

    it('should return 0 when score is 0', () => {
      expect(calculatePercentage(0, 100)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculatePercentage(33, 100)).toBe(33);
      expect(calculatePercentage(33.333, 100)).toBe(33.33);
      expect(calculatePercentage(66.666, 100)).toBe(66.67);
    });
  });

  describe('calculateTotalScore', () => {
    it('should calculate total score from questions', () => {
      const score = calculateTotalScore(mockQuestions);
      expect(score).toBe(27); // 10 + 5 + 12 + 0
    });

    it('should return 0 for empty questions array', () => {
      const score = calculateTotalScore([]);
      expect(score).toBe(0);
    });

    it('should handle undefined scoreEarned', () => {
      const questions: ExamQuestion[] = [
        {
          id: 'q-1',
          questionText: 'Question 1',
          questionType: 'multiple_choice',
          order: 1,
          points: 10,
        },
      ];
      const score = calculateTotalScore(questions);
      expect(score).toBe(0);
    });
  });

  describe('determinePassedStatus', () => {
    it('should return true when percentage meets passing score', () => {
      expect(determinePassedStatus(85, 70)).toBe(true);
      expect(determinePassedStatus(70, 70)).toBe(true);
    });

    it('should return false when percentage below passing score', () => {
      expect(determinePassedStatus(69, 70)).toBe(false);
      expect(determinePassedStatus(50, 70)).toBe(false);
    });

    it('should handle 100% passing score', () => {
      expect(determinePassedStatus(100, 100)).toBe(true);
      expect(determinePassedStatus(99, 100)).toBe(false);
    });

    it('should handle 0% passing score', () => {
      expect(determinePassedStatus(0, 0)).toBe(true);
      expect(determinePassedStatus(50, 0)).toBe(true);
    });
  });

  describe('calculateAnsweredCount', () => {
    it('should count questions with user answers', () => {
      const questions: ExamQuestion[] = [
        {
          id: 'q-1',
          questionText: 'Q1',
          questionType: 'multiple_choice',
          order: 1,
          points: 10,
          userAnswer: 'Answer A',
        },
        {
          id: 'q-2',
          questionText: 'Q2',
          questionType: 'multiple_choice',
          order: 2,
          points: 10,
          userAnswer: null,
        },
        {
          id: 'q-3',
          questionText: 'Q3',
          questionType: 'multiple_choice',
          order: 3,
          points: 10,
          userAnswer: 'Answer C',
        },
      ];

      const count = calculateAnsweredCount(questions);
      expect(count).toBe(2);
    });

    it('should handle empty array answers', () => {
      const questions: ExamQuestion[] = [
        {
          id: 'q-1',
          questionText: 'Q1',
          questionType: 'matching',
          order: 1,
          points: 10,
          userAnswer: [],
        },
      ];

      const count = calculateAnsweredCount(questions);
      expect(count).toBe(0);
    });

    it('should count array answers with values', () => {
      const questions: ExamQuestion[] = [
        {
          id: 'q-1',
          questionText: 'Q1',
          questionType: 'matching',
          order: 1,
          points: 10,
          userAnswer: ['A-1', 'B-2'],
        },
      ];

      const count = calculateAnsweredCount(questions);
      expect(count).toBe(1);
    });

    it('should return 0 for empty questions array', () => {
      const count = calculateAnsweredCount([]);
      expect(count).toBe(0);
    });
  });

  describe('calculateCorrectCount', () => {
    it('should count correct answers', () => {
      const count = calculateCorrectCount(mockQuestions);
      expect(count).toBe(2); // q-1 and q-2 are correct
    });

    it('should handle null isCorrect values', () => {
      const questions: ExamQuestion[] = [
        {
          id: 'q-1',
          questionText: 'Q1',
          questionType: 'essay',
          order: 1,
          points: 10,
          isCorrect: null,
        },
      ];

      const count = calculateCorrectCount(questions);
      expect(count).toBe(0);
    });

    it('should return 0 for empty questions array', () => {
      const count = calculateCorrectCount([]);
      expect(count).toBe(0);
    });
  });
});
