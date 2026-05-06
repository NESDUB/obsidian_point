'use client'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  )
}
