/**
 * FeedbackEditor Component
 * Rich text editor for grading feedback with common snippets
 */

import { useState } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { MessageSquare, Sparkles } from 'lucide-react';

interface FeedbackEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  showSnippets?: boolean;
}

// Common feedback snippets
const FEEDBACK_SNIPPETS = [
  {
    category: 'Positive',
    snippets: [
      'Excellent work! Your answer demonstrates a strong understanding of the material.',
      'Great job! Keep up the good work.',
      'Well done! Your response is thorough and accurate.',
      'Outstanding effort! You clearly understand the concepts.',
    ],
  },
  {
    category: 'Constructive',
    snippets: [
      'Good effort! Consider reviewing the following concepts for improvement.',
      'Your answer shows understanding, but could benefit from more detail.',
      'Please review the course materials on this topic and try again.',
      'You are on the right track, but need to elaborate more on your explanation.',
    ],
  },
  {
    category: 'Needs Improvement',
    snippets: [
      'Your answer needs more detail. Please review the lesson materials.',
      'This answer is incomplete. Make sure to address all parts of the question.',
      'Please revise your answer to include specific examples or evidence.',
      'Your response does not fully answer the question. Please try again.',
    ],
  },
];

export function FeedbackEditor({
  value,
  onChange,
  label = 'Feedback',
  placeholder = 'Enter your feedback here...',
  rows = 5,
  showSnippets = true,
}: FeedbackEditorProps) {
  const [showSnippetPanel, setShowSnippetPanel] = useState(false);

  const handleSnippetClick = (snippet: string) => {
    // Append snippet to current value with a space if there's existing content
    const newValue = value ? `${value}\n\n${snippet}` : snippet;
    onChange(newValue);
    setShowSnippetPanel(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          {showSnippets && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSnippetPanel(!showSnippetPanel)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {showSnippetPanel ? 'Hide' : 'Show'} Snippets
            </Button>
          )}
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="resize-y"
        />

        {/* Character Count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length} characters</span>
          {value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="h-auto py-1 px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Snippet Panel */}
      {showSnippets && showSnippetPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Common Feedback Snippets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEEDBACK_SNIPPETS.map((category) => (
              <div key={category.category} className="space-y-2">
                <Badge variant="outline">{category.category}</Badge>
                <div className="space-y-2">
                  {category.snippets.map((snippet, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                      onClick={() => handleSnippetClick(snippet)}
                    >
                      <span className="text-sm">{snippet}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
