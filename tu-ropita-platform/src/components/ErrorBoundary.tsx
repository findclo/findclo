'use client';

import { Component, ReactNode } from 'react';
import { RefreshCw, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log critical unhandled errors
    console.error('CRITICAL ERROR - ErrorBoundary caught:', {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  copyErrorToClipboard = async () => {
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        name: this.state.error?.name
      }
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      alert('Detalles del error copiados al portapapeles');
    } catch (err) {
      console.error('Failed to copy error details:', err);
      alert('No se pudo copiar el error. Verifica los permisos del navegador.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
          {/* Emoji Icon */}
          <div className="text-6xl mb-4">😅</div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            ¡Oops! Algo salió mal
          </h1>
          
          <p className="text-lg text-gray-600 text-center mb-8 max-w-md">
            Parece que hubo un pequeño problema. No te preocupes, tus datos están seguros.
          </p>

          {/* Main Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar página
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold text-lg"
            >
              ← Volver atrás
            </button>
          </div>

          {/* Copy Error Button */}
          <div className="pt-6 w-full max-w-md text-center">
            <p className="text-sm text-gray-500 mb-3">
              ¿El problema persiste? Ayúdanos a solucionarlo:
            </p>
            <button
              onClick={this.copyErrorToClipboard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
            >
              <Copy className="w-4 h-4" />
              Copiar detalles del error
            </button>
            <p className="text-xs text-gray-400 mt-2">
              ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}