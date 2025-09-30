"use client"

import { useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProgramTable } from "@/components/program-table"
import { usePrograms } from "@/hooks/use-programs"

type SortDirection = 'asc' | 'desc' | 'none'

interface SortState {
  column: string
  direction: SortDirection
}

export default function ProgramDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [sortState, setSortState] = useState<SortState>({ column: '', direction: 'none' })

  const { programs, filterOptions, loading, error, refreshData } = usePrograms()

  const handleSort = (column: string) => {
    setSortState(prev => {
      if (prev.column !== column) {
        return { column, direction: 'asc' }
      }
      
      switch (prev.direction) {
        case 'none':
          return { column, direction: 'asc' }
        case 'asc':
          return { column, direction: 'desc' }
        case 'desc':
          return { column: '', direction: 'none' }
        default:
          return { column, direction: 'asc' }
      }
    })
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      searchQuery === "" ||
      program.goals.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tasks.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || program.status === statusFilter
    const matchesPriority = priorityFilter === "all" || program.priority === priorityFilter
    const matchesTeam = teamFilter === "all" || program.team === teamFilter
    const matchesOwner = ownerFilter === "all" || program.owner === ownerFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam && matchesOwner
  })

  // Apply sorting
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sortState.direction === 'none') return 0

    let aValue: string | number = ''
    let bValue: string | number = ''

    switch (sortState.column) {
      case 'goals':
        aValue = a.goals.toLowerCase()
        bValue = b.goals.toLowerCase()
        break
      case 'tasks':
        aValue = a.tasks.toLowerCase()
        bValue = b.tasks.toLowerCase()
        break
      case 'team':
        aValue = a.team.toLowerCase()
        bValue = b.team.toLowerCase()
        break
      case 'priority':
        // Custom priority order: P0 > P1 > P2 > others
        const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 }
        aValue = priorityOrder[a.priority] ?? 999
        bValue = priorityOrder[b.priority] ?? 999
        break
      case 'owner':
        aValue = a.owner.toLowerCase()
        bValue = b.owner.toLowerCase()
        break
      case 'status':
        aValue = a.status.toLowerCase()
        bValue = b.status.toLowerCase()
        break
      case 'eta':
        aValue = a.eta ? new Date(a.eta).getTime() : 0
        bValue = b.eta ? new Date(b.eta).getTime() : 0
        break
      case 'completionDate':
        aValue = a.completionDate ? new Date(a.completionDate).getTime() : 0
        bValue = b.completionDate ? new Date(b.completionDate).getTime() : 0
        break
      case 'notes':
        aValue = a.notes.toLowerCase()
        bValue = b.notes.toLowerCase()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
    return 0
  })

  const stats = {
    total: programs.length,
    inProgress: programs.filter((p) => p.status === "In Progress").length,
    ongoing: programs.filter((p) => p.status === "Ongoing").length,
    toBePicked: programs.filter((p) => p.status === "To be picked").length,
    completed: programs.filter((p) => p.status === "Completed").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-[1600px] flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading programs data...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-[1600px] flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-destructive mb-2">Error loading data</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-[1600px] space-y-2">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-2 shadow-sm">
          {/* Compact metrics */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className="rounded-md border border-border bg-background px-3 py-2 transition-all hover:border-primary hover:shadow-sm w-[80px] h-[48px] flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-medium text-muted-foreground">Total</div>
              <div className="text-base font-semibold text-foreground">{stats.total}</div>
            </button>
            <button
              onClick={() => setStatusFilter("In Progress")}
              className="rounded-md border border-border bg-background px-3 py-2 transition-all hover:border-[var(--status-blue)] hover:shadow-sm w-[80px] h-[48px] flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-medium text-muted-foreground">In Progress</div>
              <div className="text-base font-semibold text-[var(--status-blue)]">{stats.inProgress}</div>
            </button>
            <button
              onClick={() => setStatusFilter("Ongoing")}
              className="rounded-md border border-border bg-background px-3 py-2 transition-all hover:border-[var(--status-purple)] hover:shadow-sm w-[80px] h-[48px] flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-medium text-muted-foreground">Ongoing</div>
              <div className="text-base font-semibold text-[var(--status-purple)]">{stats.ongoing}</div>
            </button>
            <button
              onClick={() => setStatusFilter("To be picked")}
              className="rounded-md border border-border bg-background px-3 py-2 transition-all hover:border-[var(--status-orange)] hover:shadow-sm w-[80px] h-[48px] flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-medium text-muted-foreground">To Pick</div>
              <div className="text-base font-semibold text-[var(--status-orange)]">{stats.toBePicked}</div>
            </button>
            <button
              onClick={() => setStatusFilter("Completed")}
              className="rounded-md border border-border bg-background px-3 py-2 transition-all hover:border-[var(--status-green)] hover:shadow-sm w-[80px] h-[48px] flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-medium text-muted-foreground">Completed</div>
              <div className="text-base font-semibold text-[var(--status-green)]">{stats.completed}</div>
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* Filters */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm border-border"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {filterOptions.statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm border-border">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {filterOptions.priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm border-border">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {filterOptions.teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm border-border">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {filterOptions.owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || teamFilter !== "all" || ownerFilter !== "all") && (
              <button
                className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setTeamFilter("all")
                  setOwnerFilter("all")
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <ProgramTable 
            programs={sortedPrograms} 
            sortState={sortState}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  )
}
