/**
 * Scoring Utilities
 * Functions for calculating scores, percentages, and statistics
 */

import type { ExamQuestion } from '../model/types';

/**
 * Calculate percentage from score and max score
 */
export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const percentage = (score / maxScore) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total score from questions
 */
export function calculateTotalScore(questions: ExamQuestion[]): number {
  return questions.reduce((total, question) => {
    return total + (question.scoreEarned || 0);
  }, 0);
}

/**
 * Determine if attempt passed based on percentage and passing score
 */
export function determinePassedStatus(
  percentage: number,
  passingScore: number
): boolean {
  return percentage >= passingScore;
}

/**
 * Calculate number of answered questions
 */
export function calculateAnsweredCount(questions: ExamQuestion[]): number {
  return questions.filter((question) => {
    const answer = question.userAnswer;
    if (answer === null || answer === undefined) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  }).length;
}

/**
 * Calculate number of correct answers
 */
export function calculateCorrectCount(questions: ExamQuestion[]): number {
  return questions.filter((question) => question.isCorrect === true).length;
}

/**
 * Calculate number of incorrect answers
 */
export function calculateIncorrectCount(questions: ExamQuestion[]): number {
  return questions.filter((question) => question.isCorrect === false).length;
}

/**
 * Calculate number of unanswered questions
 */
export function calculateUnansweredCount(questions: ExamQuestion[]): number {
  return questions.length - calculateAnsweredCount(questions);
}

/**
 * Calculate maximum possible score from questions
 */
export function calculateMaxScore(questions: ExamQuestion[]): number {
  return questions.reduce((total, question) => total + question.points, 0);
}
