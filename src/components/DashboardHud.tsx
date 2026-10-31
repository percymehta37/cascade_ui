import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  Bell,
  Activity,
  ChevronDown,
  User,
  SlidersHorizontal,
  RotateCcw,
  Volume2,
  TrendingUp,
  Download,
} from "lucide-react"

// Waveform visualizer data
const WAVEFORM_BARS = [
  18, 25, 42, 65, 80, 52, 44, 90, 72, 60, 48, 85, 95, 78, 62, 45, 70, 88, 55, 38,
  64, 82, 91, 58, 42, 75, 60, 48, 32, 54, 70, 85, 62, 44, 58, 77, 65, 50, 40, 25,
]

// 1. Alerts Intensity in Blocks (Left Side HUD)
export function AlertsIntensityChart() {
  const [timeframe, setTimeframe] = useState("Monthly Trend")
  const [windowRange, setWindowRange] = useState("Last 12 Hour")

  return (
    <div className="hud-intensity-wrap">
      <div className="hud-subhead">Alerts Intensity in Blocks</div>

      {/* Waveform / Frequency visualizer */}
      <div className="hud-waveform-container">
        {/* Min/max threshold markers */}
        <div className="hud-wave-markers">
          <span className="hud-marker-tag">316</span>
          <span className="hud-marker-tag text-right">564</span>
        </div>

        <div className="hud-waveform-bars">
          {WAVEFORM_BARS.map((height, i) => (
            <div
              key={i}
              className={`hud-wave-bar ${height > 75 ? "is-peak" : height > 50 ? "is-mid" : ""}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Lower threshold indicators */}
        <div className="hud-wave-lower-markers">
          <span>72</span>
          <span className="hud-center-dot">▲ 50</span>
          <span>100</span>
        </div>
      </div>

      {/* Control pills row */}
      <div className="hud-filter-pills">
        <button className="hud-pill-btn">
          <span>{timeframe}</span>
          <ChevronDown size={11} />
        </button>
        <button className="hud-pill-btn">
          <span>{windowRange}</span>
          <ChevronDown size={11} />
        </button>
        <button className="hud-pill-icon-btn" title="Audio / Signal">
          <Volume2 size={12} />
        </button>
        <button className="hud-pill-icon-btn" title="Reset view">
          <RotateCcw size={12} />
        </button>
        <button className="hud-pill-icon-btn" title="Export data">
          <Download size={12} />
        </button>
      </div>
    </div>
  )
}

// 2. Circular Radial Arc Gauge (Right Side HUD)
export function RadialGauge({
  label,
  current,
  total,
  percent,
  color = "#42b98b",
}: {
  label: string
  current: string
  total: string
  percent: number // 0 to 100
  color?: string
}) {
  const radius = 28
  const stroke = 4
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  // Arc angle (260 degree arc)
  const arcLength = circumference * 0.72
  const strokeDashoffset = arcLength - (percent / 100) * arcLength

  return (
    <div className="hud-radial-gauge-item">
      <div className="hud-radial-svg-wrap">
        <svg height={radius * 2} width={radius * 2} className="hud-gauge-svg">
          {/* Background track arc */}
          <circle
            stroke="rgba(40, 184, 197, 0.15)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeDashoffset: 0 }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(140 ${radius} ${radius})`}
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(140 ${radius} ${radius})`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="hud-gauge-details">
        <div className="hud-gauge-label">{label}</div>
        <div className="hud-gauge-metric">
          <strong>{current}</strong>
          <span>/ {total}</span>
        </div>
      </div>
    </div>
  )
}

// 3. Personnel / AI Sentinel Stack (Right Side HUD)
export function PersonnelStack() {
  const [open, setOpen] = useState(false)
  const agents = [
    { name: "Sem Brinkman", role: "SecOps Lead", status: "Active" },
    { name: "James Carter", role: "SCADA Sentinel", status: "Monitoring" },
    { name: "David Moore", role: "Containment Officer", status: "Standby" },
  ]

  return (
    <div className="hud-personnel-stack">
      {agents.map((agent, i) => (
        <div key={i} className="hud-person-row">
          <div className="hud-person-avatar">
            <User size={12} />
          </div>
          <span className="hud-person-name">{agent.name}</span>
          <ChevronDown size={11} className="hud-person-arrow" />
        </div>
      ))}
    </div>
  )
}

// 4. 360 View by Blocks (Bottom Left HUD)
export function BlockView360() {
  const rows = 5
  const cols = 12

  // Some highlighted coordinates for the micro HUD grid
  const highlights = [
    { r: 2, c: 3, type: "shield" },
    { r: 1, c: 7, type: "shield" },
    { r: 3, c: 9, type: "alert" },
    { r: 4, c: 8, type: "danger" },
  ]

  return (
    <div className="hud-block-view-wrap">
      <div className="hud-block-title">360 View by Blocks</div>
      <div className="hud-block-grid-area">
        {/* Row labels */}
        <div className="hud-block-row-labels">
          <span>Attack</span>
          <span>Delete</span>
          <span>Failure</span>
          <span>Lockout</span>
        </div>

        {/* Matrix grid container */}
        <div className="hud-micro-matrix">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="hud-matrix-row">
              {Array.from({ length: cols }).map((_, c) => {
                const hl = highlights.find((h) => h.r === r && h.c === c)
                return (
                  <span
                    key={c}
                    className={`hud-matrix-dot ${hl ? `is-${hl.type}` : ""}`}
                  />
                )
              })}
            </div>
          ))}

          {/* Micro HUD pill inside the matrix */}
          <div className="hud-matrix-pill">
            <span className="hud-matrix-pill-alert">⚠️ Unsafe connection to the UPS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 5. Total Attacks by Alerts (Bottom Right HUD)
export function TotalAttacksStats() {
  return (
    <div className="hud-total-attacks-wrap">
      <div className="hud-attacks-header">Total Attacks by Alerts</div>
      <div className="hud-attacks-items">
        {/* Protected */}
        <div className="hud-attack-stat">
          <div className="hud-stat-tag">
            <Shield size={13} className="text-[#42b98b]" />
            <span>Protected</span>
          </div>
          <div className="hud-stat-num">
            <strong>882k</strong>
            <small>/ 992k</small>
          </div>
        </div>

        {/* Danger */}
        <div className="hud-attack-stat">
          <div className="hud-stat-tag">
            <AlertTriangle size={13} className="text-[#e45b5b]" />
            <span>Danger</span>
          </div>
          <div className="hud-stat-num">
            <strong>1.2k</strong>
            <small>/ 992k</small>
          </div>
        </div>

        {/* Alerts */}
        <div className="hud-attack-stat">
          <div className="hud-stat-tag">
            <Bell size={13} className="text-[#e99a43]" />
            <span>Alerts</span>
          </div>
          <div className="hud-stat-num">
            <strong>7.4k</strong>
            <small>/ 992k</small>
          </div>
        </div>

        {/* Unknown */}
        <div className="hud-attack-stat">
          <div className="hud-stat-tag">
            <Activity size={13} className="text-[#9aaab8]" />
            <span>Unknown</span>
          </div>
          <div className="hud-stat-num">
            <strong>1.1k</strong>
            <small>/ 992k</small>
          </div>
        </div>
      </div>
    </div>
  )
}
