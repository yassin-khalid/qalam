import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/_authenticated"!</div>
}
