/**
 * Playlist Engine Feature
 * Provides React hooks and UI for the adaptive playlist engine.
 */

export { usePlaylistEngine } from './model/usePlaylistEngine';
export { useAdaptiveConfig } from './model/useAdaptiveConfig';
export { mapToStaticLearningUnits } from './lib/mapToStaticLearningUnits';

// UI Components
export {
  GateIndicator,
  GateChallengeView,
  InjectedPracticeView,
  PlaylistEntryLabel,
  CourseAdaptiveSettingsPanel,
  LearningUnitAdaptiveEditor,
} from './ui';
export type {
  GateIndicatorProps,
  GateChallengeViewProps,
  InjectedPracticeViewProps,
  PlaylistEntryLabelProps,
  CourseAdaptiveSettingsPanelProps,
  LearningUnitAdaptiveEditorProps,
} from './ui';
