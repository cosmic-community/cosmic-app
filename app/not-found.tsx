import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🌍</div>
        <h1 className="text-4xl font-bold mb-2">World Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          The world you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  )
}