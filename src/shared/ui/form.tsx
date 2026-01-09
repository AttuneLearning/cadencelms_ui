/**
 * Form Component (Basic Implementation)
 */

import * as React from 'react';

// Basic form context for field registration
const FormContext = React.createContext<any>({});

export function Form({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props}>{children}</form>;
}

export function FormField({ children, name }: { children: React.ReactNode; name: string }) {
  return <FormContext.Provider value={{ name }}>{children}</FormContext.Provider>;
}

export function FormItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function FormLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormDescription({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={className}>{children}</p>;
}

export function FormMessage({ children, className }: { children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={className}>{children}</p>;
}
