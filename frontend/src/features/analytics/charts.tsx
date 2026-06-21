/**
 * Lightweight presentational charts for the analytics screen (EM7). Hand-rolled
 * inline SVG (no charting dependency) — they scale to their container via a fixed
 * `viewBox` and `w-full h-auto`, and use the app's ember accent. Pure: they only
 * render the `{ label, value }[]` they're given.
 */

/** A single labelled datum on a chart. */
export interface ChartPoint {
  readonly label: string
  readonly value: number
}

const VIEW_W = 320
const VIEW_H = 150
const PAD_TOP = 12
const PAD_BOTTOM = 24

/** Largest value, never zero (so an all-empty chart still has a sane scale). */
function safeMax(points: readonly ChartPoint[]): number {
  return Math.max(1, ...points.map((p) => p.value))
}

/**
 * Vertical bars — used for weekly volume / frequency. The most recent bar (last)
 * is emphasized so "this week" reads at a glance.
 */
export function BarChart({ data, formatValue }: {
  data: readonly ChartPoint[]
  formatValue?: (value: number) => string
}) {
  if (data.length === 0) return null
  const max = safeMax(data)
  const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const slot = VIEW_W / data.length
  const barW = slot * 0.56

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full" role="img" preserveAspectRatio="none">
      {data.map((point, i) => {
        const h = (point.value / max) * plotH
        const x = slot * i + (slot - barW) / 2
        const y = PAD_TOP + plotH - h
        const isLast = i === data.length - 1
        return (
          <g key={point.label + i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, point.value > 0 ? 2 : 0)}
              rx={3}
              className={isLast ? 'fill-orange-500' : 'fill-orange-200'}
            />
            <text
              x={slot * i + slot / 2}
              y={VIEW_H - 8}
              textAnchor="middle"
              className="fill-zinc-400 text-[9px]"
            >
              {point.label}
            </text>
          </g>
        )
      })}
      {formatValue ? (
        <text x={VIEW_W} y={PAD_TOP - 2} textAnchor="end" className="fill-zinc-400 text-[9px]">
          {formatValue(max)}
        </text>
      ) : null}
    </svg>
  )
}

/**
 * A trend line — used for bodyweight evolution. Renders the path, a soft area
 * fill, and a dot on every point (the latest emphasized).
 */
export function LineChart({ data, formatValue }: {
  data: readonly ChartPoint[]
  formatValue?: (value: number) => string
}) {
  if (data.length === 0) return null
  const values = data.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const plotW = VIEW_W - 8
  const plotH = VIEW_H - PAD_TOP - PAD_BOTTOM

  const x = (i: number) => 4 + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
  const y = (value: number) => PAD_TOP + plotH - ((value - min) / span) * plotH

  const linePath = data.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const areaPath =
    data.length > 1
      ? `${linePath} L${x(data.length - 1).toFixed(1)},${(PAD_TOP + plotH).toFixed(1)} L${x(0).toFixed(1)},${(
          PAD_TOP + plotH
        ).toFixed(1)} Z`
      : ''

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full" role="img" preserveAspectRatio="none">
      {areaPath ? <path d={areaPath} className="fill-orange-100/70" /> : null}
      <path d={linePath} fill="none" className="stroke-orange-500" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((p, i) => (
        <circle
          key={p.label + i}
          cx={x(i)}
          cy={y(p.value)}
          r={i === data.length - 1 ? 3.5 : 2}
          className={i === data.length - 1 ? 'fill-orange-600' : 'fill-orange-400'}
        />
      ))}
      {/* First and last labels only, to avoid crowding. */}
      <text x={4} y={VIEW_H - 8} textAnchor="start" className="fill-zinc-400 text-[9px]">
        {data[0].label}
      </text>
      {data.length > 1 ? (
        <text x={VIEW_W - 4} y={VIEW_H - 8} textAnchor="end" className="fill-zinc-400 text-[9px]">
          {data[data.length - 1].label}
        </text>
      ) : null}
      {formatValue ? (
        <text x={VIEW_W - 4} y={PAD_TOP - 2} textAnchor="end" className="fill-zinc-500 text-[10px] font-semibold">
          {formatValue(data[data.length - 1].value)}
        </text>
      ) : null}
    </svg>
  )
}
