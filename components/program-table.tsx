"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react"

type SortDirection = 'asc' | 'desc' | 'none'

interface SortState {
  column: string
  direction: SortDirection
}

interface Program {
  id: string
  goals: string
  tasks: string
  team: string
  priority: string
  owner: string
  status: string
  eta: string
  completionDate: string
  links: string
  notes: string
}

interface ProgramTableProps {
  programs: Program[]
  sortState: SortState
  onSort: (column: string) => void
}

const statusColors: Record<string, string> = {
  "In Progress": "bg-[var(--status-blue)] text-white",
  "To be picked": "bg-[var(--status-orange)] text-white",
  "To be started": "bg-[var(--status-orange)] text-white",
  Ongoing: "bg-[var(--status-purple)] text-white",
  Completed: "bg-[var(--status-green)] text-white",
  // Add more status colors as needed based on actual data
}

const priorityColors: Record<string, string> = {
  P0: "bg-[var(--status-red)] text-white",
  P1: "bg-[var(--status-orange)] text-white", 
  P2: "bg-[var(--status-yellow)] text-white",
  Critical: "bg-[var(--status-red)] text-white",
  High: "bg-[var(--status-orange)] text-white",
  Medium: "bg-[var(--status-yellow)] text-white",
  Low: "bg-muted text-muted-foreground",
}

export function ProgramTable({ programs, sortState, onSort }: ProgramTableProps) {
  const [columnWidths, setColumnWidths] = useState({
    goals: 200,
    tasks: 180,
    team: 140,
    priority: 100,
    owner: 140,
    status: 120,
    eta: 110,
    completionDate: 140,
    links: 100,
    notes: 250,
  })

  const [resizing, setResizing] = useState<string | null>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = (column: string, e: React.MouseEvent) => {
    setResizing(column)
    startXRef.current = e.clientX
    startWidthRef.current = columnWidths[column as keyof typeof columnWidths]
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return

      const diff = e.clientX - startXRef.current
      const newWidth = Math.max(80, startWidthRef.current + diff)

      setColumnWidths((prev) => ({
        ...prev,
        [resizing]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizing])

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getSortIndicator = (column: string) => {
    if (sortState.column !== column) {
      return <span className="ml-1 text-muted-foreground/50">↕</span>
    }
    
    switch (sortState.direction) {
      case 'asc':
        return <ChevronUp className="ml-1 h-3 w-3 text-foreground" />
      case 'desc':
        return <ChevronDown className="ml-1 h-3 w-3 text-foreground" />
      default:
        return <span className="ml-1 text-muted-foreground/50">↕</span>
    }
  }

  const SortableHeader = ({ column, children, className, style }: { 
    column: string, 
    children: React.ReactNode, 
    className?: string,
    style?: React.CSSProperties 
  }) => (
    <th
      className={`relative px-2.5 py-2 text-left text-xs font-semibold text-foreground border-r border-border/40 cursor-pointer hover:bg-muted/50 transition-colors ${className || ''}`}
      style={style}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center">
        {children}
        {getSortIndicator(column)}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/30"
        onMouseDown={(e) => handleMouseDown(column, e)}
        onClick={(e) => e.stopPropagation()}
      />
    </th>
  )

  return (
    <div className="overflow-auto max-h-[calc(100vh-140px)]">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
          <tr className="border-b border-border">
            <SortableHeader column="goals" style={{ width: columnWidths.goals }}>
              Goals
            </SortableHeader>
            <SortableHeader column="tasks" style={{ width: columnWidths.tasks }}>
              Tasks
            </SortableHeader>
            <SortableHeader column="team" style={{ width: columnWidths.team }}>
              Team
            </SortableHeader>
            <SortableHeader column="priority" style={{ width: columnWidths.priority }}>
              Priority
            </SortableHeader>
            <SortableHeader column="owner" style={{ width: columnWidths.owner }}>
              Owner
            </SortableHeader>
            <SortableHeader column="status" style={{ width: columnWidths.status }}>
              Status
            </SortableHeader>
            <SortableHeader column="eta" style={{ width: columnWidths.eta }}>
              ETA
            </SortableHeader>
            <SortableHeader column="completionDate" style={{ width: columnWidths.completionDate }}>
              Completion Date
            </SortableHeader>
            <SortableHeader column="links" style={{ width: columnWidths.links }}>
              Links
            </SortableHeader>
            <SortableHeader column="notes" style={{ width: columnWidths.notes }}>
              Notes
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {programs.map((program, index) => (
            <tr
              key={program.id}
              className={`border-b border-border transition-colors hover:bg-muted/30 ${
                index % 2 === 0 ? "bg-card" : "bg-muted/10"
              }`}
            >
              <td
                className="px-2.5 py-2 text-xs font-medium text-foreground border-r border-border/40"
                style={{ width: columnWidths.goals }}
              >
                <div className="whitespace-pre-wrap break-words">{program.goals}</div>
              </td>
              <td
                className="px-2.5 py-2 text-xs text-muted-foreground border-r border-border/40"
                style={{ width: columnWidths.tasks }}
              >
                <div className="whitespace-pre-wrap break-words">{program.tasks}</div>
              </td>
              <td
                className="px-2.5 py-2 text-xs text-foreground border-r border-border/40"
                style={{ width: columnWidths.team }}
              >
                {program.team}
              </td>
              <td className="px-2.5 py-2 border-r border-border/40" style={{ width: columnWidths.priority }}>
                <Badge
                  variant="secondary"
                  className={`${priorityColors[program.priority]} border-0 text-xs font-medium`}
                >
                  {program.priority}
                </Badge>
              </td>
              <td
                className="px-2.5 py-2 text-xs text-foreground border-r border-border/40"
                style={{ width: columnWidths.owner }}
              >
                <div className="whitespace-pre-wrap break-words">{program.owner}</div>
              </td>
              <td className="px-2.5 py-2 border-r border-border/40" style={{ width: columnWidths.status }}>
                <Badge variant="secondary" className={`${statusColors[program.status]} border-0 text-xs font-medium`}>
                  {program.status}
                </Badge>
              </td>
              <td
                className="px-2.5 py-2 text-xs text-muted-foreground border-r border-border/40"
                style={{ width: columnWidths.eta }}
              >
                {formatDate(program.eta)}
              </td>
              <td
                className="px-2.5 py-2 text-xs text-muted-foreground border-r border-border/40"
                style={{ width: columnWidths.completionDate }}
              >
                {formatDate(program.completionDate)}
              </td>
              <td className="px-2.5 py-2 border-r border-border/40" style={{ width: columnWidths.links }}>
                {program.links && (
                  <a
                    href={program.links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </td>
              <td className="px-2.5 py-2 text-xs text-muted-foreground" style={{ width: columnWidths.notes }}>
                <div className="whitespace-pre-wrap break-words">{program.notes}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
