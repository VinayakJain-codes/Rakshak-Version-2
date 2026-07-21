export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 bg-red-50 rounded-lg shadow-md border border-red-200">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-700">Access Denied</h1>
        <p className="text-center text-red-600">You do not have permission to access this page.</p>
      </div>
    </div>
  )
}
