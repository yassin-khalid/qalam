import { createFileRoute } from '@tanstack/react-router'
import ContactSection from './-components/ContactSection'


export const Route = createFileRoute('/_landing/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ContactSection />
}

