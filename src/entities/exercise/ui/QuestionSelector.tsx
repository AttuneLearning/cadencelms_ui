/**
 * QuestionSelector Component
 * Component for selecting and managing questions in an exercise
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Alert } from '@/shared/ui/alert';
import type {
  ExerciseQuestion,
  QuestionFormData,
  QuestionType,
  ExerciseDifficulty,
} from '../model/types';
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface QuestionSelectorProps {
  questions: ExerciseQuestion[];
  onAddQuestion: (question: QuestionFormData) => void;
  onRemoveQuestion: (questionId: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  isLoading = false,
  error,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<QuestionFormData>({
    questionText: '',
    questionTypes: ['multiple_choice'],
    options: ['', '', '', ''],
    correctAnswers: [''],
    points: 10,
    difficulty: 'medium',
    explanation: '',
    tags: [],
  });

  const handleSubmitNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter empty options
    const filteredOptions =
      newQuestion.questionTypes?.[0] === 'multiple_choice' || newQuestion.questionTypes?.[0] === 'matching'
        ? newQuestion.options?.filter((opt) => opt.trim() !== '')
        : undefined;

    onAddQuestion({
      ...newQuestion,
      options: filteredOptions,
    });

    // Reset form
    setNewQuestion({
      questionText: '',
      questionTypes: ['multiple_choice'],
      options: ['', '', '', ''],
      correctAnswers: [''],
      points: 10,
      difficulty: 'medium',
      explanation: '',
      tags: [],
    });
    setShowAddForm(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), ''],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions.splice(index, 1);
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const needsOptions = (type: QuestionType): boolean => {
    return type === 'multiple_choice' || type === 'matching';
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Questions Summary</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
            </span>
            <span>{totalPoints} Total Points</span>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>Create a new question for this exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitNewQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">
                  Question Text <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, questionText: e.target.value })
                  }
                  placeholder="Enter your question"
                  required
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select
                    value={newQuestion.questionTypes?.[0]}
                    onValueChange={(value: QuestionType) =>
                      setNewQuestion({ ...newQuestion, questionTypes: [value] })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="questionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="matching">Matching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value: ExerciseDifficulty) =>
                      setNewQuestion({ ...newQuestion, difficulty: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options for multiple choice/matching */}
              {needsOptions(newQuestion.questionTypes?.[0]!) && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {newQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        disabled={isLoading}
                      />
                      {newQuestion.options!.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(newQuestion.options?.length || 0) < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={isLoading}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              {/* Correct Answer */}
              {newQuestion.questionTypes?.[0] === 'true_false' ? (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Select
                    value={newQuestion.correctAnswers?.[0] as string}
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, correctAnswers: [value] })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="correctAnswer">
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">
                    Correct Answer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="correctAnswer"
                    value={newQuestion.correctAnswers?.[0] as string}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, correctAnswers: [e.target.value] })
                    }
                    placeholder="Enter correct answer"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                  min={0}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, explanation: e.target.value })
                  }
                  placeholder="Explain the correct answer"
                  disabled={isLoading}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">No questions added yet</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex items-start">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant="secondary">{question.questionTypes[0]}</Badge>
                          <Badge>{question.difficulty}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {question.points} pts
                          </span>
                        </div>
                        <p className="text-sm font-medium">{question.questionText}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveQuestion(question.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Options */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-1 pl-4 border-l-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {option === question.correctAnswers[0] ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span
                              className={cn(
                                option === question.correctAnswers[0] && 'font-medium text-green-700'
                              )}
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                        <p className="font-medium mb-1">Explanation:</p>
                        <p className="text-muted-foreground">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
