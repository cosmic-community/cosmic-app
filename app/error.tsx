'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">💥</div>
        <h1 className="text-4xl font-bold mb-2">Something went wrong!</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          An error occurred while loading the game. This might be a temporary issue.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-secondary"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}