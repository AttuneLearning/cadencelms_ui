/**
 * Environment variable configuration
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  sentryDsn?: string;
}

/**
 * Validates and returns environment configuration
 */
function getEnvConfig(): EnvConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const environment = import.meta.env.VITE_ENV || 'development';

  if (!apiBaseUrl) {
    throw new Error(
      'VITE_API_BASE_URL is not defined. Please set it in your .env file.'
    );
  }

  return {
    apiBaseUrl,
    environment: environment as EnvConfig['environment'],
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  };
}

export const env = getEnvConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.environment === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.environment === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.environment === 'test';
