'use client'

import { Component } from 'react'

export class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <span className="text-2xl text-red-400 font-black">!</span>
          </div>
          <h1 className="text-xl font-black mb-2">خطایی رخ داد</h1>
          <p className="text-muted-foreground text-sm mb-6 text-center">لطفاً صفحه را رفرش کنید</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">
            رفرش صفحه
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
