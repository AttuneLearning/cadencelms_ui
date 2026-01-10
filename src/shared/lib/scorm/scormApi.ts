/**
 * SCORM API Wrapper
 * Implements SCORM 1.2 and 2004 API adapters
 * Exposes window.API (1.2) or window.API_1484_11 (2004) for SCORM packages
 */

export type ScormVersion = '1.2' | '2004';

export interface ScormAPIOptions {
  onCommit?: (data: Record<string, string>) => void | Promise<void>;
  onTerminate?: (data: Record<string, string>) => void | Promise<void>;
  onError?: (error: { errorCode: string; errorMessage: string; element?: string }) => void;
  savedData?: Record<string, string>;
  learnerId?: string;
  learnerName?: string;
  autoSaveInterval?: number; // milliseconds, 0 to disable
  debug?: boolean;
}

export class ScormAPI {
  private version: ScormVersion;
  private options: ScormAPIOptions;
  private data: Record<string, string> = {};
  private initialized = false;
  private terminated = false;
  private lastError = '0';
  private sessionStartTime: number | null = null;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private hasChanges = false;

  constructor(version: ScormVersion, options: ScormAPIOptions = {}) {
    this.version = version;
    this.options = {
      debug: false,
      autoSaveInterval: 0,
      ...options,
    };

    // Initialize with saved data if provided
    if (options.savedData) {
      this.data = { ...options.savedData };
    }

    // Set default values
    this.initializeDefaultValues();
  }

  private initializeDefaultValues() {
    if (this.version === '1.2') {
      this.data['cmi.core.student_id'] = this.options.learnerId || 'student';
      this.data['cmi.core.student_name'] = this.options.learnerName || 'Learner';
      this.data['cmi.core.lesson_status'] =
        this.data['cmi.core.lesson_status'] || 'not attempted';
      this.data['cmi.core.entry'] = this.data['cmi.core.lesson_status'] === 'not attempted' ? 'ab-initio' : 'resume';
      this.data['cmi.core.total_time'] = this.data['cmi.core.total_time'] || '00:00:00';
      this.data['cmi.core.lesson_mode'] = 'normal';
      this.data['cmi.core.credit'] = 'credit';
    } else {
      // SCORM 2004
      this.data['cmi.learner_id'] = this.options.learnerId || 'student';
      this.data['cmi.learner_name'] = this.options.learnerName || 'Learner';
      this.data['cmi.completion_status'] =
        this.data['cmi.completion_status'] || 'unknown';
      this.data['cmi.entry'] = this.data['cmi.completion_status'] === 'unknown' ? 'ab-initio' : 'resume';
      this.data['cmi.total_time'] = this.data['cmi.total_time'] || 'PT0S';
      this.data['cmi.mode'] = 'normal';
      this.data['cmi.credit'] = 'credit';
    }
  }

  /**
   * Initialize the SCORM API and expose it to window
   */
  initialize(): void {
    if (this.version === '1.2') {
      (window as any).API = this.createScorm12API();
    } else {
      (window as any).API_1484_11 = this.createScorm2004API();
    }

    this.log('SCORM API initialized', { version: this.version });
  }

  /**
   * Clean up and remove API from window
   */
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    if (this.version === '1.2') {
      delete (window as any).API;
    } else {
      delete (window as any).API_1484_11;
    }

    this.log('SCORM API destroyed');
  }

  /**
   * Create SCORM 1.2 API adapter
   */
  private createScorm12API() {
    return {
      LMSInitialize: (param: string): string => {
        this.log('LMSInitialize', param);

        if (this.initialized) {
          this.setError('101'); // Already initialized
          return 'false';
        }

        this.initialized = true;
        this.terminated = false;
        this.sessionStartTime = Date.now();
        this.lastError = '0';

        // Start auto-save if enabled
        if (this.options.autoSaveInterval && this.options.autoSaveInterval > 0) {
          this.startAutoSave();
        }

        return 'true';
      },

      LMSGetValue: (element: string): string => {
        this.log('LMSGetValue', element);

        if (!this.initialized) {
          this.setError('301'); // Not initialized
          return '';
        }

        if (this.terminated) {
          this.setError('301'); // Already terminated
          return '';
        }

        if (!this.isValidElement(element)) {
          this.setError('401'); // Invalid element
          return '';
        }

        const value = this.data[element] || '';
        this.lastError = '0';
        return value;
      },

      LMSSetValue: (element: string, value: string): string => {
        this.log('LMSSetValue', element, value);

        if (!this.initialized) {
          this.setError('301'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('301'); // Already terminated
          return 'false';
        }

        if (!this.isValidElement(element)) {
          this.setError('401'); // Invalid element
          return 'false';
        }

        if (this.isReadOnly(element)) {
          this.setError('403'); // Element is read-only
          return 'false';
        }

        this.data[element] = value;
        this.hasChanges = true;
        this.lastError = '0';
        return 'true';
      },

      LMSCommit: (param: string): string => {
        this.log('LMSCommit', param);

        if (!this.initialized) {
          this.setError('301'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('301'); // Already terminated
          return 'false';
        }

        // Update session time before commit
        this.updateSessionTime();

        // Call commit callback
        if (this.options.onCommit && this.hasChanges) {
          try {
            this.options.onCommit(this.data);
            this.hasChanges = false;
            this.lastError = '0';
          } catch (error) {
            this.setError('101'); // General error
            this.log('Commit error', error);
            return 'false';
          }
        }

        return 'true';
      },

      LMSFinish: (param: string): string => {
        this.log('LMSFinish', param);

        if (!this.initialized) {
          this.setError('301'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('301'); // Already terminated
          return 'false';
        }

        // Update session time before finish
        this.updateSessionTime();

        // Stop auto-save
        if (this.autoSaveTimer) {
          clearInterval(this.autoSaveTimer);
          this.autoSaveTimer = null;
        }

        // Call terminate callback
        if (this.options.onTerminate) {
          try {
            this.options.onTerminate(this.data);
          } catch (error) {
            this.setError('101'); // General error
            this.log('Terminate error', error);
          }
        }

        this.terminated = true;
        this.lastError = '0';
        return 'true';
      },

      LMSGetLastError: (): string => {
        return this.lastError;
      },

      LMSGetErrorString: (errorCode: string): string => {
        return this.getErrorString(errorCode);
      },

      LMSGetDiagnostic: (errorCode: string): string => {
        return this.getErrorString(errorCode);
      },
    };
  }

  /**
   * Create SCORM 2004 API adapter
   */
  private createScorm2004API() {
    return {
      Initialize: (param: string): string => {
        this.log('Initialize', param);

        if (this.initialized) {
          this.setError('103'); // Already initialized
          return 'false';
        }

        this.initialized = true;
        this.terminated = false;
        this.sessionStartTime = Date.now();
        this.lastError = '0';

        // Start auto-save if enabled
        if (this.options.autoSaveInterval && this.options.autoSaveInterval > 0) {
          this.startAutoSave();
        }

        return 'true';
      },

      GetValue: (element: string): string => {
        this.log('GetValue', element);

        if (!this.initialized) {
          this.setError('122'); // Not initialized
          return '';
        }

        if (this.terminated) {
          this.setError('133'); // Already terminated
          return '';
        }

        if (!this.isValidElement(element)) {
          this.setError('401'); // Invalid element
          return '';
        }

        const value = this.data[element] || '';
        this.lastError = '0';
        return value;
      },

      SetValue: (element: string, value: string): string => {
        this.log('SetValue', element, value);

        if (!this.initialized) {
          this.setError('122'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('133'); // Already terminated
          return 'false';
        }

        if (!this.isValidElement(element)) {
          this.setError('401'); // Invalid element
          return 'false';
        }

        if (this.isReadOnly(element)) {
          this.setError('404'); // Element is read-only
          return 'false';
        }

        this.data[element] = value;
        this.hasChanges = true;
        this.lastError = '0';
        return 'true';
      },

      Commit: (param: string): string => {
        this.log('Commit', param);

        if (!this.initialized) {
          this.setError('122'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('133'); // Already terminated
          return 'false';
        }

        // Update session time before commit
        this.updateSessionTime();

        // Call commit callback
        if (this.options.onCommit && this.hasChanges) {
          try {
            this.options.onCommit(this.data);
            this.hasChanges = false;
            this.lastError = '0';
          } catch (error) {
            this.setError('101'); // General error
            this.log('Commit error', error);
            return 'false';
          }
        }

        return 'true';
      },

      Terminate: (param: string): string => {
        this.log('Terminate', param);

        if (!this.initialized) {
          this.setError('122'); // Not initialized
          return 'false';
        }

        if (this.terminated) {
          this.setError('133'); // Already terminated
          return 'false';
        }

        // Update session time before terminate
        this.updateSessionTime();

        // Stop auto-save
        if (this.autoSaveTimer) {
          clearInterval(this.autoSaveTimer);
          this.autoSaveTimer = null;
        }

        // Call terminate callback
        if (this.options.onTerminate) {
          try {
            this.options.onTerminate(this.data);
          } catch (error) {
            this.setError('101'); // General error
            this.log('Terminate error', error);
          }
        }

        this.terminated = true;
        this.lastError = '0';
        return 'true';
      },

      GetLastError: (): string => {
        return this.lastError;
      },

      GetErrorString: (errorCode: string): string => {
        return this.getErrorString(errorCode);
      },

      GetDiagnostic: (errorCode: string): string => {
        return this.getErrorString(errorCode);
      },
    };
  }

  /**
   * Check if element is valid for the SCORM version
   */
  private isValidElement(element: string): boolean {
    if (this.version === '1.2') {
      const validPrefixes = [
        'cmi.core.',
        'cmi.suspend_data',
        'cmi.launch_data',
        'cmi.comments',
        'cmi.comments_from_lms',
        'cmi.objectives.',
        'cmi.student_data.',
        'cmi.student_preference.',
        'cmi.interactions.',
      ];
      return validPrefixes.some((prefix) => element.startsWith(prefix) || element === prefix.replace('.', ''));
    } else {
      const validPrefixes = [
        'cmi.learner_id',
        'cmi.learner_name',
        'cmi.location',
        'cmi.completion_status',
        'cmi.success_status',
        'cmi.entry',
        'cmi.score.',
        'cmi.session_time',
        'cmi.total_time',
        'cmi.exit',
        'cmi.suspend_data',
        'cmi.launch_data',
        'cmi.mode',
        'cmi.credit',
        'cmi.objectives.',
        'cmi.interactions.',
        'cmi.learner_preference.',
      ];
      return validPrefixes.some((prefix) => element.startsWith(prefix) || element === prefix);
    }
  }

  /**
   * Check if element is read-only
   */
  private isReadOnly(element: string): boolean {
    const readOnlyFields = [
      'cmi.core.student_id',
      'cmi.core.student_name',
      'cmi.core.total_time',
      'cmi.core.credit',
      'cmi.core.lesson_mode',
      'cmi.core.entry',
      'cmi.learner_id',
      'cmi.learner_name',
      'cmi.total_time',
      'cmi.mode',
      'cmi.credit',
      'cmi.entry',
    ];

    return readOnlyFields.includes(element);
  }

  /**
   * Set error code and call error callback
   */
  private setError(errorCode: string): void {
    this.lastError = errorCode;
    const errorMessage = this.getErrorString(errorCode);

    if (this.options.onError) {
      this.options.onError({ errorCode, errorMessage });
    }

    this.log('Error', { errorCode, errorMessage });
  }

  /**
   * Get error string for error code
   */
  private getErrorString(errorCode: string): string {
    const errors: Record<string, string> = {
      '0': 'No error',
      '101': 'General exception',
      '103': 'Already initialized',
      '122': 'Not initialized',
      '133': 'Already terminated',
      '201': 'Invalid argument',
      '301': 'Not initialized',
      '401': 'Invalid element',
      '403': 'Element is read-only',
      '404': 'Element is write-only',
    };

    return errors[errorCode] || 'Unknown error';
  }

  /**
   * Update session time in CMI data
   */
  updateSessionTime(): void {
    if (!this.sessionStartTime) return;

    const sessionSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    if (this.version === '1.2') {
      const hours = Math.floor(sessionSeconds / 3600);
      const minutes = Math.floor((sessionSeconds % 3600) / 60);
      const seconds = sessionSeconds % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.data['cmi.core.session_time'] = timeString;
    } else {
      // SCORM 2004 PT format
      const hours = Math.floor(sessionSeconds / 3600);
      const minutes = Math.floor((sessionSeconds % 3600) / 60);
      const seconds = sessionSeconds % 60;

      let timeString = 'PT';
      if (hours > 0) timeString += `${hours}H`;
      if (minutes > 0) timeString += `${minutes}M`;
      if (seconds > 0 || timeString === 'PT') timeString += `${seconds}S`;

      this.data['cmi.session_time'] = timeString;
    }
  }

  /**
   * Get session time in seconds
   */
  getSessionTime(): number {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    if (!this.options.autoSaveInterval || this.options.autoSaveInterval <= 0) return;

    this.autoSaveTimer = setInterval(() => {
      if (this.initialized && !this.terminated && this.hasChanges) {
        this.log('Auto-saving...');

        // Update session time
        this.updateSessionTime();

        // Commit changes
        if (this.options.onCommit) {
          try {
            this.options.onCommit(this.data);
            this.hasChanges = false;
          } catch (error) {
            this.log('Auto-save error', error);
          }
        }
      }
    }, this.options.autoSaveInterval);
  }

  /**
   * Get all CMI data
   */
  getAllData(): Record<string, string> {
    return { ...this.data };
  }

  /**
   * Check if API is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if API is terminated
   */
  isTerminated(): boolean {
    return this.terminated;
  }

  /**
   * Log debug messages
   */
  private log(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.log(`[SCORM ${this.version}]`, message, ...args);
    }
  }
}
