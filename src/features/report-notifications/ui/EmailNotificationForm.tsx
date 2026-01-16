/**
 * Email Notification Form Component
 * Quick form to enable email notifications for a specific report
 */

import React from 'react';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { Mail } from 'lucide-react';

interface EmailNotificationFormProps {
  defaultEmail?: string;
  onEmailChange?: (email: string) => void;
  onNotifyChange?: (notify: boolean) => void;
  className?: string;
}

export const EmailNotificationForm: React.FC<EmailNotificationFormProps> = ({
  defaultEmail = '',
  onEmailChange,
  onNotifyChange,
  className,
}) => {
  const [email, setEmail] = React.useState(defaultEmail);
  const [notifyMe, setNotifyMe] = React.useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    onEmailChange?.(value);
  };

  const handleNotifyChange = (checked: boolean) => {
    setNotifyMe(checked);
    onNotifyChange?.(checked);
  };

  return (
    <div className={className}>
      <div className="flex items-start gap-2">
        <Checkbox
          id="emailNotify"
          checked={notifyMe}
          onCheckedChange={handleNotifyChange}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="emailNotify" className="cursor-pointer">
              Email me when this report is ready
            </Label>
          </div>

          {notifyMe && (
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                You'll receive an email when the report completes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
