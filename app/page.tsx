import { Suspense } from "react"
import ProgramDashboard from "@/components/program-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <ProgramDashboard />
      </Suspense>
    </main>
  )
}
