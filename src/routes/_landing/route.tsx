import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navbar from "./-components/Navbar";
import Footer from "./-components/Footer";

export const Route = createFileRoute("/_landing")({
    component: RouteComponent,
})

function RouteComponent() {

    return <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
        <Navbar />
        <main>
            <Outlet />
        </main>
        <Footer />
    </div>
}