/**
 * Feed Color Map
 * Maps semantic FeedColor tokens to concrete Tailwind classes for dots, chips, and bars.
 */

import type { FeedColor } from '../model/types';

export interface FeedColorClasses {
  /** Small dot indicator in day cells */
  dot: string;
  /** Chip/badge in sidebar event list */
  chip: string;
  /** Horizontal span bar in grid overlay */
  bar: string;
  /** Text color for bar label */
  barText: string;
}

export const FEED_COLOR_MAP: Record<FeedColor, FeedColorClasses> = {
  primary: {
    dot: 'bg-primary',
    chip: 'bg-primary/80 text-primary-foreground',
    bar: 'bg-primary/70',
    barText: 'text-primary-foreground',
  },
  destructive: {
    dot: 'bg-destructive',
    chip: 'bg-destructive/80 text-destructive-foreground',
    bar: 'bg-destructive/70',
    barText: 'text-destructive-foreground',
  },
  orange: {
    dot: 'bg-orange-500 dark:bg-orange-600',
    chip: 'bg-orange-500/80 text-white dark:bg-orange-600/80',
    bar: 'bg-orange-500/70 dark:bg-orange-600/70',
    barText: 'text-white',
  },
  emerald: {
    dot: 'bg-emerald-500 dark:bg-emerald-600',
    chip: 'bg-emerald-500/80 text-white dark:bg-emerald-600/80',
    bar: 'bg-emerald-500/70 dark:bg-emerald-600/70',
    barText: 'text-white',
  },
  violet: {
    dot: 'bg-violet-500 dark:bg-violet-600',
    chip: 'bg-violet-500/80 text-white dark:bg-violet-600/80',
    bar: 'bg-violet-500/70 dark:bg-violet-600/70',
    barText: 'text-white',
  },
  secondary: {
    dot: 'bg-secondary-foreground/60',
    chip: 'bg-secondary text-secondary-foreground',
    bar: 'bg-secondary/80',
    barText: 'text-secondary-foreground',
  },
};
