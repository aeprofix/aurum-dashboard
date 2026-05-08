// ─── Mock Data System ───────────────────────────────────────────────────────

export interface KPICard {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  trend: number[]
  icon: string
  special?: boolean
}

export interface Order {
  id: string
  customer: string
  product: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled' | 'processing'
  date: string
  avatar: string
}

export interface Product {
  id: string
  name: string
  category: string
  revenue: number
  change: number
  emoji: string
  sales: number
}

export interface ActivityItem {
  id: string
  emoji: string
  text: string
  highlight: string
  time: string
  type: 'order' | 'user' | 'system' | 'payment' | 'alert'
}

export interface Notification {
  id: string
  emoji: string
  message: string
  boldPart: string
  time: string
  unread: boolean
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  target: number
  profit: number
  orders: number
}

export interface TrafficSource {
  name: string
  value: number
  color: string
}

// ─── KPI Data ──────────────────────────────────────────────────────────────
export const kpiData: KPICard[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$284,592',
    change: 18.2,
    changeLabel: 'vs last month',
    trend: [28000,32000,29000,35000,31000,38000,41000,36000,45000,48000,44000,52000],
    icon: 'dollar',
    special: true,
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '48,320',
    change: 9.1,
    changeLabel: 'vs last month',
    trend: [30000,32000,28000,35000,38000,34000,40000,42000,39000,44000,46000,48320],
    icon: 'users',
  },
  {
    id: 'orders',
    label: 'Total Orders',
    value: '12,847',
    change: 4.6,
    changeLabel: 'vs last month',
    trend: [8000,9500,8800,10200,9500,11000,10500,11200,10800,11800,12200,12847],
    icon: 'shopping-bag',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: '3.84%',
    change: -2.1,
    changeLabel: 'vs last month',
    trend: [4.2,3.9,4.1,3.8,4.0,3.9,4.1,3.7,3.9,3.8,3.84,3.84],
    icon: 'trending-up',
  },
]

// ─── Revenue Chart ─────────────────────────────────────────────────────────
export const revenueData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 32000, target: 35000, profit: 12000, orders: 820 },
  { month: 'Feb', revenue: 28000, target: 35000, profit: 9000,  orders: 750 },
  { month: 'Mar', revenue: 41000, target: 40000, profit: 16000, orders: 920 },
  { month: 'Apr', revenue: 35000, target: 42000, profit: 14000, orders: 880 },
  { month: 'May', revenue: 48000, target: 45000, profit: 19000, orders: 1050 },
  { month: 'Jun', revenue: 52000, target: 50000, profit: 22000, orders: 1120 },
  { month: 'Jul', revenue: 44000, target: 47000, profit: 18000, orders: 980 },
  { month: 'Aug', revenue: 58000, target: 55000, profit: 25000, orders: 1300 },
  { month: 'Sep', revenue: 51000, target: 53000, profit: 21000, orders: 1100 },
  { month: 'Oct', revenue: 63000, target: 60000, profit: 27000, orders: 1400 },
  { month: 'Nov', revenue: 55000, target: 58000, profit: 24000, orders: 1250 },
  { month: 'Dec', revenue: 72000, target: 68000, profit: 31000, orders: 1600 },
]

// ─── Traffic Sources ────────────────────────────────────────────────────────
export const trafficSources: TrafficSource[] = [
  { name: 'Organic',  value: 38, color: '#6c63ff' },
  { name: 'Direct',   value: 24, color: '#00d4aa' },
  { name: 'Social',   value: 22, color: '#ffd166' },
  { name: 'Paid Ads', value: 16, color: '#ff5f6d' },
]

// ─── Orders ────────────────────────────────────────────────────────────────
export const ordersData: Order[] = [
  { id: '#ORD-8821', customer: 'Alice Johnson',  product: 'Enterprise Suite', amount: 999,  status: 'completed',  date: '2025-05-06', avatar: 'AJ' },
  { id: '#ORD-8820', customer: 'Marcus Lee',     product: 'Starter Pack',     amount: 49,   status: 'pending',    date: '2025-05-06', avatar: 'ML' },
  { id: '#ORD-8819', customer: 'Sarah Chen',     product: 'Pro Plan',         amount: 299,  status: 'completed',  date: '2025-05-05', avatar: 'SC' },
  { id: '#ORD-8818', customer: 'Tom Williams',   product: 'Pro Plan',         amount: 299,  status: 'cancelled',  date: '2025-05-05', avatar: 'TW' },
  { id: '#ORD-8817', customer: 'Emma Davis',     product: 'Add-on Bundle',    amount: 79,   status: 'completed',  date: '2025-05-04', avatar: 'ED' },
  { id: '#ORD-8816', customer: 'Raj Patel',      product: 'Starter Pack',     amount: 49,   status: 'processing', date: '2025-05-04', avatar: 'RP' },
  { id: '#ORD-8815', customer: 'Luna Park',      product: 'Enterprise Suite', amount: 999,  status: 'completed',  date: '2025-05-03', avatar: 'LP' },
  { id: '#ORD-8814', customer: 'Diego Reyes',    product: 'Support Premium',  amount: 199,  status: 'pending',    date: '2025-05-03', avatar: 'DR' },
]

// ─── Top Products ───────────────────────────────────────────────────────────
export const topProducts: Product[] = [
  { id: 'p1', name: 'Pro Plan',         category: 'Subscription', revenue: 84320, change: 12.4,  emoji: '💎', sales: 282 },
  { id: 'p2', name: 'Enterprise Suite', category: 'License',      revenue: 61100, change: 8.7,   emoji: '🏢', sales: 61  },
  { id: 'p3', name: 'Starter Pack',     category: 'Subscription', revenue: 29450, change: 5.2,   emoji: '🚀', sales: 601 },
  { id: 'p4', name: 'Add-on Bundle',    category: 'One-time',     revenue: 18920, change: -1.3,  emoji: '📦', sales: 239 },
  { id: 'p5', name: 'Support Premium',  category: 'Service',      revenue: 12780, change: 3.1,   emoji: '⚡', sales: 64  },
]

// ─── Activity Feed ──────────────────────────────────────────────────────────
export const activityFeed: ActivityItem[] = [
  { id: 'a1', emoji: '💳', text: '{name} upgraded to Enterprise plan',      highlight: 'Alice Johnson',   time: '2 min ago',  type: 'payment' },
  { id: 'a2', emoji: '📦', text: 'New order {name} received',               highlight: '#ORD-8821',       time: '14 min ago', type: 'order' },
  { id: 'a3', emoji: '👤', text: 'New user {name} registered',              highlight: 'Sarah Chen',      time: '31 min ago', type: 'user' },
  { id: 'a4', emoji: '⚠️', text: 'Server {name} response spike detected',   highlight: 'us-east-1',      time: '1 hr ago',   type: 'alert' },
  { id: 'a5', emoji: '✅', text: 'Monthly backup {name} successfully',       highlight: 'completed',       time: '3 hr ago',   type: 'system' },
  { id: 'a6', emoji: '🔄', text: 'Deployment to {name} succeeded',          highlight: 'production',      time: '5 hr ago',   type: 'system' },
]

// ─── Notifications ──────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', emoji: '💰', message: 'Revenue milestone: {bold} reached!',    boldPart: '$280K',         time: 'Just now',   unread: true },
  { id: 'n2', emoji: '👤', message: '{bold} submitted a refund request',      boldPart: 'Emma Davis',    time: '5 min ago',  unread: true },
  { id: 'n3', emoji: '🔔', message: 'Scheduled maintenance in {bold}',        boldPart: '2 hours',       time: '1 hr ago',   unread: true },
  { id: 'n4', emoji: '📈', message: 'Weekly report ready to {bold}',          boldPart: 'download',      time: '3 hr ago',   unread: false },
  { id: 'n5', emoji: '🛡️', message: 'Security scan {bold}',                   boldPart: 'completed',     time: '6 hr ago',   unread: false },
]
