import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Minestech Assessment</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/triage" className="card p-6 text-left hover:shadow-md transition-shadow group">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            Smart Intake Triage
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste any support message
          </p>
        </Link>

        <Link href="/assistant" className="card p-6 text-left hover:shadow-md transition-shadow group">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
            Knowledge Assistant
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions grounded in your knowledge base
          </p>
        </Link>
      </div>

    </div>
  );
}
