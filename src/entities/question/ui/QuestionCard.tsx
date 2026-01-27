/**
 * Question Card Component
 * Displays question information in a card layout with preview
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  CheckCircle2,
  Circle,
  Tag,
  Hash,
  TrendingUp,
  Calendar,
  HelpCircle,
  FileText,
  List,
  Type,
  PenTool,
} from 'lucide-react';
import type { QuestionListItem, QuestionDetails, QuestionType } from '../model/types';

interface QuestionCardProps {
  question: QuestionListItem | QuestionDetails;
  showUsageStats?: boolean;
  onClick?: () => void;
}

export function QuestionCard({
  question,
  showUsageStats = false,
  onClick,
}: QuestionCardProps) {
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return <List className="h-4 w-4" />;
      case 'true_false':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'short_answer':
        return <Type className="h-4 w-4" />;
      case 'long_answer':
        return <FileText className="h-4 w-4" />;
      case 'fill_in_blank':
        return <PenTool className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      case 'long_answer':
        return 'Long Answer';
      case 'fill_in_blank':
        return 'Fill in the Blank';
      default:
        return type;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isClickable = !!onClick;
  const hasUsageStats = 'usageCount' in question;

  return (
    <Card
      className={isClickable ? 'cursor-pointer transition-colors hover:bg-accent' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              {getQuestionTypeIcon(question.questionTypes[0] as QuestionType)}
              <span className="truncate">{truncateText(question.questionText, 80)}</span>
            </CardTitle>
            <CardDescription className="mt-2">
              {getQuestionTypeLabel(question.questionTypes[0] as QuestionType)}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={getDifficultyBadgeColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {question.points} pts
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Answer Options Preview for Multiple Choice */}
          {(question.questionTypes[0] === 'multiple_choice' ||
            question.questionTypes[0] === 'true_false') &&
            question.options.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Options:</div>
                <div className="grid gap-1">
                  {question.options.slice(0, 4).map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                    >
                      {option.isCorrect ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate">{option.text}</span>
                    </div>
                  ))}
                  {question.options.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{question.options.length - 4} more options
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              {question.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{question.tags.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Usage Statistics */}
          {showUsageStats && hasUsageStats && (
            <div className="flex items-center gap-4 text-sm pt-2 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{question.usageCount}</div>
                  <div className="text-xs text-muted-foreground">Uses</div>
                </div>
              </div>

              {'lastUsed' in question && question.lastUsed && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Last used: {new Date(question.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explanation Preview */}
          {question.explanation && (
            <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
              {truncateText(question.explanation, 100)}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {new Date(question.createdAt).toLocaleDateString()}
            </div>
            {question.updatedAt !== question.createdAt && (
              <div>Updated {new Date(question.updatedAt).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
