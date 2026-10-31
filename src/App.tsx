import { useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  Bell,
  Blocks,
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  GitBranch,
  Globe2,
  Hospital,
  Layers3,
  ListFilter,
  LockKeyhole,
  Map,
  MapPin,
  Menu,
  Network,
  PanelRightClose,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  Waves,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { TerrainMap } from "./components/terrain/TerrainMap"
import { Maximize2 } from "lucide-react"
import FullScreenMap from "./components/FullScreenMap"
import { assets, assetById, organisations as orgData, orgByCode, riskHex, type Asset } from "./data/infrastructure"

type Page = "Command Centre" | "Infrastructure View" | "Asset Inventory" | "Risk Intelligence" | "AI Agent Activity" | "Remediation Centre" | "Blockchain Audit" | "Settings" | "Full Screen Map"
type Risk = "Critical" | "High" | "Medium" | "Low"

interface NavItem {
  label: Page
  icon: typeof Shield
}

const nav: NavItem[] = [
  { label: "Command Centre", icon: CircleGauge },
  { label: "Infrastructure View", icon: Map },
  { label: "Asset Inventory", icon: Database },
  { label: "Full Screen Map", icon: Maximize2 },
  { label: "Risk Intelligence", icon: ShieldAlert },
  { label: "AI Agent Activity", icon: Bot },
  { label: "Remediation Centre", icon: FileCheck2 },
  { label: "Blockchain Audit", icon: Blocks },
  { label: "Settings", icon: Settings },
]

const orgIcons = { WGEC: Zap, MetroWater: Waves, CCMN: Hospital }
const orgColors = { WGEC: "#28B8C5", MetroWater: "#E99A43", CCMN: "#42B98B" }
const organisations = orgData.map((org) => ({ ...org, icon: orgIcons[org.code], color: orgColors[org.code] }))
const riskColors = riskHex

const pageDescriptions: Record<Page, string> = {
  "Command Centre": "Cross-organisation risk posture and priority actions",
  "Infrastructure View":
    "Explore infrastructure assets and dependency pathways",
  "Asset Inventory": "Search and assess all monitored infrastructure assets",
  "Full Screen Map": "Full-screen view of Indian infrastructure terrain",
  "Risk Intelligence":
    "Evidence, model explanations and downstream consequence analysis",
  "AI Agent Activity": "Review agent executions, decisions and system traces",
  "Remediation Centre":
    "Compare controls, simulate outcomes and manage approvals",
  "Blockchain Audit": "Verify registrations, attestations and approval records",
  Settings: "Organisation, access and assessment preferences",
}

function Button({
  children,
  variant = "secondary",
  className = "",
  onClick,
  disabled = false,
  title,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "danger" | "ghost"
  className?: string
  onClick?: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  )
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: string
}) {
  return <span className={`badge badge-${tone.toLowerCase()}`}>{children}</span>
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Sidebar({
  page,
  setPage,
  open,
  setOpen,
}: {
  page: Page
  setPage: (p: Page) => void
  open: boolean
  setOpen: (v: boolean) => void
}) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <Shield size={21} strokeWidth={1.7} />
          <span className="brand-pulse" />
        </div>
        <div>
          <strong>CascadeShield</strong>
          <span>Infrastructure resilience</span>
        </div>
        <Button
          variant="ghost"
          className="sidebar-close"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </Button>
      </div>
      <nav className="nav-list">
        <div className="nav-caption">Workspace</div>
        {nav.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => {
              setPage(label)
              setOpen(false)
            }}
            className={`nav-item ${page === label ? "active" : ""}`}
          >
            <Icon size={17} strokeWidth={1.7} />
            <span>{label}</span>
            {page === label && <ChevronRight size={14} className="nav-arrow" />}
          </button>
        ))}
      </nav>
      <div className="org-switcher">
        <div className="org-title">
          <span>Active organisations</span>
          <Badge tone="healthy">3 online</Badge>
        </div>
        {organisations.map(({ code, name, color, icon: Icon }) => (
          <button className="org-row" key={code}>
            <span className="org-icon" style={{ color }}>
              <Icon size={15} />
            </span>
            <span>
              <strong>{code}</strong>
              <small>{name}</small>
            </span>
            <span className="status-dot" style={{ background: color }} />
          </button>
        ))}
        <button className="manage-orgs">
          Manage organisations <ArrowRight size={13} />
        </button>
      </div>
    </aside>
  )
}

function Header({
  page,
  onMenu,
  onSearch,
}: {
  page: Page
  onMenu: () => void
  onSearch: (v: string) => void
}) {
  return (
    <header className="topbar">
      <Button variant="ghost" className="menu-btn" onClick={onMenu}>
        <Menu size={20} />
      </Button>
      <div className="page-heading">
        <h1>{page}</h1>
        <p>{pageDescriptions[page]}</p>
      </div>
      <div className="top-actions">
        <label className="global-search">
          <Search size={16} />
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search assets, advisories, organisations…"
          />
          <kbd>⌘ K</kbd>
        </label>
        <Button variant="secondary" className="icon-btn" title="Notifications">
          <Bell size={17} />
          <span className="notification-dot" />
        </Button>
        <button className="profile">
          <span className="avatar">AL</span>
          <span>
            <strong>Alex Lin</strong>
            <small>Security Lead</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  )
}

function Kpis() {
  const items = [
    ["Monitored organisations", "03", Globe2, "+1 this quarter", "neutral"],
    ["Total assets", "75", Database, "72 assessed", "neutral"],
    ["Critical risks", "04", ShieldAlert, "1 new finding", "critical"],
    ["Active advisories", "12", AlertTriangle, "3 require review", "high"],
    ["Pending approvals", "02", Clock3, "Oldest · 4h 12m", "medium"],
  ] as const
  return (
    <div className="kpi-grid">
      {items.map(([label, value, Icon, meta, tone]) => (
        <div className={`kpi-card tone-${tone}`} key={label}>
          <div className="kpi-top">
            <span>{label}</span>
            <Icon size={17} />
          </div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-meta">{meta}</div>
        </div>
      ))}
    </div>
  )
}

interface ActiveRiskProps {
  asset: Asset
  onDetails: () => void
  onContain: () => void
}

function ActiveRisk({ asset, onDetails, onContain }: ActiveRiskProps) {
  const org = orgByCode[asset.org]
  const delta = asset.risk - 75
  const steps = asset.cascade.split(" → ")
  return (
    <aside className="risk-panel panel">
      <SectionTitle eyebrow="Selected asset" title="Active risk" action={<Badge tone={asset.level}>{asset.level}</Badge>} />
      <div className="asset-identity">
        <div className={`risk-icon tone-${asset.level.toLowerCase()}`}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <strong>{asset.id}</strong>
          <span>{asset.name}</span>
        </div>
      </div>
      <div className="risk-score-block">
        <div>
          <span>Risk score</span>
          <strong style={{ color: riskColors[asset.level] }}>{asset.risk.toFixed(2)}</strong>
          <small>/ 100</small>
        </div>
        <div className="risk-bar">
          <i style={{ width: `${asset.risk}%`, background: riskColors[asset.level] }} />
        </div>
        <p className={delta >= 0 ? "above" : ""}>
          {delta >= 0 ? `${delta.toFixed(2)} points above` : `${Math.abs(delta).toFixed(2)} points below`} critical threshold (75)
        </p>
      </div>
      <div className="stat-pair">
        <div>
          <span>Compromise likelihood</span>
          <strong>{asset.likelihood}%</strong>
        </div>
        <div>
          <span>Impact</span>
          <strong>{asset.impact}%</strong>
        </div>
      </div>
      <div className="info-list">
        <div>
          <span>Organisation</span>
          <strong>
            {org.code} · {org.name}
          </strong>
        </div>
        <div>
          <span>Primary finding</span>
          <strong>{asset.vulnerability}</strong>
        </div>
        <div>
          <span>Exposure</span>
          <strong>{asset.exposure}</strong>
        </div>
        <div className="cascade">
          <span>Potential cascade</span>
          <strong>
            {steps.map((step, i) => (
              <span key={step}>
                {i > 0 && <ArrowRight size={12} />}
                {step}
              </span>
            ))}
          </strong>
        </div>
      </div>
      <div className="risk-actions">
        <Button className="grow" onClick={onDetails}>
          <Eye size={15} />
          View details
        </Button>
        <Button className="grow" variant="danger" onClick={onContain}>
          <LockKeyhole size={15} />
          Start containment
        </Button>
      </div>
      <div className="updated">
        <Clock3 size={12} />
        Assessed 8 minutes ago · click any marker on the map to inspect it
      </div>
    </aside>
  )
}

function RiskDistribution() {
  const data = [
    { name: "Critical", value: 4 },
    { name: "High", value: 11 },
    { name: "Medium", value: 18 },
    { name: "Low", value: 42 },
  ]
  return (
    <section className="panel dashboard-panel">
      <SectionTitle
        eyebrow="Portfolio exposure"
        title="Risk distribution"
        action={
          <Button variant="ghost">
            View report <ArrowRight size={14} />
          </Button>
        }
      />
      <div className="donut-wrap">
        <div className="donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={riskColors[(d.name as Risk)]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-total">
            <strong>75</strong>
            <span>assets</span>
          </div>
        </div>
        <div className="risk-legend">
          {data.map((d) => (
            <div key={d.name}>
              <span
                className="legend-dot"
                style={{ background: riskColors[(d.name as Risk)] }}
              />
              <span>{d.name}</span>
              <strong>{d.value}</strong>
              <small>{Math.round((d.value / 75) * 100)}%</small>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-foot">
        <ArrowDownRight size={14} /> Critical exposure down{" "}
        <strong>8.4%</strong> over 30 days
      </div>
    </section>
  )
}

const agents = [
  ["Intake", "Completed"],
  ["Risk", "Completed"],
  ["Cascade", "Running"],
  ["Planner", "Waiting"],
  ["Critic", "Waiting"],
  ["Executor", "Waiting"],
]
function AgentPipeline({ onTrace }: { onTrace: () => void }) {
  return (
    <section className="panel dashboard-panel agent-panel">
      <SectionTitle
        eyebrow="Assessment run · CS-2841"
        title="AI agent pipeline"
        action={<Badge tone="running">In review</Badge>}
      />
      <div className="pipeline">
        {agents.map(([name, status], i) => (
          <div className="agent-step" key={name}>
            <div className={`agent-node ${status.toLowerCase()}`}>
              {status === "Completed" ? (
                <Check size={14} />
              ) : status === "Running" ? (
                <Activity size={14} />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <strong>{name}</strong>
            <span>{status}</span>
            {i < agents.length - 1 && <i />}
          </div>
        ))}
      </div>
      <div className="agent-insight">
        <Bot size={17} />
        <div>
          <strong>Cascade Agent is evaluating 14 dependency paths</strong>
          <p>2 plausible cross-organisation propagation routes identified.</p>
        </div>
      </div>
      <Button variant="secondary" className="full" onClick={onTrace}>
        <GitBranch size={15} />
        Open execution trace <ArrowRight size={14} />
      </Button>
    </section>
  )
}

function RecommendedAction({
  onApprove,
  onSimulate,
}: {
  onApprove: () => void
  onSimulate: () => void
}) {
  return (
    <section className="panel dashboard-panel action-panel">
      <SectionTitle
        eyebrow="Priority recommendation"
        title="Recommended action"
        action={<Badge tone="high">Approval required</Badge>}
      />
      <div className="recommendation">
        <div className="recommend-icon">
          <LockKeyhole size={18} />
        </div>
        <div>
          <strong>Isolate PG-003 and restrict external access</strong>
          <p>
            Preserve access through the internal jump host while the gateway is
            patched and revalidated.
          </p>
        </div>
      </div>
      <div className="risk-reduction">
        <div>
          <span>Current risk</span>
          <strong>79.13</strong>
        </div>
        <ArrowRight size={18} />
        <div>
          <span>Projected risk</span>
          <strong className="healthy">31.40</strong>
        </div>
        <div className="reduction">
          <span>−60%</span>reduction
        </div>
      </div>
      <div className="action-meta">
        <span>
          <Activity size={14} />
          Low operational impact
        </span>
        <span>
          <UserRound size={14} />2 approvers required
        </span>
      </div>
      <div className="action-buttons">
        <Button variant="primary" onClick={onApprove}>
          <Check size={15} />
          Approve & execute
        </Button>
        <Button variant="secondary" onClick={onSimulate}>
          <SlidersHorizontal size={15} />
          Simulate alternatives
        </Button>
      </div>
    </section>
  )
}

interface PageDrawerProps {
  openDrawer: (asset: Asset) => void
}

interface CommandCentreProps extends PageDrawerProps {
  openModal: (mode: string) => void
  openTrace: () => void
}

function CommandCentre({ openDrawer, openModal, openTrace }: CommandCentreProps) {
  const [selectedId, setSelectedId] = useState("PG-003")
  const selected = assetById.get(selectedId) ?? assets[0]
  return (
    <div className="cc-fullmap">
      {/* Full-screen terrain map background */}
      <div className="cc-map-bg">
        <TerrainMap
          selectedAssetId={selectedId}
          onAssetSelect={(asset) => {
            setSelectedId(asset.id)
            openDrawer(asset)
          }}
          wheelZoom="always"
        />
      </div>

      {/* Glassmorphic overlay panels */}
      <div className="cc-overlay">
        {/* Top row: KPI strip */}
        <div className="cc-kpi-strip glass-panel">
          <Kpis />
        </div>

        {/* Middle section: left charts + right risk panel */}
        <div className="cc-mid">
          <div className="cc-left-stack">
            <div className="glass-panel cc-chart-card">
              <RiskDistribution />
            </div>
            <div className="glass-panel cc-chart-card">
              <AgentPipeline onTrace={openTrace} />
            </div>
          </div>
          <div className="cc-right-stack">
            <div className="glass-panel cc-risk-card">
              <ActiveRisk asset={selected} onDetails={() => openDrawer(selected)} onContain={() => openModal("contain")} />
            </div>
            <div className="glass-panel cc-action-card">
              <RecommendedAction onApprove={() => openModal("approve")} onSimulate={() => openModal("simulate")} />
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="cc-bottom-bar glass-panel">
          <div className="cc-stat-item">
            <Shield size={14} className="cc-stat-icon protected" />
            <span>Protected</span>
            <strong>882k</strong>
            <small>/ 912k</small>
          </div>
          <div className="cc-stat-item">
            <AlertTriangle size={14} className="cc-stat-icon danger" />
            <span>Danger</span>
            <strong>1.2k</strong>
            <small>/ 912k</small>
          </div>
          <div className="cc-stat-item">
            <Bell size={14} className="cc-stat-icon alerts" />
            <span>Alerts</span>
            <strong>7.4k</strong>
            <small>/ 912k</small>
          </div>
          <div className="cc-stat-item">
            <Activity size={14} className="cc-stat-icon unknown" />
            <span>Unknown</span>
            <strong>1.1k</strong>
            <small>/ 912k</small>
          </div>
        </div>
      </div>
    </div>
  )
}

function FullScreenMapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return (
    <div className="cc-fullmap">
      <div className="cc-map-bg">
        <TerrainMap
          selectedAssetId={selectedId ?? undefined}
          onAssetSelect={(asset) => setSelectedId(asset.id)}
          wheelZoom="always"
        />
      </div>
    </div>
  )
}

function InfrastructurePage({ openDrawer }: PageDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>("PG-003")
  return (
    <div className="workspace workspace-map">
      <div className="workspace-tools">
        <div>
          <Badge tone="healthy">{assets.length} priority assets mapped</Badge>
          <span className="muted">75 monitored · 22 service zones · 13 dependency paths</span>
        </div>
        <div>
          <Button variant="primary">
            <Plus size={15} />
            Register asset
          </Button>
        </div>
      </div>
      <section className="map-stage map-stage-large">
        <TerrainMap
          wheelZoom="always"
          selectedAssetId={selectedId}
          onAssetSelect={(asset) => {
            setSelectedId(asset.id)
            openDrawer(asset)
          }}
        />
      </section>
    </div>
  )
}

function AssetInventory({
  search,
  openDrawer,
}: {
  search: string
  openDrawer: (a: Asset) => void
}) {
  const [risk, setRisk] = useState("All")
  const filtered = assets.filter(
    (a) =>
      (risk === "All" || a.level === risk) &&
      `${a.id} ${a.name} ${a.org}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <div className="workspace">
      <div className="filterbar">
        <label className="table-search">
          <Search size={15} />
          <input placeholder="Search asset inventory" defaultValue={search} />
        </label>
        <div className="filter-pills">
          {["All", "Critical", "High", "Medium", "Low"].map((r) => (
            <button
              className={risk === r ? "active" : ""}
              onClick={() => setRisk(r)}
              key={r}
            >
              {r}
            </button>
          ))}
        </div>
        <Button variant="secondary">
          <ListFilter size={15} />
          More filters
        </Button>
        <Button variant="secondary">
          Export <ExternalLink size={14} />
        </Button>
      </div>
      <div className="table-panel">
        <div className="table-summary">
          <span>
            <strong>{filtered.length}</strong> assets shown
          </span>
          <span>Last assessment sync · 8 min ago</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Organisation</th>
                <th>Type</th>
                <th>Exposure</th>
                <th>Vulnerability</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Risk score</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} onClick={() => openDrawer(a)}>
                  <td>
                    <strong>{a.id}</strong>
                    <span>{a.name}</span>
                  </td>
                  <td>{a.org}</td>
                  <td>{a.type}</td>
                  <td>{a.exposure}</td>
                  <td>
                    <Badge
                      tone={a.vulnerability === "Patched" ? "healthy" : "high"}
                    >
                      {a.vulnerability}
                    </Badge>
                  </td>
                  <td>{a.likelihood}%</td>
                  <td>{a.impact}%</td>
                  <td>
                    <div className="risk-cell">
                      <strong style={{ color: riskColors[a.level] }}>
                        {a.risk.toFixed(2)}
                      </strong>
                      <Badge tone={a.level}>{a.level}</Badge>
                    </div>
                  </td>
                  <td>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState
              title="No matching assets"
              body="Adjust your search or risk filters to see more results."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function RiskIntelligence() {
  const [tab, setTab] = useState("Overview")
  return (
    <div className="workspace detail-workspace">
      <div className="entity-header">
        <div className="entity-icon">
          <Zap size={20} />
        </div>
        <div>
          <span>WGEC · Grid Utility</span>
          <h2>PG-003 · Northern Grid SCADA Gateway</h2>
        </div>
        <Badge tone="critical">Critical risk</Badge>
        <Button variant="secondary">Generate report</Button>
      </div>
      <div className="tabs">
        {[
          "Overview",
          "Vulnerabilities",
          "Model explanation",
          "Risk history",
          "Consequences",
        ].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="risk-intel-grid">
        <section className="panel score-card">
          <span>Compromise likelihood</span>
          <strong>82%</strong>
          <div className="mini-bar">
            <i style={{ width: "82%" }} />
          </div>
          <p>Probability of compromise within the assessment horizon.</p>
          <small>+11% after advisory ingestion</small>
        </section>
        <section className="panel score-card">
          <span>Operational impact</span>
          <strong>95%</strong>
          <div className="mini-bar impact">
            <i style={{ width: "95%" }} />
          </div>
          <p>Severity if the asset becomes unavailable or untrusted.</p>
          <small>Critical service dependency</small>
        </section>
        <section className="panel score-card final">
          <span>Final risk score</span>
          <strong>79.13</strong>
          <div className="mini-bar">
            <i style={{ width: "79.13%" }} />
          </div>
          <p>Combined likelihood, impact and control effectiveness.</p>
          <small>Critical threshold · 75</small>
        </section>
        <section className="panel explanation-card">
          <SectionTitle
            eyebrow="Model explanation"
            title="Why this asset is high risk"
          />
          <div className="factor-list">
            {[
              ["Internet-facing management interface", "+18.4"],
              ["Known exploited vulnerability", "+16.9"],
              ["Privileged trust relationship", "+12.6"],
              ["Network segmentation control", "−7.2"],
            ].map(([f, v]) => (
              <div key={f}>
                <span>{f}</span>
                <strong className={v.startsWith("−") ? "healthy" : ""}>
                  {v}
                </strong>
              </div>
            ))}
          </div>
          <div className="model-note">
            <Sparkles size={16} />
            <p>
              These factors explain 71% of this assessment. Model version{" "}
              <strong>CRI-4.8</strong>.
            </p>
          </div>
        </section>
        <section className="panel consequence-card">
          <SectionTitle
            eyebrow="Cross-organisation"
            title="Downstream consequences"
          />
          <div className="consequence-flow">
            <div>
              <Zap size={16} />
              <strong>PG-003</strong>
              <span>Initial access</span>
            </div>
            <ArrowRight />
            <div>
              <Waves size={16} />
              <strong>JB-014</strong>
              <span>Pressure loss</span>
            </div>
            <ArrowRight />
            <div>
              <Hospital size={16} />
              <strong>AI-021</strong>
              <span>Clinical delay</span>
            </div>
          </div>
          <p>
            Estimated time to consequential impact: <strong>4–7 hours</strong>{" "}
            without containment.
          </p>
        </section>
      </div>
    </div>
  )
}

function AgentActivity({ openTrace }: { openTrace: () => void }) {
  const runs = [
    [
      "CS-2841",
      "PG-003 risk reassessment",
      "Cascade Agent",
      "Running",
      "8 min ago",
      "14 paths evaluated",
    ],
    [
      "CS-2839",
      "CVE advisory intake",
      "Intake Agent",
      "Completed",
      "24 min ago",
      "8 assets matched",
    ],
    [
      "CS-2836",
      "Containment plan review",
      "Critic Agent",
      "Failed",
      "1h ago",
      "Constraint data missing",
    ],
    [
      "CS-2828",
      "Weekly portfolio scan",
      "Risk Agent",
      "Completed",
      "Yesterday",
      "75 assets assessed",
    ],
  ]
  return (
    <div className="workspace">
      <div className="workspace-tools">
        <div className="filter-pills">
          <button className="active">All runs</button>
          <button>Running</button>
          <button>Completed</button>
          <button>Failed</button>
        </div>
        <Button variant="secondary">
          <Filter size={15} />
          Filter agents
        </Button>
      </div>
      <div className="trace-grid">
        {runs.map(([id, title, agent, status, time, output]) => (
          <button onClick={openTrace} className="trace-card panel" key={id}>
            <div className={`trace-state ${status.toLowerCase()}`}>
              {status === "Failed" ? (
                <X />
              ) : status === "Completed" ? (
                <Check />
              ) : (
                <Activity />
              )}
            </div>
            <div>
              <span>
                {id} · {time}
              </span>
              <strong>{title}</strong>
              <p>{agent}</p>
            </div>
            <div className="trace-output">
              <span>Latest output</span>
              <strong>{output}</strong>
            </div>
            <Badge tone={status}>{status}</Badge>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  )
}

function RemediationCentre({ openModal }: { openModal: (m: string) => void }) {
  const [selected, setSelected] = useState(0)
  const plans = [
    {
      name: "Targeted isolation",
      risk: 31.4,
      reduction: 60,
      impact: "Low",
      time: "15 min",
      recommended: true,
    },
    {
      name: "Emergency patch",
      risk: 38.2,
      reduction: 52,
      impact: "Medium",
      time: "2–4 hrs",
      recommended: false,
    },
    {
      name: "Full network isolation",
      risk: 18.7,
      reduction: 76,
      impact: "Severe",
      time: "10 min",
      recommended: false,
    },
  ]
  return (
    <div className="workspace">
      <div className="remediation-intro">
        <div>
          <Badge tone="critical">PG-003 · Critical</Badge>
          <h2>Compare containment strategies</h2>
          <p>
            Projected outcomes account for dependency risk, operational
            constraints and existing controls.
          </p>
        </div>
        <Button variant="secondary" onClick={() => openModal("simulate")}>
          <SlidersHorizontal size={15} />
          New simulation
        </Button>
      </div>
      <div className="plan-grid">
        {plans.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setSelected(i)}
            className={`plan-card panel ${selected === i ? "selected" : ""}`}
          >
            {p.recommended && <Badge tone="healthy">AI recommended</Badge>}
            <div className="plan-check">
              {selected === i && <Check size={13} />}
            </div>
            <h3>{p.name}</h3>
            <div className="plan-risk">
              <span>Projected risk</span>
              <strong>{p.risk}</strong>
              <small>−{p.reduction}%</small>
            </div>
            <div className="plan-details">
              <div>
                <span>Operational impact</span>
                <strong>{p.impact}</strong>
              </div>
              <div>
                <span>Time to implement</span>
                <strong>{p.time}</strong>
              </div>
            </div>
          </button>
        ))}
      </div>
      <section className="panel approval-panel">
        <div>
          <SectionTitle eyebrow="Selected plan" title={plans[selected].name} />
          <p>
            Restrict external access at the edge firewall, revoke active
            sessions and preserve the internal managed jump path.
          </p>
        </div>
        <div className="approval-route">
          <span>Approval route</span>
          <div>
            <span className="approver">AL</span>
            <span>Security lead</span>
            <ArrowRight />
            <span className="approver">RO</span>
            <span>Operations owner</span>
          </div>
        </div>
        <div className="action-buttons">
          <Button variant="primary" onClick={() => openModal("approve")}>
            <Check size={15} />
            Submit for approval
          </Button>
          <Button variant="secondary">Save draft</Button>
        </div>
      </section>
    </div>
  )
}

function BlockchainAudit() {
  const records = [
    [
      "0x84A…19F",
      "Dependency attestation",
      "WGEC ↔ MetroWater",
      "Verified",
      "Today · 09:42",
    ],
    [
      "0x17C…8D2",
      "Remediation approval",
      "Plan RP-4492",
      "Verified",
      "Yesterday · 16:18",
    ],
    [
      "0xC21…3AA",
      "Organisation registration",
      "CCMN",
      "Verified",
      "12 Jun · 11:05",
    ],
    [
      "0x991…E40",
      "Asset ownership update",
      "JB-014",
      "Pending",
      "12 Jun · 10:31",
    ],
  ]
  return (
    <div className="workspace">
      <div className="audit-summary">
        <div className="panel">
          <Blocks size={19} />
          <span>Verified records</span>
          <strong>1,248</strong>
          <small>100% integrity</small>
        </div>
        <div className="panel">
          <FileCheck2 size={19} />
          <span>Dependency attestations</span>
          <strong>18</strong>
          <small>Across 3 organisations</small>
        </div>
        <div className="panel">
          <Clock3 size={19} />
          <span>Pending verification</span>
          <strong>01</strong>
          <small>Submitted 34m ago</small>
        </div>
      </div>
      <section className="panel audit-table">
        <SectionTitle
          eyebrow="Immutable activity record"
          title="Audit ledger"
          action={<Button variant="secondary">Verify record</Button>}
        />
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Record type</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r[0]}>
                <td>
                  <code>{r[0]}</code>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>
                  <Badge tone={r[3] === "Verified" ? "healthy" : "medium"}>
                    {r[3]}
                  </Badge>
                </td>
                <td>{r[4]}</td>
                <td>
                  <ExternalLink size={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="workspace settings-grid">
      <aside className="settings-nav panel">
        <button className="active">General</button>
        <button>Organisations</button>
        <button>Risk model</button>
        <button>Notifications</button>
        <button>Access control</button>
        <button>Integrations</button>
      </aside>
      <section className="panel settings-content">
        <SectionTitle
          eyebrow="Workspace preferences"
          title="General settings"
        />
        <div className="setting-row">
          <div>
            <strong>Assessment horizon</strong>
            <p>Time window used by compromise likelihood models.</p>
          </div>
          <Button variant="secondary">
            30 days <ChevronDown size={14} />
          </Button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Human approval threshold</strong>
            <p>Require review before actions above this operational impact.</p>
          </div>
          <Button variant="secondary">
            Medium impact <ChevronDown size={14} />
          </Button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Cross-organisation sharing</strong>
            <p>Share signed dependency evidence with registered partners.</p>
          </div>
          <button className="switch active">
            <span />
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Prototype mode</strong>
            <p>Clearly label actions that are not connected to a backend.</p>
          </div>
          <button className="switch active">
            <span />
          </button>
        </div>
        <Button variant="primary">Save preferences</Button>
      </section>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  body: string
}

function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Search size={24} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}

function DetailDrawer({
  asset,
  onClose,
}: {
  asset: Asset | null
  onClose: () => void
}) {
  if (!asset) return null
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <div>
            <span>Asset detail</span>
            <h2>{asset.id}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <PanelRightClose size={20} />
          </Button>
        </div>
        <div className="drawer-title">
          <div className="entity-icon">
            <Zap size={20} />
          </div>
          <div>
            <strong>{asset.name}</strong>
            <span>
              {asset.org} · {asset.type}
            </span>
          </div>
          <Badge tone={asset.level}>{asset.level}</Badge>
        </div>
        <div className="drawer-score">
          <div>
            <span>Risk score</span>
            <strong style={{ color: riskColors[asset.level] }}>
              {asset.risk.toFixed(2)}
            </strong>
          </div>
          <div>
            <span>Likelihood</span>
            <strong>{asset.likelihood}%</strong>
          </div>
          <div>
            <span>Impact</span>
            <strong>{asset.impact}%</strong>
          </div>
        </div>
        <div className="drawer-section">
          <h3>Asset context</h3>
          <div className="info-list">
            <div>
              <span>Exposure</span>
              <strong>{asset.exposure}</strong>
            </div>
            <div>
              <span>Vulnerability</span>
              <strong>{asset.vulnerability}</strong>
            </div>
            <div>
              <span>Last assessed</span>
              <strong>8 minutes ago</strong>
            </div>
            <div>
              <span>Data confidence</span>
              <strong>High · 94%</strong>
            </div>
          </div>
        </div>
        <div className="drawer-section">
          <h3>Dependency path</h3>
          {asset.cascade === "None identified" ? (
            <p>No downstream dependency path identified for this asset.</p>
          ) : (
            <>
              <div className="drawer-path">
                {[asset.id, ...asset.cascade.split(" → ")].map((step, i) => (
                  <span key={step} className="drawer-path-step">
                    {i > 0 && <ArrowRight />}
                    <span>{step}</span>
                  </span>
                ))}
              </div>
              <p>Potential propagation path across monitored dependencies, ordered by downstream impact.</p>
            </>
          )}
        </div>
        <div className="drawer-section">
          <h3>Recent evidence</h3>
          <div className="evidence">
            <FileCheck2 />
            <div>
              <strong>Vulnerability scan</strong>
              <span>Matched active advisory · 12 min ago</span>
            </div>
          </div>
          <div className="evidence">
            <Network />
            <div>
              <strong>Dependency attestation</strong>
              <span>Verified by WGEC · 2 days ago</span>
            </div>
          </div>
        </div>
        <div className="drawer-actions">
          <Button variant="primary">Open risk intelligence</Button>
          <Button variant="secondary">View asset record</Button>
        </div>
      </aside>
    </>
  )
}

interface ModalProps {
  mode: string | null
  onClose: () => void
}

function Modal({ mode, onClose }: ModalProps) {
  const [done, setDone] = useState(false)
  if (!mode) return null
  const isSim = mode === "simulate"
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal panel">
        <div className="modal-head">
          <div className={`modal-icon ${isSim ? "" : "danger"}`}>
            {isSim ? <SlidersHorizontal /> : <ShieldAlert />}
          </div>
          <div>
            <span>
              {isSim ? "What-if simulation" : "Human approval required"}
            </span>
            <h2>
              {isSim
                ? "Simulate containment alternatives"
                : "Review high-impact action"}
            </h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X size={19} />
          </Button>
        </div>
        {done ? (
          <div className="success-state">
            <Check size={26} />
            <h3>Prototype request recorded</h3>
            <p>
              No backend execution occurred. In production, this request would
              enter the organisation approval queue.
            </p>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="modal-body">
              <div className="prototype-callout">
                <AlertTriangle size={16} />
                <p>
                  <strong>Prototype interaction</strong> — this demo will not
                  change live infrastructure.
                </p>
              </div>
              <div className="modal-action-summary">
                <strong>
                  {isSim
                    ? "Compare controls for PG-003"
                    : "Isolate WG-003 and restrict external access"}
                </strong>
                <p>
                  {isSim
                    ? "Model risk reduction against operational constraints without affecting live systems."
                    : "This action may terminate active remote sessions. Two independent approvals are required."}
                </p>
              </div>
              {!isSim && (
                <label className="approval-check">
                  <input type="checkbox" />
                  <span>
                    I reviewed the operational impact and rollback procedure.
                  </span>
                </label>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDone(true)}>
                {isSim ? "Run prototype simulation" : "Submit approval request"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

interface TraceDrawerProps {
  open: boolean
  onClose: () => void
}

function TraceDrawer({ open, onClose }: TraceDrawerProps) {
  const [tab, setTab] = useState("Output")
  if (!open) return null
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer trace-drawer">
        <div className="drawer-head">
          <div>
            <span>Execution trace</span>
            <h2>CS-2841</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        <div className="trace-title">
          <Badge tone="running">Running</Badge>
          <h3>Cross-organisation cascade assessment</h3>
          <p>Started today at 09:48 · Cascade Agent</p>
        </div>
        <div className="tabs">
          {["Input", "Output", "Events", "Errors"].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
              key={t}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="code-panel">
          <div>
            <span>agent</span>
            <code>cascade-agent@2.4.1</code>
          </div>
          <div>
            <span>assessment_id</span>
            <code>CS-2841</code>
          </div>
          <div>
            <span>paths_evaluated</span>
            <code>14</code>
          </div>
          <div>
            <span>confirmed_paths</span>
            <code>1</code>
          </div>
          <div>
            <span>potential_paths</span>
            <code>2</code>
          </div>
          <div>
            <span>result</span>
            <code>{`{"source":"PG-003","downstream":["JB-014","AI-021"],"confidence":0.86}`}</code>
          </div>
        </div>
        <div className="drawer-section">
          <h3>Agent reasoning summary</h3>
          <p>
            The agent identified an authenticated trust relationship from the
            remote access gateway to grid control, then followed signed
            dependencies to water telemetry and hospital service continuity.
          </p>
        </div>
        <div className="trace-disclaimer">
          <LockKeyhole size={15} />
          Inputs and outputs are retained for audit review.
        </div>
      </aside>
    </>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("Command Centre")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(
    null,
  )
  const [modal, setModal] = useState<string | null>(null)
  const [traceOpen, setTraceOpen] = useState(false)
  const [search, setSearch] = useState("")
  const content = useMemo(() => {
    switch (page) {
      case "Command Centre":
        return (
          <CommandCentre
            openDrawer={setDrawerAsset}
            openModal={setModal}
            openTrace={() => setTraceOpen(true)}
          />
        )
      case "Infrastructure View":
        return <InfrastructurePage openDrawer={setDrawerAsset} />
      case "Asset Inventory":
        return <AssetInventory search={search} openDrawer={setDrawerAsset} />
      case "Risk Intelligence":
        return <RiskIntelligence />
      case "AI Agent Activity":
        return <AgentActivity openTrace={() => setTraceOpen(true)} />
      case "Remediation Centre":
        return <RemediationCentre openModal={setModal} />
      case "Blockchain Audit":
        return <BlockchainAudit />
      case "Settings":
        return <SettingsPage />
      case "Full Screen Map":
        return <FullScreenMapPage />
    }
  }, [page, search])
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="main-shell">
        <Header
          page={page}
          onMenu={() => setSidebarOpen(true)}
          onSearch={setSearch}
        />
        {content}
      </main>
      <DetailDrawer asset={drawerAsset} onClose={() => setDrawerAsset(null)} />
      <Modal mode={modal} onClose={() => setModal(null)} />
      <TraceDrawer open={traceOpen} onClose={() => setTraceOpen(false)} />
    </div>
  )
}
