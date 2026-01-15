import {
  ChartBarIcon,
  UsersIcon,
  MousePointerRayIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// --- Mock Data ---

const VISITOR_TREND = [
  { date: '2026-01-01', visitors: 1200, leads: 45 },
  { date: '2026-01-02', visitors: 1350, leads: 52 },
  { date: '2026-01-03', visitors: 1100, leads: 38 },
  { date: '2026-01-04', visitors: 1540, leads: 61 },
  { date: '2026-01-05', visitors: 1890, leads: 82 },
  { date: '2026-01-06', visitors: 1720, leads: 74 },
  { date: '2026-01-07', visitors: 2100, leads: 95 },
];

const TOP_PAGES = [
  { name: '/home', views: 8500, rate: 12 },
  { name: '/pricing', views: 6200, rate: 8 },
  { name: '/assessment/hcm', views: 4800, rate: 22 },
  { name: '/blog/hr-trends-2026', views: 3100, rate: 5 },
  { name: '/contact', views: 2400, rate: 18 },
];

const TRAFFIC_SOURCES = [
  { name: 'Direct', value: 35, color: '#6366F1' },
  { name: 'Organic Search', value: 40, color: '#10B981' },
  { name: 'Social', value: 15, color: '#F59E0B' },
  { name: 'Referral', value: 10, color: '#EC4899' },
];

const CTA_PERFORMANCE = [
  { region: 'Hero', clicks: 1200, conversion: 15 },
  { region: 'Pricing Card', clicks: 850, conversion: 28 },
  { region: 'Footer', clicks: 200, conversion: 3 },
  { region: 'Exit Intent', clicks: 450, conversion: 12 },
];

// --- Loader ---
export const loader = async () => {
  return json({
    realTimeUsers: 142,
    stats: {
      totalVisitors: "45,281",
      avgSession: "4m 32s",
      bounceRate: "32.4%",
      conversions: "1,240"
    }
  });
};

// --- Components ---

interface StatCardProps {
  label: string;
  value: string | number;
  trend: { value: string; positive: boolean };
  icon: React.ElementType;
  color: string;
}

function AnalyticStatCard({ label, value, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-2xl bg-${color}-50 text-${color}-600`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.positive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
          {trend.value}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function WebsiteAnalyticsPage() {
  const { realTimeUsers, stats } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Website Intelligence</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now: {realTimeUsers} Users
            </div>
            <p className="text-gray-400 font-medium text-sm border-l border-gray-200 pl-3 ml-1">Real-time performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold text-gray-600 shadow-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            Last 7 Days
          </div>
          <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticStatCard
          label="Active Visitors"
          value={stats.totalVisitors}
          trend={{ value: "+14.2%", positive: true }}
          icon={UsersIcon}
          color="indigo"
        />
        <AnalyticStatCard
          label="Avg. Session"
          value={stats.avgSession}
          trend={{ value: "+23s", positive: true }}
          icon={ClockIcon}
          color="emerald"
        />
        <AnalyticStatCard
          label="Bounce Rate"
          value={stats.bounceRate}
          trend={{ value: "-2.1%", positive: true }}
          icon={GlobeAltIcon}
          color="amber"
        />
        <AnalyticStatCard
          label="Total Converts"
          value={stats.conversions}
          trend={{ value: "+5.4%", positive: true }}
          icon={ArrowTrendingUpIcon}
          color="rose"
        />
      </div>

      {/* Main Traffic Graph */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Traffic Acquisition</h2>
            <p className="text-sm font-medium text-gray-400">Comparing visitor count and lead generation velocity</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Visitors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Leads</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={VISITOR_TREND}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                dy={15}
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
              <Tooltip
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#6366F1" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={4} />
              <Area type="monotone" dataKey="leads" stroke="#10B981" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Content Engagement */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Content ROI</h2>
              <p className="text-sm font-medium text-gray-400">Top performing pages by traffic vs conversion</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <div className="p-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PAGES} layout="vertical" barGap={24}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 700 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="views" fill="#D1D5DB" radius={[0, 8, 8, 0]} barSize={20} />
                <Bar dataKey="rate" fill="#6366F1" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-8 pb-8 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Conversion %</span>
            </div>
          </div>
        </div>

        {/* Traffic Source Breakdown */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acquisition</h2>
          <p className="text-sm font-medium text-gray-400 mb-8">Visitor sources distribution</p>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TRAFFIC_SOURCES}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {TRAFFIC_SOURCES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-auto pt-6 border-t border-gray-50">
            {TRAFFIC_SOURCES.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Analysis Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Conversion Funnel Analytics (CTA)</h2>
            <p className="text-sm font-medium text-gray-400 mt-1">Measuring the efficacy of high-intent interface triggers</p>
          </div>
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FunnelIcon className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
        <div className="p-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={CTA_PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="region"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="clicks" fill="#E5E7EB" radius={[10, 10, 0, 0]} barSize={40} name="Interaction Volume" />
              <Line type="monotone" dataKey="conversion" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} name="Conversion Rate %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}