import React, { Component, ErrorInfo, ReactNode } from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // Clear cookies/localStorage if needed, or just force reload the home page
    try {
      localStorage.removeItem("app-theme"); // reset theme in case of corruption
    } catch (e) {}
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at center, #0f172a 0%, #020617 100%)",
            color: "#f8fafc",
            fontFamily: "var(--font-runic, monospace)",
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "550px",
              width: "100%",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              border: "2px double #ef4444",
              borderRadius: "12px",
              padding: "2.5rem 2rem",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.05)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "2px solid #ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)",
                animation: "pulse 2s infinite",
              }}
            >
              <FaExclamationTriangle size={32} color="#f87171" />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  color: "#f87171",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  textShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
                }}
              >
                System Anomaly Detected
              </h1>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  color: "#94a3b8",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  fontFamily: "sans-serif",
                }}
              >
                The application encountered an unexpected runtime state. Your
                local presets and active configurations remain safe.
              </p>
            </div>

            {this.state.error && (
              <div
                style={{
                  width: "100%",
                  backgroundColor: "rgba(2, 6, 23, 0.8)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "6px",
                  padding: "1rem",
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                  color: "#fda4af",
                  textAlign: "left",
                  maxHeight: "150px",
                  overflowY: "auto",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                border: "none",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: "bold",
                padding: "0.75rem 2rem",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.25)",
                transition: "all 0.2s ease-in-out",
                width: "100%",
              }}
              className="hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              <FaRedo size={14} />
              <span>RESET SYSTEM & RELOAD</span>
            </button>

            <style>{`
              @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
              }
            `}</style>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
