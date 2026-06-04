import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="m-6 rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-red-100">Something went wrong: {this.state.error.message}</div>;
    return this.props.children;
  }
}
