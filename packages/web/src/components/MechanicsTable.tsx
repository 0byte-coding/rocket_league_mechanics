"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import type { Mechanic, MechanicCategory, MechanicType, ActiveFilters } from "@/lib/types"
import { get_all_tags } from "@/lib/data"
import { RANK_TIERS } from "@/lib/ranks"
import RankIcon from "./RankIcon"
import VideoClipPreview from "./VideoClip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon, XIcon, SearchIcon, FilterIcon } from "lucide-react"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<MechanicCategory, string> = {
  flip_reset: "Flip Reset",
  dribble_flick: "Dribble / Flick",
  pinch: "Pinch",
  powershot: "Power Shot",
  dribble: "Dribble",
  air_dribble: "Air Dribble",
  redirect: "Redirect",
  pogo: "Pogo",
  dash: "Dash",
  save: "Save",
  shot: "Shot",
  movement: "Movement",
  unknown: "Other",
}

const TYPE_LABELS: Record<MechanicType, string> = {
  ground: "Ground",
  air: "Air",
  wall: "Wall",
  ceiling: "Ceiling",
  mixed: "Mixed",
}

const CATEGORY_COLORS: Record<MechanicCategory, string> = {
  flip_reset:   "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  dribble_flick:"bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  pinch:        "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  powershot:    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  dribble:      "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  air_dribble:  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  redirect:     "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  pogo:         "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  dash:         "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
  save:         "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  shot:         "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  movement:     "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  unknown:      "bg-muted text-muted-foreground border-border",
}

type SortKey = "name" | "category" | "type" | "difficulty" | "viability"
type SortDir = "asc" | "desc"

const DEFAULT_FILTERS: ActiveFilters = {
  search: "",
  category: "all",
  type: "all",
  difficulty_min: 0,
  difficulty_max: 100,
  viability_min: 0,
  viability_max: 100,
  tags: [],
}

// Column ids in order
type ColId = "name" | "category" | "type" | "difficulty" | "viability" | "description" | "clips"

interface ColDef {
  id: ColId
  label: string
  default_width: number
  min_width: number
  sortable: boolean
  sort_key?: SortKey
}

const COLUMNS: ColDef[] = [
  { id: "name",        label: "Mechanic",       default_width: 200, min_width: 120, sortable: true,  sort_key: "name"       },
  { id: "category",    label: "Category",       default_width: 140, min_width: 100, sortable: true,  sort_key: "category"   },
  { id: "type",        label: "Type",           default_width: 80,  min_width: 60,  sortable: true,  sort_key: "type"       },
  { id: "difficulty",  label: "Difficulty",     default_width: 130, min_width: 100, sortable: true,  sort_key: "difficulty" },
  { id: "viability",   label: "Viability",      default_width: 100, min_width: 80,  sortable: true,  sort_key: "viability"  },
  { id: "description", label: "Description / Tags", default_width: 320, min_width: 180, sortable: false },
  { id: "clips",       label: "Video Clips",    default_width: 180, min_width: 120, sortable: false  },
]

// ---------------------------------------------------------------------------
// Resizable header hook
// ---------------------------------------------------------------------------

const use_column_widths = (cols: ColDef[]) => {
  const [widths, set_widths] = useState<Record<ColId, number>>(
    () => Object.fromEntries(cols.map((c) => [c.id, c.default_width])) as Record<ColId, number>
  )

  const drag_state = useRef<{ col_id: ColId; start_x: number; start_width: number } | null>(null)

  const on_drag_start = useCallback(
    (col_id: ColId, e: React.MouseEvent) => {
      e.preventDefault()
      // Capture everything we need upfront — never read back through the ref
      // inside on_move, because on_up may null it before on_move finishes.
      const start_x = e.clientX
      const start_width = widths[col_id]
      const min_width = cols.find((c) => c.id === col_id)!.min_width
      drag_state.current = { col_id, start_x, start_width }

      const on_move = (ev: MouseEvent) => {
        const new_width = Math.max(min_width, start_width + (ev.clientX - start_x))
        set_widths((prev) => ({ ...prev, [col_id]: new_width }))
      }

      const on_up = () => {
        drag_state.current = null
        window.removeEventListener("mousemove", on_move)
        window.removeEventListener("mouseup", on_up)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
      window.addEventListener("mousemove", on_move)
      window.addEventListener("mouseup", on_up)
    },
    [widths, cols]
  )

  const total_width = Object.values(widths).reduce((a, b) => a + b, 0)

  return { widths, on_drag_start, total_width }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DifficultyBarProps {
  value: number
}

const DifficultyBar: React.FC<DifficultyBarProps> = ({ value }) => {
  const rank_color = RANK_TIERS.find(
    (r) => value >= r.difficulty_min && value < r.difficulty_max
  )?.color ?? "#888"

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <RankIcon difficulty={value} size={22} />
        <span className="text-xs font-mono font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: rank_color }}
        />
      </div>
    </div>
  )
}

interface ViabilityBarProps {
  value: number
}

const ViabilityBar: React.FC<ViabilityBarProps> = ({ value }) => {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444"
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-mono font-medium tabular-nums">{value}</span>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

interface ResizeHandleProps {
  col_id: ColId
  on_drag_start: (col_id: ColId, e: React.MouseEvent) => void
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ col_id, on_drag_start }) => (
  <span
    onMouseDown={(e) => on_drag_start(col_id, e)}
    className={cn(
      "absolute right-0 top-0 h-full w-4 flex items-center justify-center",
      "cursor-col-resize select-none group/handle z-10"
    )}
    aria-hidden="true"
  >
    <span className="h-4 w-px bg-border group-hover/handle:bg-primary group-hover/handle:w-0.5 transition-all" />
  </span>
)

interface SortHeaderProps {
  label: string
  sort_key: SortKey
  current_key: SortKey
  current_dir: SortDir
  on_sort: (key: SortKey) => void
}

const SortHeader: React.FC<SortHeaderProps> = ({
  label, sort_key, current_key, current_dir, on_sort,
}) => {
  const is_active = current_key === sort_key
  return (
    <button
      onClick={() => on_sort(sort_key)}
      className={cn(
        "flex items-center gap-1 text-left text-xs font-medium whitespace-nowrap hover:text-foreground transition-colors",
        is_active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {label}
      <span className="inline-flex flex-col">
        <ChevronUpIcon className={cn("h-2.5 w-2.5", is_active && current_dir === "asc" ? "text-primary" : "text-muted-foreground/40")} />
        <ChevronDownIcon className={cn("h-2.5 w-2.5 -mt-0.5", is_active && current_dir === "desc" ? "text-primary" : "text-muted-foreground/40")} />
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MechanicsTableProps {
  mechanics: Mechanic[]
}

const MechanicsTable: React.FC<MechanicsTableProps> = ({ mechanics }) => {
  const [filters, set_filters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [sort_key, set_sort_key] = useState<SortKey>("difficulty")
  const [sort_dir, set_sort_dir] = useState<SortDir>("asc")
  const [show_filters, set_show_filters] = useState(false)
  const { widths, on_drag_start, total_width } = use_column_widths(COLUMNS)

  const all_tags = useMemo(() => get_all_tags(mechanics), [mechanics])
  const all_categories = useMemo(
    () => Array.from(new Set(mechanics.map((m) => m.category))).sort(),
    [mechanics]
  )
  const all_types = useMemo(
    () => Array.from(new Set(mechanics.flatMap((m) => (m.type ? [m.type] : [])))).sort(),
    [mechanics]
  )

  const handle_sort = useCallback((key: SortKey) => {
    if (sort_key === key) {
      set_sort_dir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      set_sort_key(key)
      set_sort_dir("asc")
    }
  }, [sort_key])

  const toggle_tag_filter = useCallback((tag: string) => {
    set_filters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }, [])

  const reset_filters = useCallback(() => set_filters(DEFAULT_FILTERS), [])

  const has_active_filters = useMemo(() =>
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.type !== "all" ||
    filters.difficulty_min !== 0 ||
    filters.difficulty_max !== 100 ||
    filters.viability_min !== 0 ||
    filters.viability_max !== 100 ||
    filters.tags.length > 0
  , [filters])

  const filtered_mechanics = useMemo(() => {
    const result = mechanics.filter((m) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const haystack = [m.name, m.description, ...(m.aliases ?? []), ...(m.proponents ?? []), ...m.tags]
          .join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.category !== "all" && m.category !== filters.category) return false
      if (filters.type !== "all" && m.type !== filters.type) return false
      if (m.difficulty < filters.difficulty_min || m.difficulty > filters.difficulty_max) return false
      if (m.viability < filters.viability_min || m.viability > filters.viability_max) return false
      if (filters.tags.length > 0 && !filters.tags.every((t) => m.tags.includes(t))) return false
      return true
    })

    result.sort((a, b) => {
      let cmp = 0
      switch (sort_key) {
        case "name":       cmp = a.name.localeCompare(b.name); break
        case "category":   cmp = a.category.localeCompare(b.category); break
        case "type":       cmp = (a.type ?? "").localeCompare(b.type ?? ""); break
        case "difficulty": cmp = a.difficulty - b.difficulty; break
        case "viability":  cmp = a.viability - b.viability; break
      }
      return sort_dir === "asc" ? cmp : -cmp
    })

    return result
  }, [mechanics, filters, sort_key, sort_dir])

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Toolbar ---- */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search mechanics, tags, proponents…"
              value={filters.search}
              onChange={(e) => set_filters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-7"
            />
          </div>
          <Button
            variant={show_filters ? "default" : "outline"}
            size="sm"
            onClick={() => set_show_filters((v) => !v)}
            className="gap-1.5"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Filters
            {has_active_filters && (
              <Badge variant="secondary" className="ml-0.5 h-4 text-[10px]">
                {[
                  filters.category !== "all" ? 1 : 0,
                  filters.type !== "all" ? 1 : 0,
                  (filters.difficulty_min !== 0 || filters.difficulty_max !== 100) ? 1 : 0,
                  (filters.viability_min !== 0 || filters.viability_max !== 100) ? 1 : 0,
                  filters.tags.length,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
          {has_active_filters && (
            <Button variant="ghost" size="sm" onClick={reset_filters} className="gap-1.5">
              <XIcon className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered_mechanics.length} / {mechanics.length} mechanics
          </span>
        </div>

        {/* ---- Filter panel ---- */}
        {show_filters && (
          <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <Select
                  value={filters.category}
                  onValueChange={(v) => set_filters((prev) => ({ ...prev, category: v as MechanicCategory | "all" }))}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {all_categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Type</span>
                <Select
                  value={filters.type}
                  onValueChange={(v) => set_filters((prev) => ({ ...prev, type: v as MechanicType | "all" }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {all_types.map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Difficulty — by rank</span>
                <div className="flex flex-wrap gap-1.5">
                  {RANK_TIERS.map((rank) => {
                    const is_selected = filters.difficulty_min === rank.difficulty_min && filters.difficulty_max === rank.difficulty_max
                    return (
                      <button
                        key={rank.tier}
                        onClick={() => set_filters((prev) => ({
                          ...prev,
                          difficulty_min: is_selected ? 0 : rank.difficulty_min,
                          difficulty_max: is_selected ? 100 : rank.difficulty_max,
                        }))}
                        className={cn(
                          "flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-all",
                          is_selected ? "border-primary bg-primary/10 font-medium" : "border-border bg-background hover:bg-muted"
                        )}
                        title={`${rank.difficulty_min}–${rank.difficulty_max}`}
                      >
                        <RankIcon difficulty={rank.difficulty_min + 1} size={16} />
                        <span>{rank.name}</span>
                      </button>
                    )
                  })}
                  {(filters.difficulty_min !== 0 || filters.difficulty_max !== 100) && (
                    <button
                      onClick={() => set_filters((prev) => ({ ...prev, difficulty_min: 0, difficulty_max: 100 }))}
                      className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      <XIcon className="h-3 w-3" />Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Viability */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Viability</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "High (70+)",    min: 70, max: 100, color: "#22c55e" },
                    { label: "Medium (40–69)", min: 40, max: 70,  color: "#eab308" },
                    { label: "Low (<40)",      min: 0,  max: 40,  color: "#ef4444" },
                  ].map((tier) => {
                    const is_selected = filters.viability_min === tier.min && filters.viability_max === tier.max
                    return (
                      <button
                        key={tier.label}
                        onClick={() => set_filters((prev) => ({
                          ...prev,
                          viability_min: is_selected ? 0 : tier.min,
                          viability_max: is_selected ? 100 : tier.max,
                        }))}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-all",
                          is_selected ? "border-primary bg-primary/10 font-medium" : "border-border bg-background hover:bg-muted"
                        )}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
                        {tier.label}
                      </button>
                    )
                  })}
                  {(filters.viability_min !== 0 || filters.viability_max !== 100) && (
                    <button
                      onClick={() => set_filters((prev) => ({ ...prev, viability_min: 0, viability_max: 100 }))}
                      className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      <XIcon className="h-3 w-3" />Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Tags{filters.tags.length > 0 && <span className="text-primary ml-1">({filters.tags.length} selected)</span>}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {all_tags.map((tag) => {
                  const is_selected = filters.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => toggle_tag_filter(tag)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] transition-all",
                        is_selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active tag pills when panel closed */}
        {filters.tags.length > 0 && !show_filters && (
          <div className="flex flex-wrap gap-1.5">
            {filters.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggle_tag_filter(tag)}
                className="flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2 py-0.5 text-[11px] text-primary hover:bg-primary/20"
              >
                {tag}<XIcon className="h-2.5 w-2.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Table ---- */}
      <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
        {/* Use a plain <table> so we control layout precisely */}
        <table
          style={{ width: total_width, tableLayout: "fixed", borderCollapse: "collapse" }}
          className="text-xs"
        >
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.id} style={{ width: widths[col.id] }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-border bg-muted/50">
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  style={{ width: widths[col.id] }}
                  className="relative h-10 px-2 text-left align-middle font-medium overflow-hidden"
                >
                  {col.sortable && col.sort_key ? (
                    <SortHeader
                      label={col.label}
                      sort_key={col.sort_key}
                      current_key={sort_key}
                      current_dir={sort_dir}
                      on_sort={handle_sort}
                    />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{col.label}</span>
                  )}
                  <ResizeHandle col_id={col.id} on_drag_start={on_drag_start} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered_mechanics.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-16 text-center text-muted-foreground">
                  No mechanics match the current filters.
                  <br />
                  <button onClick={reset_filters} className="mt-2 text-xs text-primary underline">
                    Reset filters
                  </button>
                </td>
              </tr>
            ) : (
              filtered_mechanics.map((mechanic) => (
                <MechanicRow
                  key={mechanic.id}
                  mechanic={mechanic}
                  widths={widths}
                  on_drag_start={on_drag_start}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual row
// ---------------------------------------------------------------------------

interface MechanicRowProps {
  mechanic: Mechanic
  widths: Record<ColId, number>
  on_drag_start: (col_id: ColId, e: React.MouseEvent) => void
}

const MechanicRow: React.FC<MechanicRowProps> = ({ mechanic, widths, on_drag_start }) => {
  const [expanded, set_expanded] = useState(false)

  // Common cell style: clip overflow, allow text to wrap naturally
  const td = "p-2 align-top border-b border-border overflow-hidden"

  return (
    <>
      <tr
        className={cn("cursor-pointer transition-colors hover:bg-muted/50", expanded && "bg-muted/30")}
        onClick={() => set_expanded((v) => !v)}
      >
        {/* Name */}
        <td className={cn(td, "font-medium")} style={{ width: widths.name }}>
          <div className="flex flex-col gap-0.5 break-words">
            <span>{mechanic.name}</span>
            {mechanic.aliases && mechanic.aliases.length > 0 && (
              <span className="text-[11px] text-muted-foreground">aka {mechanic.aliases.join(", ")}</span>
            )}
            {mechanic.proponents && mechanic.proponents.length > 0 && (
              <span className="text-[11px] text-muted-foreground">by {mechanic.proponents.join(", ")}</span>
            )}
          </div>
        </td>

        {/* Category */}
        <td className={td} style={{ width: widths.category }}>
          <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", CATEGORY_COLORS[mechanic.category])}>
            {CATEGORY_LABELS[mechanic.category]}
          </span>
        </td>

        {/* Type */}
        <td className={td} style={{ width: widths.type }}>
          {mechanic.type
            ? <span className="text-xs text-muted-foreground">{TYPE_LABELS[mechanic.type]}</span>
            : <span className="text-muted-foreground/40">—</span>
          }
        </td>

        {/* Difficulty */}
        <td className={td} style={{ width: widths.difficulty }}>
          <DifficultyBar value={mechanic.difficulty} />
        </td>

        {/* Viability */}
        <td className={td} style={{ width: widths.viability }}>
          <ViabilityBar value={mechanic.viability} />
        </td>

        {/* Description + Tags */}
        <td className={td} style={{ width: widths.description }}>
          <p className="text-xs text-muted-foreground mb-1.5 break-words leading-relaxed">
            {mechanic.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {mechanic.tags.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1.5 whitespace-nowrap">
                {tag}
              </Badge>
            ))}
            {mechanic.tags.length > 6 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                +{mechanic.tags.length - 6}
              </Badge>
            )}
          </div>
        </td>

        {/* Video Clips */}
        <td
          className={td}
          style={{ width: widths.clips }}
          onClick={(e) => e.stopPropagation()}
        >
          {mechanic.video_clips && mechanic.video_clips.length > 0 ? (
            <div className="flex flex-col gap-2">
              {mechanic.video_clips.map((clip, i) => (
                <VideoClipPreview key={i} clip={clip} mechanic_name={mechanic.name} />
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-muted/20 hover:bg-muted/20">
          <td colSpan={COLUMNS.length} className="px-4 py-3 border-b border-border">
            <div className="flex flex-col gap-3 max-w-3xl">
              <p className="text-sm text-foreground leading-relaxed">{mechanic.description}</p>

              {mechanic.perform_instructions && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How to perform</span>
                  <p className="mt-1 text-sm font-mono bg-muted rounded px-2 py-1 inline-block break-words">
                    {mechanic.perform_instructions}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {mechanic.prerequisites && mechanic.prerequisites.length > 0 && (
                  <div>
                    <span className="font-semibold uppercase tracking-wide">Prerequisites</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {mechanic.prerequisites.map((p) => (
                        <Badge key={p} variant="outline" className="text-[11px]">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-semibold uppercase tracking-wide">All tags</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {mechanic.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>
                    ))}
                  </div>
                </div>
                {mechanic.proponents && mechanic.proponents.length > 0 && (
                  <div>
                    <span className="font-semibold uppercase tracking-wide">Known for</span>
                    <p className="mt-0.5">{mechanic.proponents.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default MechanicsTable
