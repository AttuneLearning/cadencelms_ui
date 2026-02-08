/**
 * Research & Publications Section (Staff - Section 1.5)
 * Research interests (tags) + Publications (array)
 */

import { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IPublication, PublicationType } from '@/entities/user-profile/model/types';
import { Plus, Trash2, X, CheckCircle2, Loader2, BookOpen } from 'lucide-react';

interface ResearchSectionProps {
  data: {
    researchInterests?: string[];
    publications?: IPublication[];
  };
}

const publicationTypeOptions: { value: PublicationType; label: string }[] = [
  { value: 'journal-article', label: 'Journal Article' },
  { value: 'conference-paper', label: 'Conference Paper' },
  { value: 'book', label: 'Book' },
  { value: 'book-chapter', label: 'Book Chapter' },
  { value: 'other', label: 'Other' },
];

export function ResearchSection({ data }: ResearchSectionProps) {
  const [interests, setInterests] = useState<string[]>(data.researchInterests || []);
  const [newInterest, setNewInterest] = useState('');
  const [publications, setPublications] = useState<IPublication[]>(data.publications || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  const handleSaveInterests = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ researchInterests: interests });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleSavePublications = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ publications });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && newInterest.length <= 50) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      handleSaveInterests();
    }
  };

  const handleRemoveInterest = (index: number) => {
    const updated = interests.filter((_, i) => i !== index);
    setInterests(updated);
  };

  const handleAddPublication = () => {
    const newPub: IPublication = {
      title: '',
      type: 'journal-article',
      authors: '',
      venue: '',
    };
    setPublications([...publications, newPub]);
    setEditingIndex(publications.length);
  };

  const handleRemovePublication = (index: number) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  const handleUpdatePublication = (index: number, field: keyof IPublication, value: any) => {
    const updated = [...publications];
    updated[index] = { ...updated[index], [field]: value };
    setPublications(updated);
  };

  const isValidPublication = (pub: IPublication) => {
    return pub.title && pub.authors && pub.venue && pub.type;
  };

  return (
    <CollapsibleSection title="Research & Publications" defaultExpanded={false}>
      <div className="space-y-6">
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>
        )}

        {/* Research Interests */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Research Interests</h4>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {interest}
                <button
                  onClick={() => {
                    handleRemoveInterest(index);
                    handleSaveInterests();
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add research interest (max 50 chars)"
              maxLength={50}
              onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            />
            <Button onClick={handleAddInterest}>Add</Button>
          </div>
        </div>

        {/* Publications */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            Publications {publications.length > 0 && <Badge>{publications.length}</Badge>}
          </h4>

          <div className="space-y-3">
            {publications.map((pub, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <Badge variant="outline">
                      {publicationTypeOptions.find((o) => o.value === pub.type)?.label}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePublication(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                {editingIndex === index ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select
                        value={pub.type}
                        onValueChange={(value) => handleUpdatePublication(index, 'type', value as PublicationType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {publicationTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={pub.title}
                        onChange={(e) => handleUpdatePublication(index, 'title', e.target.value)}
                        placeholder="Publication title"
                        maxLength={300}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Authors *</Label>
                      <Textarea
                        value={pub.authors}
                        onChange={(e) => handleUpdatePublication(index, 'authors', e.target.value)}
                        placeholder="List all authors"
                        rows={2}
                        maxLength={500}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Venue *</Label>
                      <Input
                        value={pub.venue}
                        onChange={(e) => handleUpdatePublication(index, 'venue', e.target.value)}
                        placeholder="Journal, conference, or publisher name"
                        maxLength={200}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Publication Date</Label>
                        <Input
                          type="date"
                          value={pub.publicationDate || ''}
                          onChange={(e) => handleUpdatePublication(index, 'publicationDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>DOI</Label>
                        <Input
                          value={pub.doi || ''}
                          onChange={(e) => handleUpdatePublication(index, 'doi', e.target.value)}
                          placeholder="10.xxxx/xxxxx"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        type="url"
                        value={pub.url || ''}
                        onChange={(e) => handleUpdatePublication(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Abstract</Label>
                      <Textarea
                        value={pub.abstract || ''}
                        onChange={(e) => handleUpdatePublication(index, 'abstract', e.target.value)}
                        placeholder="Brief summary"
                        rows={3}
                        maxLength={2000}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSavePublications} disabled={!isValidPublication(pub)}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingIndex(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-semibold">{pub.title}</div>
                    <div className="text-sm text-gray-600">{pub.authors}</div>
                    <div className="text-sm text-gray-600 italic">{pub.venue}</div>
                    {pub.publicationDate && (
                      <div className="text-sm text-gray-600">
                        {new Date(pub.publicationDate).getFullYear()}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setEditingIndex(index)}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={handleAddPublication} className="w-full" disabled={editingIndex !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Publication
          </Button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
