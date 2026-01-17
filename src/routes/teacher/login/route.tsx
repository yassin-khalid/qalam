import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/login"!</div>
}
