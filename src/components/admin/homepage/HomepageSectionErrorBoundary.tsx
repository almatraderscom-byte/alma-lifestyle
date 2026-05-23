'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  sectionLabel: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class HomepageSectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[HomepageBuilder] Section "${this.props.sectionLabel}" crashed:`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">{this.props.sectionLabel} — editor error</p>
          <p className="mt-1 text-xs">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-3 text-xs font-medium underline"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
