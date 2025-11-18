'use client';

import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NETWORK_CONFIG } from '@/lib/contracts';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  txHash?: string;
  timestamp?: number;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  className?: string;
}

export function ProgressBar({ steps, className }: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            {/* Step Icon */}
            <div className="flex-shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  {
                    'bg-gray-200 dark:bg-gray-700': step.status === 'pending',
                    'bg-blue-500 text-white': step.status === 'in-progress',
                    'bg-green-500 text-white': step.status === 'completed',
                    'bg-red-500 text-white': step.status === 'error',
                  }
                )}
              >
                {step.status === 'pending' && <Clock className="w-4 h-4" />}
                {step.status === 'in-progress' && <Loader2 className="w-4 h-4 animate-spin" />}
                {step.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                {step.status === 'error' && <AlertCircle className="w-4 h-4" />}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    {
                      'text-gray-500 dark:text-gray-400': step.status === 'pending',
                      'text-blue-600 dark:text-blue-400': step.status === 'in-progress',
                      'text-green-600 dark:text-green-400': step.status === 'completed',
                      'text-red-600 dark:text-red-400': step.status === 'error',
                    }
                  )}
                >
                  {step.title}
                </h3>
                {step.txHash && (
                  <a
                    href={`${NETWORK_CONFIG.blockExplorer}/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View TX
                  </a>
                )}
              </div>
              
              {step.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}

              {step.timestamp && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

