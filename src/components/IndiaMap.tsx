import { memo, useMemo, useState, useRef, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from "react"
import {
  Shield,
  AlertTriangle,
  Bell,
  Activity,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Radio,
  Zap,
  Waves,
  Hospital,
} from "lucide-react"
import {
  assets,
  assetById,
  dependencies,
  downstreamOf,
  type Asset,
  type OrgCode,
} from "../data/infrastructure"

// Authentic polygon boundary of India (coordinate space 0..1000 width, 0..850 height)
export const INDIA_BOUNDARY: [number, number][] = [
  // Siachen & Karakoram
  [380, 52], [405, 62], [425, 76], [445, 102], [460, 126], [445, 150], [465, 160], [475, 180],
  // Aksai Chin & Ladakh eastern border
  [485, 192], [495, 215],
  // Himachal / Uttarakhand border with Tibet/Nepal
  [515, 230], [540, 250], [575, 275],
  // Nepal northern border to Sikkim
  [615, 285], [645, 290], [675, 280], [685, 260], [700, 280],
  // Bhutan border
  [715, 280], [745, 275],
  // Arunachal Pradesh & Himalayan border
  [765, 260], [805, 240], [840, 245], [865, 265], [855, 290],
  // Nagaland / Manipur / Myanmar border
  [835, 315], [820, 360], [810, 400], [805, 435],
  // Mizoram / Tripura south
  [785, 445], [775, 415], [765, 390],
  // Meghalaya & Bangladesh border
  [745, 375], [720, 335], [690, 335],
  // Siliguri corridor & West Bengal
  [660, 325], [675, 360], [700, 395],
  // Ganges delta / Kolkata / Sundarbans
  [690, 430], [670, 445],
  // Odisha coast (Bay of Bengal)
  [645, 470], [615, 505], [580, 550],
  // Andhra Pradesh coast
  [555, 590], [525, 630],
  // Tamil Nadu coast
  [505, 665], [490, 715],
  // Southern tip (Kanyakumari)
  [455, 770], [445, 755],
  // Kerala (Malabar coast)
  [435, 700], [420, 645],
  // Karnataka & Goa coast
  [400, 595], [375, 555], [355, 515],
  // Maharashtra coast (Mumbai)
  [335, 465], [320, 425], [310, 415],
  // Gujarat (Gulf of Khambhat & Kathiawar/Saurashtra peninsula)
  [290, 405], [260, 415], [225, 410], [215, 380], [240, 360],
  // Gulf of Kutch & Rann of Kutch
  [205, 345], [190, 320], [230, 300],
  // Rajasthan (Thar Desert / Pakistan border)
  [250, 290], [270, 250], [295, 220],
  // Punjab / Jammu border with Pakistan
  [305, 200], [295, 170], [280, 130], [300, 95], [330, 75], [360, 55]
]

// Convert polygon to SVG path string
export const INDIA_PATH_D = INDIA_BOUNDARY.reduce(
  (acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`),
  ""
) + " Z"

function isPointInPoly(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0]
    const yi = poly[i][1]
    const xj = poly[j][0]
    const yj = poly[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// Compute elevation heuristic for topographic shading (0.0 = low plains/coasts, 1.0 = Himalayas)
function getElevation(x: number, y: number): number {
  // Northern Himalayan belt
  if (y < 260) {
    const distToNorth = Math.max(0, (260 - y) / 210)
    return Math.min(1.0, 0.45 + distToNorth * 0.55)
  }
  // North-East hills (Arunachal, Assam, Meghalaya)
  if (x > 700 && y < 350) {
    return 0.65
  }
  // Western Ghats (narrow spine down the western coast: x ~ 330-410, y ~ 450-700)
  if (x > 340 && x < 420 && y > 450 && y < 700) {
    return 0.55
  }
  // Deccan plateau (central-south)
  if (x > 380 && x < 580 && y > 380 && y < 650) {
    return 0.38
  }
  // Indo-Gangetic Plains & Coastlines
  return 0.2
}

interface Dot {
  x: number
  y: number
  inside: boolean
  elevation: number
}

// Generate the matrix of dots across the entire map canvas
function generateDotMatrix(): Dot[] {
  const dots: Dot[] = []
  const step = 11.5
  for (let y = 35; y <= 790; y += step) {
    for (let x = 160; x <= 880; x += step) {
      const inside = isPointInPoly(x, y, INDIA_BOUNDARY)
      if (inside) {
        dots.push({
          x,
          y,
          inside: true,
          elevation: getElevation(x, y),
        })
      } else {
        // Outside points: sparse faint background matrix (just like the reference image!)
        if ((Math.round(x / step) + Math.round(y / step)) % 2 === 0 && Math.random() < 0.25) {
          dots.push({
            x,
            y,
            inside: false,
            elevation: 0,
          })
        }
      }
    }
  }
  return dots
}

const ORG_ICONS: Record<OrgCode, typeof Zap> = {
  WGEC: Zap,
  MetroWater: Waves,
  CCMN: Hospital,
}

interface IndiaMapProps {
  selectedAssetId?: string | null
  onAssetSelect?: (asset: Asset) => void
  onBannerAction?: (asset: Asset) => void
  className?: string
}

export const IndiaMap = memo(function IndiaMap({
  selectedAssetId,
  onAssetSelect,
  onBannerAction,
  className = "",
}: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1.0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredAsset, setHoveredAsset] = useState<Asset | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Generate dots once
  const dots = useMemo(() => generateDotMatrix(), [])

  // Downstream impact calculation
  const downstream = useMemo(
    () => (selectedAssetId ? downstreamOf(selectedAssetId) : new Set<string>()),
    [selectedAssetId]
  )

  // Selected asset or default top critical asset
  const selected = useMemo(
    () => (selectedAssetId ? assetById.get(selectedAssetId) : assets[0]),
    [selectedAssetId]
  )

  // Drag pan handlers
  const handlePointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-interactive]")) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handlePointerUp = (e: ReactPointerEvent) => {
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92
    setScale((prev) => Math.max(0.7, Math.min(2.5, prev * zoomFactor)))
  }

  const resetView = () => {
    setScale(1.0)
    setOffset({ x: 0, y: 0 })
  }

  // Active danger asset for floating HUD banner
  const criticalAsset = useMemo(() => assets.find((a) => a.level === "Critical") || assets[0], [])

  return (
    <div
      ref={containerRef}
      className={`india-map-container ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      {/* Background ambient radial glows */}
      <div className="india-map-ambient-glow" />
      <div className="india-map-ambient-glow-himalayas" />

      {/* Main SVG Map Canvas */}
      <svg
        className="india-map-svg"
        viewBox="0 0 1000 840"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 150ms ease-out",
        }}
      >
        <defs>
          {/* Glowing filters */}
          <filter id="india-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="india-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="india-contour-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#42b98b" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#28b8c5" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#1e8591" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#12515b" stopOpacity="0.2" />
          </linearGradient>

          <radialGradient id="india-pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e45b5b" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#e45b5b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e45b5b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* India Landmass Outline (Subtle ambient stroke & glow) */}
        <path
          d={INDIA_PATH_D}
          fill="rgba(8, 22, 28, 0.45)"
          stroke="rgba(40, 184, 197, 0.22)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Coordinate scan grid lines (matching reference image) */}
        <g stroke="rgba(40, 184, 197, 0.04)" strokeWidth="0.8" strokeDasharray="3 6">
          <line x1="100" y1="200" x2="900" y2="200" />
          <line x1="100" y1="360" x2="900" y2="360" />
          <line x1="100" y1="520" x2="900" y2="520" />
          <line x1="100" y1="680" x2="900" y2="680" />
          <line x1="300" y1="50" x2="300" y2="800" />
          <line x1="500" y1="50" x2="500" y2="800" />
          <line x1="700" y1="50" x2="700" y2="800" />
        </g>

        {/* Topographic Point Cloud Matrix */}
        <g className="india-dots-layer">
          {dots.map((dot, i) => {
            if (!dot.inside) {
              return (
                <circle
                  key={`bg-${i}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="0.9"
                  fill="rgba(40, 184, 197, 0.12)"
                />
              )
            }

            // Color and radius based on elevation
            let color = "rgba(40, 184, 197, 0.55)"
            let radius = 1.3
            if (dot.elevation > 0.65) {
              // High altitude: Himalayas (warm sand / gold highlight)
              color = "rgba(228, 200, 90, 0.88)"
              radius = 1.8
            } else if (dot.elevation > 0.45) {
              // Medium altitude: Northern foothills / Western Ghats (emerald)
              color = "rgba(66, 185, 139, 0.78)"
              radius = 1.6
            } else if (dot.elevation > 0.3) {
              // Deccan plateau (cyan-teal)
              color = "rgba(40, 184, 197, 0.65)"
              radius = 1.4
            }

            return (
              <circle
                key={`dot-${i}`}
                cx={dot.x}
                cy={dot.y}
                r={radius}
                fill={color}
              />
            )
          })}
        </g>

        {/* Cascade Dependency Arc Lines */}
        <g className="india-dependency-arcs">
          {dependencies.map((dep, idx) => {
            const from = assetById.get(dep.from)
            const to = assetById.get(dep.to)
            if (!from || !to) return null

            const isPathActive =
              selectedAssetId === dep.from ||
              selectedAssetId === dep.to ||
              downstream.has(dep.from) ||
              downstream.has(dep.to)

            const dx = to.x - from.x
            const dy = to.y - from.y
            const dist = Math.hypot(dx, dy)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2 - Math.min(50, dist * 0.28)

            return (
              <g key={`dep-${idx}`}>
                <path
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isPathActive ? "#28b8c5" : "rgba(40, 184, 197, 0.25)"}
                  strokeWidth={isPathActive ? "1.8" : "1.0"}
                  strokeDasharray={dep.kind === "potential" ? "4 4" : "none"}
                />
                {isPathActive && (
                  <circle
                    r="2.5"
                    fill="#28b8c5"
                    filter="url(#india-node-glow)"
                  >
                    <animateMotion
                      path={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            )
          })}
        </g>

        {/* Pulsating danger radar rings for Critical assets */}
        <g className="india-radar-pulses">
          {assets
            .filter((a) => a.level === "Critical")
            .map((asset) => (
              <g key={`pulse-${asset.id}`} transform={`translate(${asset.x}, ${asset.y})`}>
                <circle r="18" fill="url(#india-pulse-grad)">
                  <animate
                    attributeName="r"
                    values="10;32;42"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.3;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  r="12"
                  fill="none"
                  stroke="#e45b5b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="12s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
        </g>

        {/* Interactive Asset Nodes on the Map */}
        <g className="india-assets-layer">
          {assets.map((asset) => {
            const isSelected = selectedAssetId === asset.id
            const isDownstream = downstream.has(asset.id)
            const isCritical = asset.level === "Critical"
            const isHigh = asset.level === "High"

            let badgeColor = "#42b98b"
            let badgeBg = "rgba(66, 185, 139, 0.2)"
            let badgeBorder = "#42b98b"

            if (isCritical) {
              badgeColor = "#e45b5b"
              badgeBg = "rgba(228, 91, 91, 0.28)"
              badgeBorder = "#e45b5b"
            } else if (isHigh) {
              badgeColor = "#e99a43"
              badgeBg = "rgba(233, 154, 67, 0.25)"
              badgeBorder = "#e99a43"
            }

            return (
              <g
                key={asset.id}
                data-interactive="true"
                transform={`translate(${asset.x}, ${asset.y})`}
                className={`india-asset-node ${isSelected ? "is-selected" : ""}`}
                onClick={() => onAssetSelect?.(asset)}
                onMouseEnter={() => setHoveredAsset(asset)}
                onMouseLeave={() => setHoveredAsset(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Outer halo when selected or hovered */}
                {(isSelected || hoveredAsset?.id === asset.id) && (
                  <circle
                    r="16"
                    fill="none"
                    stroke={badgeColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="india-node-ring-spin"
                  />
                )}

                {/* Main badge node */}
                <circle
                  r={isSelected ? "9" : "7.5"}
                  fill={badgeBg}
                  stroke={badgeBorder}
                  strokeWidth={isSelected ? "2.2" : "1.6"}
                  filter={isCritical || isSelected ? "url(#india-node-glow)" : undefined}
                />

                {/* Inner status icon or dot */}
                {isCritical ? (
                  <circle r="3.2" fill="#e45b5b" />
                ) : isHigh ? (
                  <circle r="2.8" fill="#e99a43" />
                ) : (
                  <circle r="2.4" fill="#42b98b" />
                )}

                {/* Clean floating node label */}
                <text
                  x="12"
                  y="4"
                  fill={isSelected ? "#ffffff" : "rgba(231, 237, 243, 0.85)"}
                  fontSize="10"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight={isSelected ? "650" : "500"}
                  letterSpacing="0.02em"
                  className="india-node-text"
                >
                  {asset.location}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Floating Alert Pill (e.g. Unsafe connection to the UPS - from reference image!) */}
      {!bannerDismissed && (
        <div
          data-interactive="true"
          className="india-hud-alert-pill"
          onClick={() => {
            if (criticalAsset) {
              onAssetSelect?.(criticalAsset)
              onBannerAction?.(criticalAsset)
            }
          }}
        >
          <span className="india-hud-alert-icon">
            <AlertTriangle size={13} />
          </span>
          <span className="india-hud-alert-text">
            Unsafe Connection to SCADA Gateway · New Delhi
          </span>
          <button
            className="india-hud-alert-close"
            onClick={(e) => {
              e.stopPropagation()
              setBannerDismissed(true)
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Map Navigation & Zoom Controls Pill */}
      <div data-interactive="true" className="india-map-controls-pill">
        <button
          onClick={() => setScale((s) => Math.max(0.7, s / 1.25))}
          title="Zoom out"
          className="india-ctrl-btn"
        >
          <ZoomOut size={13} />
        </button>
        <button onClick={resetView} title="Reset view" className="india-ctrl-btn text-xs font-semibold">
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={() => setScale((s) => Math.min(2.5, s * 1.25))}
          title="Zoom in"
          className="india-ctrl-btn"
        >
          <ZoomIn size={13} />
        </button>
        <span className="india-ctrl-divider" />
        <button onClick={resetView} title="Center India" className="india-ctrl-btn">
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Hover asset tooltip */}
      {hoveredAsset && (
        <div
          className="india-map-tooltip"
          style={{
            left: `${(hoveredAsset.x / 1000) * 100}%`,
            top: `${(hoveredAsset.y / 840) * 100}%`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`india-tooltip-dot level-${hoveredAsset.level.toLowerCase()}`}
            />
            <strong>{hoveredAsset.name}</strong>
          </div>
          <div className="india-tooltip-sub">
            {hoveredAsset.location} · {hoveredAsset.vulnerability}
          </div>
          <div className="india-tooltip-risk">
            Risk Score: <strong>{hoveredAsset.risk}</strong> · {hoveredAsset.exposure}
          </div>
        </div>
      )}
    </div>
  )
})
