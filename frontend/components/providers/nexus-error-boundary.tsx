'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NexusErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nexus Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a Nexus SDK related error
    if (error.message.includes('nexus') || 
        error.message.includes('Nexus') || 
        error.message.includes('@avail-project')) {
      console.error('Nexus SDK error detected, falling back to safe mode');
    }
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a Nexus SDK related error
      const isNexusError = this.state.error?.message.includes('nexus') || 
                          this.state.error?.message.includes('Nexus') || 
                          this.state.error?.message.includes('@avail-project');

      if (isNexusError) {
        return this.props.fallback || (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-white text-xs">⚠</span>
              </div>
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Nexus SDK Error
              </span>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Nexus SDK encountered an error. Some cross-chain features may not be available. 
              You can still use manual bridge options.
            </p>
          </div>
        );
      }

      // For other errors, show a generic error message
      return this.props.fallback || (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs">✕</span>
            </div>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Component Error
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">
            Something went wrong. Please refresh the page and try again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
