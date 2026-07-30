import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
    this.setState({ errorInfo });
    
    // In a real production setup, you would log this to an external service like Sentry or Firebase Crashlytics
    try {
      const logData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      console.warn("Audit Log Error Stack:", JSON.stringify(logData));
    } catch (e) {
      console.error("Failed to compile crash log:", e);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.hash = '';
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            
            <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight mb-3">
              Kuna Hitilafu Imekatiza!
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Samahani, jukwaa la Lupanulla limekumbana na hitilafu ya kiufundi kwenye ukurasa huu. Tumerekodi hitilafu hii kwa ajili ya kuirekebisha hivi punde.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left mb-6 overflow-x-auto">
                <p className="font-mono text-xs text-red-600 font-semibold mb-1">
                  Hitilafu: {this.state.error.name}
                </p>
                <p className="font-mono text-[11px] text-slate-500 whitespace-pre-wrap max-h-32">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-reload-page"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all shadow-md shadow-cyan-600/10"
              >
                <RefreshCw size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
                <span>Pakia Upya</span>
              </button>
              
              <button
                id="btn-home-fallback"
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                <Home size={16} />
                <span>Mwanzo</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
