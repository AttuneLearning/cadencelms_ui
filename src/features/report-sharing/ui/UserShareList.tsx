/**
 * User Share List Component
 * List of users with access to a report and controls to manage sharing
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { UserPlus, X, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface SharedUser {
  userId: string;
  userName: string;
  email: string;
  permission: 'view' | 'edit';
  sharedAt: string;
}

interface UserShareListProps {
  sharedWith: SharedUser[];
  onAddUser: (email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveUser: (userId: string) => Promise<void>;
  onUpdatePermission: (userId: string, permission: 'view' | 'edit') => Promise<void>;
  className?: string;
}

export const UserShareList: React.FC<UserShareListProps> = ({
  sharedWith,
  onAddUser,
  onRemoveUser,
  onUpdatePermission,
  className,
}) => {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [permission, setPermission] = React.useState<'view' | 'edit'>('view');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddUser = async () => {
    if (!email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      await onAddUser(email, permission);
      setEmail('');
      setPermission('view');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Add User Form */}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddUser();
            }
          }}
          className="flex-1"
        />
        <Select
          value={permission}
          onValueChange={(value) => setPermission(value as 'view' | 'edit')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="edit">Edit</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={handleAddUser}
          disabled={isAdding}
          className="flex-shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Shared Users List */}
      {sharedWith.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">People with access</p>
          <div className="space-y-2">
            {sharedWith.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.userName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Shared {format(new Date(user.sharedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.permission}
                    onValueChange={(value) =>
                      onUpdatePermission(user.userId, value as 'view' | 'edit')
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveUser(user.userId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No users added yet. Enter an email above to share this report.
          </p>
        </div>
      )}
    </div>
  );
};
