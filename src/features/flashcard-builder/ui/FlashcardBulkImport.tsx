/**
 * Flashcard Bulk Import Component
 * Import flashcards from CSV file
 */

import { useState, useCallback } from 'react';
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
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Progress } from '@/shared/ui/progress';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  X,
} from 'lucide-react';
import type { BulkFlashcardItem } from '../api/flashcardBuilderApi';

// ============================================================================
// Types
// ============================================================================

interface FlashcardBulkImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (cards: BulkFlashcardItem[], appendToExisting: boolean) => Promise<void>;
  existingCardCount: number;
  isLoading?: boolean;
}

interface ParsedCard {
  front: string;
  back: string;
  hints: string[];
  tags: string[];
  error?: string;
}

interface ParseResult {
  cards: ParsedCard[];
  errors: string[];
  validCount: number;
  invalidCount: number;
}

// ============================================================================
// CSV Parsing
// ============================================================================

function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const cards: ParsedCard[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { cards: [], errors: ['File is empty'], validCount: 0, invalidCount: 0 };
  }

  // Check for header row
  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('front') && header.includes('back');
  const startIndex = hasHeader ? 1 : 0;

  // Parse CSV, handling quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  for (let i = startIndex; i < lines.length; i++) {
    const lineNum = i + 1;
    const fields = parseCSVLine(lines[i]);

    if (fields.length < 2) {
      errors.push(`Line ${lineNum}: Must have at least front and back columns`);
      cards.push({
        front: fields[0] || '',
        back: '',
        hints: [],
        tags: [],
        error: 'Missing required fields',
      });
      continue;
    }

    const [front, back, hintsStr = '', tagsStr = ''] = fields;

    // Validate required fields
    if (!front.trim()) {
      errors.push(`Line ${lineNum}: Front text is required`);
      cards.push({
        front: '',
        back: back,
        hints: [],
        tags: [],
        error: 'Front text is required',
      });
      continue;
    }

    if (!back.trim()) {
      errors.push(`Line ${lineNum}: Back text is required`);
      cards.push({
        front: front,
        back: '',
        hints: [],
        tags: [],
        error: 'Back text is required',
      });
      continue;
    }

    // Parse hints (semicolon-separated)
    const hints = hintsStr
      .split(';')
      .map((h) => h.trim())
      .filter(Boolean);

    // Parse tags (semicolon-separated)
    const tags = tagsStr
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean);

    cards.push({
      front: front.trim(),
      back: back.trim(),
      hints,
      tags,
    });
  }

  return {
    cards,
    errors,
    validCount: cards.filter((c) => !c.error).length,
    invalidCount: cards.filter((c) => c.error).length,
  };
}

// ============================================================================
// Component
// ============================================================================

export function FlashcardBulkImport({
  open,
  onClose,
  onImport,
  existingCardCount,
  isLoading = false,
}: FlashcardBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [appendToExisting, setAppendToExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setImportError(null);

      try {
        const content = await selectedFile.text();
        const result = parseCSV(content);
        setParseResult(result);
      } catch {
        setImportError('Failed to read file. Please ensure it is a valid CSV file.');
        setParseResult(null);
      }
    },
    []
  );

  const handleImport = async () => {
    if (!parseResult || parseResult.validCount === 0) return;

    setImporting(true);
    setImportError(null);

    try {
      const validCards = parseResult.cards
        .filter((c) => !c.error)
        .map((c) => ({
          front: c.front,
          back: c.back,
          hints: c.hints.length > 0 ? c.hints : undefined,
          tags: c.tags.length > 0 ? c.tags : undefined,
        }));

      await onImport(validCards, appendToExisting);
      handleClose();
    } catch {
      setImportError('Failed to import flashcards. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setAppendToExisting(true);
    setImportError(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'front,back,hints,tags\n"What is the capital of France?","Paris","Think of the Eiffel Tower;City of Love","geography;capitals"\n"What is 2 + 2?","4","Basic arithmetic","math"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcard-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Import Flashcards from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with flashcard data. The file should have columns: front, back,
            hints (optional), tags (optional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Need a template?</span>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                disabled={isLoading || importing}
              />
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setParseResult(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4">
                {parseResult.validCount > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{parseResult.validCount} valid cards</span>
                  </div>
                )}
                {parseResult.invalidCount > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{parseResult.invalidCount} invalid cards</span>
                  </div>
                )}
              </div>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {parseResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <li>...and {parseResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              {parseResult.cards.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Front</TableHead>
                          <TableHead>Back</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parseResult.cards.map((card, index) => (
                          <TableRow key={index} className={card.error ? 'bg-destructive/10' : ''}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {card.front || <span className="text-muted-foreground italic">Empty</span>}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {card.back || <span className="text-muted-foreground italic">Empty</span>}
                            </TableCell>
                            <TableCell>
                              {card.error ? (
                                <span className="text-destructive text-xs">{card.error}</span>
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Append Option */}
              {existingCardCount > 0 && parseResult.validCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    checked={appendToExisting}
                    onCheckedChange={(checked) => setAppendToExisting(checked === true)}
                  />
                  <Label htmlFor="append" className="text-sm">
                    Append to existing {existingCardCount} flashcard{existingCardCount > 1 ? 's' : ''}
                    <span className="text-muted-foreground ml-1">
                      (uncheck to replace all)
                    </span>
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Import Error */}
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Importing flashcards...</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parseResult || parseResult.validCount === 0 || importing || isLoading}
          >
            {importing ? 'Importing...' : `Import ${parseResult?.validCount || 0} Cards`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FlashcardBulkImport;
