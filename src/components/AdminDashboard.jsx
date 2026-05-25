import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import {
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Package,
  Eye,
  CheckCircle,
} from 'lucide-react';

export function AdminDashboard({ onBack }) {
  // Mock Data
  const scanTrendData = [
    { date: 'Mon', scans: 1240, authentic: 1180, fake: 60 },
    { date: 'Tue', scans: 1450, authentic: 1385, fake: 65 },
    { date: 'Wed', scans: 1680, authentic: 1595, fake: 85 },
    { date: 'Thu', scans: 1520, authentic: 1450, fake: 70 },
    { date: 'Fri', scans: 1890, authentic: 1795, fake: 95 },
    { date: 'Sat', scans: 2100, authentic: 1995, fake: 105 },
    { date: 'Sun', scans: 1750, authentic: 1665, fake: 85 },
  ];

  const categoryData = [
    { name: 'Cosmetics', value: 2850, color: '#ec4899' },
    { name: 'Electronics', value: 2340, color: '#06b6d4' },
    { name: 'Fashion', value: 1920, color: '#8b5cf6' },
    { name: 'Medicines', value: 1560, color: '#3b82f6' },
    { name: 'Food', value: 1200, color: '#10b981' },
    { name: 'Others', value: 930, color: '#f59e0b' },
  ];

  const detectionData = [
    { hour: '00:00', detections: 12 },
    { hour: '04:00', detections: 8 },
    { hour: '08:00', detections: 28 },
    { hour: '12:00', detections: 45 },
    { hour: '16:00', detections: 38 },
    { hour: '20:00', detections: 22 },
  ];

  const stats = [
    {
      icon: Activity,
      label: 'Total Scans',
      value: '10,845',
      change: '+12.5%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CheckCircle,
      label: 'Authentic Products',
      value: '10,165',
      change: '93.7%',
      trend: 'neutral',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: AlertTriangle,
      label: 'Counterfeit Detected',
      value: '680',
      change: '+8.2%',
      trend: 'up',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      label: 'Active Users',
      value: '4,293',
      change: '+18.3%',
      trend: 'up',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <section className="min-h-screen pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
            >
              ← Back
            </button>

            <h1 className="text-5xl font-bold mb-2">
              Admin{' '}
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>

            <p className="text-white/60">
              Real-time analytics and monitoring
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Live</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-linear-to-r ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>

                <div className="text-3xl font-bold mb-1">
                  {stat.value}
                </div>

                <div className="text-sm text-white/60">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Trends */}
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Weekly Scan Trends
                </h3>

                <p className="text-sm text-white/60">
                  Last 7 days
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scanTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />

                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                />

                <YAxis stroke="rgba(255,255,255,0.5)" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />

                <Legend />

                <Bar
                  dataKey="authentic"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="fake"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Product Categories
                </h3>

                <p className="text-sm text-white/60">
                  Scan distribution
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detection Timeline */}
        <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                Counterfeit Detection Timeline
              </h3>

              <p className="text-sm text-white/60">
                Last 24 hours
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={detectionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />

              <XAxis
                dataKey="hour"
                stroke="rgba(255,255,255,0.5)"
              />

              <YAxis stroke="rgba(255,255,255,0.5)" />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />

              <Line
                type="monotone"
                dataKey="detections"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>

            <div>
              <h3 className="font-semibold">
                Recent Scans
              </h3>

              <p className="text-sm text-white/60">
                Latest verification activity
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                product: 'Louis Vuitton Handbag',
                status: 'authentic',
                time: '2 minutes ago',
                score: 97,
              },
              {
                product: 'iPhone 15 Pro Max',
                status: 'authentic',
                time: '5 minutes ago',
                score: 99,
              },
              {
                product: 'Chanel No. 5 Perfume',
                status: 'suspicious',
                time: '8 minutes ago',
                score: 68,
              },
              {
                product: 'Nike Air Jordan 1',
                status: 'fake',
                time: '12 minutes ago',
                score: 34,
              },
              {
                product: 'Rolex Submariner',
                status: 'authentic',
                time: '15 minutes ago',
                score: 96,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'authentic'
                        ? 'bg-green-400'
                        : item.status === 'suspicious'
                        ? 'bg-orange-400'
                        : 'bg-red-400'
                    }`}
                  />

                  <div>
                    <div className="font-medium">
                      {item.product}
                    </div>

                    <div className="text-sm text-white/60">
                      {item.time}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-white/60">
                      Score:{' '}
                    </span>

                    <span
                      className={`font-semibold ${
                        item.status === 'authentic'
                          ? 'text-green-400'
                          : item.status === 'suspicious'
                          ? 'text-orange-400'
                          : 'text-red-400'
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      item.status === 'authentic'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'suspicious'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}