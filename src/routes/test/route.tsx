import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dev-abwaab-settings'],
    queryFn: async () => {
      const response = await fetch('https://dev.abwaab.sa/api/settings')
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }
      return response.json()
    },
  })

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">GET https://dev.abwaab.sa/api/settings</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-600">Error: {(error as Error).message}</p>}
      {data && (
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
