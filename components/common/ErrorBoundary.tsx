"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for catching and displaying errors
 *
 * Wraps the app to catch React errors and display a user-friendly message.
 * This is especially important for Lazorkit integration where errors might
 * occur during wallet operations.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-white">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-black mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-sm text-[#8e8e93] mb-4">
                    An unexpected error occurred. Please refresh the page to continue.
                  </p>
                  {this.state.error && (
                    <details className="text-left mt-4">
                      <summary className="text-xs text-[#8e8e93] cursor-pointer mb-2">
                        Error details
                      </summary>
                      <pre className="text-xs bg-[#f2f2f7] p-2 rounded overflow-auto max-h-32">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
                <Button
                  onClick={this.handleReset}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

