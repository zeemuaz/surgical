import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error): void {
    if (import.meta.env.DEV) {
      console.error('Route rendering error:', error);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12">
          <div className="max-w-lg rounded-[8px] border border-[#E3E8EA] bg-[#F4F6F7] p-8">
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#4E5A61]">
              DISPLAY INTERRUPTED
            </p>
            <h1 className="mt-3 text-[24px] font-semibold text-[#171C20]">
              Unable to display this section
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[#4E5A61]">
              A temporary rendering issue occurred. Reload the page or return to
              the instrument catalog.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#162C35] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#0F2027]"
              >
                Reload Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex h-11 items-center justify-center rounded-[6px] border border-[#E3E8EA] bg-white px-5 text-[14px] font-medium text-[#171C20] hover:border-[#162C35]"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
