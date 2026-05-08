import { useEffect, useRef } from 'react'
import { DollarSign, Users, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react'
import { type KPICard } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ElementType> = {
  dollar: DollarSign,
  users: Users,
  'shopping-bag': ShoppingBag,
  'trending-up': TrendingUp,
}

interface SparklineProps {
  data: number[]
  color: string
  special?: boolean
}

function Sparkline({ data, color, special }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = 44
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const mn = Math.min(...data)
    const mx = Math.max(...data)
    const range = mx - mn || 1
    const pad = 4

    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * W,
      H - pad - ((v - mn) / range) * (H - pad * 2),
    ])

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, color + '45')
    grad.addColorStop(1, color + '00')
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length - 1; i++) {
      const mx2 = (pts[i][0] + pts[i + 1][0]) / 2
      const my = (pts[i][1] + pts[i + 1][1]) / 2
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx2, my)
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Stroke line
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length - 1; i++) {
      const mx2 = (pts[i][0] + pts[i + 1][0]) / 2
      const my = (pts[i][1] + pts[i + 1][1]) / 2
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx2, my)
    }
    ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1])
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // End dot
    const last = pts[pts.length - 1]
    ctx.beginPath()
    ctx.arc(last[0], last[1], 3, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }, [data, color])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 44, display: 'block' }}
    />
  )
}

interface KPICardsProps {
  data: KPICard[]
  loading?: boolean
}

function KPICardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-16 h-5 rounded-full" />
      </div>
      <div className="skeleton w-28 h-7 rounded-lg mb-1.5" />
      <div className="skeleton w-20 h-3.5 rounded mb-3" />
      <div className="skeleton w-full h-11 rounded-lg" />
    </div>
  )
}

export function KPICards({ data, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 stagger-children">
      {data.map((kpi, idx) => {
        const Icon = ICONS[kpi.icon] || TrendingUp
        const isUp = kpi.change >= 0
        const sparkColor = kpi.special ? '#ffffff' : 'var(--accent)'
        const resolvedColor = kpi.special ? '#ffffff' : '#6c63ff'

        return (
          <div
            key={kpi.id}
            className={cn(
              'card p-5 animate-fade-in overflow-hidden relative group',
              kpi.special && 'border-transparent'
            )}
            style={
              kpi.special
                ? { background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 65%, var(--accent2)) 100%)' }
                : undefined
            }
          >
            {/* Top glow for special */}
            {kpi.special && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.3), transparent 60%)' }}
              />
            )}

            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: kpi.special ? 'rgba(255,255,255,0.2)' : 'var(--accent-soft)' }}
              >
                <Icon
                  size={18}
                  style={{ color: kpi.special ? 'rgba(255,255,255,0.9)' : 'var(--accent)' }}
                />
              </div>

              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                  kpi.special
                    ? 'bg-white/20 text-white'
                    : isUp
                    ? 'bg-[rgba(0,212,170,0.12)] text-[var(--success)]'
                    : 'bg-[rgba(255,95,109,0.12)] text-[var(--danger)]'
                )}
              >
                {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(kpi.change)}%
              </span>
            </div>

            <div
              className="text-[26px] font-bold tracking-tight mb-1 font-mono"
              style={{ color: kpi.special ? '#fff' : 'var(--text-primary)' }}
            >
              {kpi.value}
            </div>
            <div
              className="text-[12px] mb-3"
              style={{ color: kpi.special ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}
            >
              {kpi.label}
            </div>

            <Sparkline data={kpi.trend} color={resolvedColor} special={kpi.special} />
          </div>
        )
      })}
    </div>
  )
}
