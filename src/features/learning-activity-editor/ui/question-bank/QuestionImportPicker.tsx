/**
 * Question Import Picker
 * Modal for selecting questions from the Question Bank to add to exercises/assessments
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Search, Filter, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import {
  type Question,
  type QuestionType,
  type QuestionDifficulty,
  QUESTION_TYPE_CONFIGS,
  getQuestionTypeCode,
} from '../../model/question-types';

/**
 * Mock questions for demonstration
 * In production, these would come from the API
 * Note: `types` is now an array to support multiple presentation formats
 */
const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    departmentId: 'dept1',
    bankId: 'bank1',
    bankName: 'General Knowledge',
    types: ['multiple_choice', 'short_answer'], // Can be presented as MC or SA
    text: 'What is the capital of France?',
    difficulty: 'easy',
    tags: ['geography', 'europe'],
    points: 10,
    explanation: 'Paris is the capital and largest city of France.',
    options: [
      { id: 'o1', text: 'London', isCorrect: false },
      { id: 'o2', text: 'Paris', isCorrect: true },
      { id: 'o3', text: 'Berlin', isCorrect: false },
      { id: 'o4', text: 'Madrid', isCorrect: false },
    ],
    acceptedAnswers: ['Paris', 'paris'],
    hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
    usageCount: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'q2',
    departmentId: 'dept1',
    bankId: 'bank1',
    bankName: 'General Knowledge',
    types: ['true_false'],
    text: 'The Earth revolves around the Sun.',
    difficulty: 'easy',
    tags: ['science', 'astronomy'],
    points: 5,
    explanation: 'The Earth orbits the Sun once every 365.25 days.',
    options: null,
    correctAnswer: 'true',
    hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
    usageCount: 12,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: 'q3',
    departmentId: 'dept1',
    bankId: 'bank2',
    bankName: 'Science Fundamentals',
    types: ['short_answer', 'multiple_choice'],
    text: 'What is the chemical symbol for water?',
    difficulty: 'easy',
    tags: ['chemistry', 'basics'],
    points: 10,
    explanation: 'H2O represents two hydrogen atoms and one oxygen atom.',
    options: [
      { id: 'o1', text: 'H2O', isCorrect: true },
      { id: 'o2', text: 'CO2', isCorrect: false },
      { id: 'o3', text: 'NaCl', isCorrect: false },
      { id: 'o4', text: 'O2', isCorrect: false },
    ],
    acceptedAnswers: ['H2O', 'h2o', 'H₂O'],
    hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
    usageCount: 8,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: 'q4',
    departmentId: 'dept1',
    bankId: 'bank2',
    bankName: 'Science Fundamentals',
    types: ['multiple_choice'],
    text: 'Which planet is known as the Red Planet?',
    difficulty: 'medium',
    tags: ['astronomy', 'planets'],
    points: 15,
    explanation: 'Mars appears red due to iron oxide on its surface.',
    options: [
      { id: 'o1', text: 'Venus', isCorrect: false },
      { id: 'o2', text: 'Mars', isCorrect: true },
      { id: 'o3', text: 'Jupiter', isCorrect: false },
      { id: 'o4', text: 'Saturn', isCorrect: false },
    ],
    hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
    usageCount: 3,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
  },
  {
    id: 'q5',
    departmentId: 'dept1',
    bankId: 'bank1',
    bankName: 'General Knowledge',
    types: ['long_answer', 'short_answer'],
    text: 'Explain the process of photosynthesis and its importance to life on Earth.',
    difficulty: 'hard',
    tags: ['biology', 'plants'],
    points: 25,
    explanation: null,
    options: null,
    sampleAnswer: 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen.',
    acceptedAnswers: ['photosynthesis', 'plants convert sunlight'],
    hierarchy: { parentQuestionId: null, relatedQuestionIds: [], prerequisiteQuestionIds: [], conceptTag: null, difficultyProgression: null },
    usageCount: 2,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
];

export interface QuestionImportPickerProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Department ID for filtering questions */
  departmentId: string;
  /** Callback when questions are selected for import */
  onImport: (questions: Question[]) => void;
  /** IDs of questions already linked to this activity */
  excludeQuestionIds?: string[];
  /** Whether graded (show points) or practice (no points) */
  isGraded?: boolean;
}

/**
 * Question Card for selection
 */
function QuestionCard({
  question,
  selected,
  onToggle,
  isGraded,
}: {
  question: Question;
  selected: boolean;
  onToggle: () => void;
  isGraded: boolean;
}) {
  // Get primary type (used for future enhancements like icons)

  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-colors
        ${selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
      `}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} className="mt-1" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{question.text}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Show type badges for each supported type */}
            {question.types.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {getQuestionTypeCode(type)}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className={`text-xs ${
                question.difficulty === 'easy' ? 'text-green-600' :
                question.difficulty === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}
            >
              {question.difficulty}
            </Badge>
            {isGraded && (
              <Badge variant="outline" className="text-xs">
                <Target className="mr-1 h-3 w-3" />
                {question.points} pts
              </Badge>
            )}
            {question.bankName && (
              <span className="text-xs text-muted-foreground">
                {question.bankName}
              </span>
            )}
          </div>
          {question.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {question.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{question.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        {selected && (
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

/**
 * Question Import Picker Modal
 *
 * Allows users to search, filter, and select questions from the Question Bank
 * to add to an exercise or assessment.
 */
export function QuestionImportPicker({
  open,
  onClose,
  departmentId: _departmentId,
  onImport,
  excludeQuestionIds = [],
  isGraded = false,
}: QuestionImportPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionDifficulty | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading] = useState(false);

  // Filter questions based on search and filters
  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter((q) => {
      // Exclude already linked questions
      if (excludeQuestionIds.includes(q.id)) return false;

      // Search filter
      if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter - check if question supports the filtered type
      if (typeFilter !== 'all' && !q.types.includes(typeFilter)) return false;

      // Difficulty filter
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;

      return true;
    });
  }, [searchQuery, typeFilter, difficultyFilter, excludeQuestionIds]);

  const handleToggleQuestion = useCallback((questionId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  }, [filteredQuestions, selectedIds.size]);

  const handleImport = useCallback(() => {
    const selectedQuestions = MOCK_QUESTIONS.filter((q) => selectedIds.has(q.id));
    onImport(selectedQuestions);
    setSelectedIds(new Set());
    onClose();
  }, [selectedIds, onImport, onClose]);

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setTypeFilter('all');
    setDifficultyFilter('all');
    onClose();
  }, [onClose]);

  const totalSelectedPoints = useMemo(() => {
    return MOCK_QUESTIONS
      .filter((q) => selectedIds.has(q.id))
      .reduce((sum, q) => sum + q.points, 0);
  }, [selectedIds]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Import from Question Bank
          </DialogTitle>
          <DialogDescription>
            Select questions to add to your {isGraded ? 'assessment' : 'exercise'}
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as QuestionType | 'all')}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(QUESTION_TYPE_CONFIGS).map((config) => (
                  <SelectItem key={config.type} value={config.type}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as QuestionDifficulty | 'all')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection summary */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0}
                onCheckedChange={handleSelectAll}
              />
              Select All
            </label>
            <span className="text-sm text-muted-foreground">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} available
            </span>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">
                {selectedIds.size} selected
              </Badge>
              {isGraded && (
                <Badge variant="outline">
                  <Target className="mr-1 h-3 w-3" />
                  {totalSelectedPoints} pts
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No questions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selected={selectedIds.has(question.id)}
                  onToggle={() => handleToggleQuestion(question.id)}
                  isGraded={isGraded}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={selectedIds.size === 0}>
            Import {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuestionImportPicker;
