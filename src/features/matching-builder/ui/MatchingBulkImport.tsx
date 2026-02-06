/**
 * MatchingBulkImport - CSV import for matching pairs with preview
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertTriangle, Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import type { BulkMatchingPairItem } from '../api/matchingBuilderApi';

// ============================================================================
// Types
// ============================================================================

interface MatchingBulkImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (pairs: BulkMatchingPairItem[], appendToExisting: boolean) => Promise<void>;
  existingPairCount: number;
  isLoading?: boolean;
}

interface ParsedPair {
  left: string;
  right: string;
  leftHints?: string[];
  rightExplanation?: string;
  isValid: boolean;
  error?: string;
}

// ============================================================================
// CSV Parser
// ============================================================================

function parseCSV(content: string): ParsedPair[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  const pairs: ParsedPair[] = [];

  // Skip header row if it looks like a header
  const startIndex =
    lines[0]?.toLowerCase().includes('left') ||
    lines[0]?.toLowerCase().includes('column')
      ? 1
      : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV values
    const values = parseCSVLine(line);

    if (values.length < 2) {
      pairs.push({
        left: values[0] || '',
        right: '',
        isValid: false,
        error: 'Missing right side value',
      });
      continue;
    }

    const left = values[0]?.trim() || '';
    const right = values[1]?.trim() || '';
    const hints = values[2]?.trim();
    const explanation = values[3]?.trim();

    if (!left) {
      pairs.push({
        left: '',
        right,
        isValid: false,
        error: 'Missing left side value',
      });
      continue;
    }

    if (!right) {
      pairs.push({
        left,
        right: '',
        isValid: false,
        error: 'Missing right side value',
      });
      continue;
    }

    // Parse hints as semicolon-separated values
    const leftHints = hints
      ? hints.split(';').map((h) => h.trim()).filter(Boolean)
      : undefined;

    pairs.push({
      left,
      right,
      leftHints,
      rightExplanation: explanation || undefined,
      isValid: true,
    });
  }

  return pairs;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

// ============================================================================
// Component
// ============================================================================

export function MatchingBulkImport({
  open,
  onClose,
  onImport,
  existingPairCount,
  isLoading = false,
}: MatchingBulkImportProps) {
  const [parsedPairs, setParsedPairs] = useState<ParsedPair[]>([]);
  const [appendToExisting, setAppendToExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validPairs = parsedPairs.filter((p) => p.isValid);
  const invalidPairs = parsedPairs.filter((p) => !p.isValid);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const pairs = parseCSV(content);

          if (pairs.length === 0) {
            setError('No matching pairs found in file');
            setParsedPairs([]);
            return;
          }

          setParsedPairs(pairs);
        } catch (err) {
          setError('Failed to parse CSV file');
          setParsedPairs([]);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setParsedPairs([]);
      };
      reader.readAsText(file);
    },
    []
  );

  const handleImport = useCallback(async () => {
    try {
      const pairsToImport: BulkMatchingPairItem[] = validPairs.map((p) => ({
        left: p.left,
        right: p.right,
        leftHints: p.leftHints,
        rightExplanation: p.rightExplanation,
      }));

      await onImport(pairsToImport, appendToExisting);
    } catch (err) {
      setError('Failed to import pairs');
    }
  }, [validPairs, appendToExisting, onImport]);

  const handleClose = useCallback(() => {
    setParsedPairs([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  }, [onClose]);

  const handleDownloadTemplate = useCallback(() => {
    const template = `Left,Right,Hints (semicolon separated),Explanation
"Photosynthesis","The process by which plants convert light to energy","Biology term; Plants only",""
"Mitochondria","The powerhouse of the cell","Cell organelle","Produces ATP through cellular respiration"
"DNA","Deoxyribonucleic acid","Genetics",""`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matching-pairs-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Matching Pairs</DialogTitle>
          <DialogDescription>
            Upload a CSV file with matching pairs. Format: left,right,hints,explanation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-muted-foreground">CSV files only</span>
            </label>
          </div>

          {/* Template Download */}
          <div className="flex justify-center">
            <Button variant="link" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download template CSV
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview Table */}
          {parsedPairs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {parsedPairs.length} pairs found
                  </span>
                  {invalidPairs.length > 0 && (
                    <span className="text-destructive">
                      {invalidPairs.length} invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Left</TableHead>
                      <TableHead>Right</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedPairs.slice(0, 20).map((pair, index) => (
                      <TableRow
                        key={index}
                        className={!pair.isValid ? 'bg-destructive/10' : ''}
                      >
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {pair.left || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {pair.right || '-'}
                        </TableCell>
                        <TableCell>
                          {pair.isValid ? (
                            <span className="text-green-600 text-sm">Valid</span>
                          ) : (
                            <span className="text-destructive text-sm">
                              {pair.error}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedPairs.length > 20 && (
                  <div className="p-2 text-center text-sm text-muted-foreground border-t">
                    Showing first 20 of {parsedPairs.length} pairs
                  </div>
                )}
              </div>

              {/* Append Option */}
              {existingPairCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    checked={appendToExisting}
                    onCheckedChange={(checked) =>
                      setAppendToExisting(checked === true)
                    }
                  />
                  <Label htmlFor="append" className="text-sm">
                    Append to existing {existingPairCount} pair
                    {existingPairCount > 1 ? 's' : ''} (uncheck to replace)
                  </Label>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validPairs.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {validPairs.length} Pair{validPairs.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
