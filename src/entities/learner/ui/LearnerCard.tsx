/**
 * LearnerCard Component
 * Displays a learner as a card
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { UserAvatar } from '@/entities/user';
import { Mail, Phone, Calendar } from 'lucide-react';
import type { LearnerListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface LearnerCardProps {
  learner: LearnerListItem;
  className?: string;
  onClick?: () => void;
}

export const LearnerCard: React.FC<LearnerCardProps> = ({ learner, className, onClick }) => {
  const cardContent = (
    <Card className={cn('h-full transition-shadow hover:shadow-lg', className)}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <UserAvatar
              firstName={learner.firstName}
              lastName={learner.lastName}
              className="h-12 w-12"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">
                {learner.firstName} {learner.lastName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Joined {format(new Date(learner.createdAt), 'MMM yyyy')}</span>
              </div>
            </div>
            <Badge variant={learner.isActive ? 'default' : 'secondary'}>
              {learner.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {learner.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{learner.email}</span>
            </div>
          )}

          {learner.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="truncate">{learner.phoneNumber}</span>
            </div>
          )}
        </CardContent>
      </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    );
  }

  return <Link to={`/admin/learners/${learner._id}`}>{cardContent}</Link>;
};
