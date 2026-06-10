import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

import { useAuth } from '@/utils/contexts/AuthContext';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Package,
  Eye,
  CheckCircle,
  RefreshCw,
  Tag,
  Flag,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import { getAdminAnalytics } from '@/app/api/services/admin.service';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_LABELS = {
  likely_authentic: 'Authentic',
  suspicious: 'Suspicious',
  review_required: 'Review Required',
  unverified: 'Unverified',
};

const sourceLabel = (source) => {
  if (!source) return 'Scan';
  const normalized = String(source).toLowerCase();
  if (normalized === 'qr') return 'QR Scan';
  if (normalized === 'barcode') return 'Barcode Scan';
  if (normalized === 'upload') return 'Image Upload';
  if (normalized === 'analyze') return 'AI Analysis';
  return 'Scan';
};

const relativeTime = (dateValue) => {
  if (!dateValue) return 'Unknown time';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
};

const toPercentage = (value, total) => {
  if (!total) return '0.0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

const formatChartDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return {
    key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    label: DAY_LABELS[date.getDay()],
  };
};

const getEmptyWeeklyData = () => {
  const result = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);

    result.push({
      key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
      date: DAY_LABELS[day.getDay()],
      authentic: 0,
      fake: 0,
    });
  }

  return result;
};

const getEmptyDetectionData = () => {
  const buckets = [];
  for (let i = 0; i < 6; i += 1) {
    const startHour = i * 4;
    buckets.push({
      hour: `${String(startHour).padStart(2, '0')}:00`,
      detections: 0,
    });
  }
  return buckets;
};

export function AdminDashboard({ onBack }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const userName = user?.fullName || user?.name || user?.username || user?.email || 'Admin';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'A';
  const userRole = String(user?.role || 'Admin').toLowerCase();
  const userEmail = user?.email || '';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const response = await getAdminAnalytics();

    if (response.error) {
      setErrorMessage(response.message || 'Unable to load dashboard analytics.');
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    setAnalytics(response.data || null);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const transformed = useMemo(() => {
    const scanBreakdownArray = Array.isArray(analytics?.scanBreakdown)
      ? analytics.scanBreakdown
      : [];
    const reportBreakdownArray = Array.isArray(analytics?.reportBreakdown)
      ? analytics.reportBreakdown
      : [];
    const recentScansArray = Array.isArray(analytics?.recentScans)
      ? analytics.recentScans
      : [];

    const scanBreakdown = scanBreakdownArray.reduce((acc, item) => {
      const key = item?._id || 'unverified';
      acc[key] = Number(item?.count || 0);
      return acc;
    }, {});

    const totalScans = Object.values(scanBreakdown).reduce(
      (sum, count) => sum + Number(count || 0),
      0
    );
    const authenticCount = Number(scanBreakdown.likely_authentic || 0);
    const suspiciousCount = Number(scanBreakdown.suspicious || 0);
    const reviewRequiredCount = Number(scanBreakdown.review_required || 0);
    const counterfeitCount = suspiciousCount + reviewRequiredCount;

    const stats = [
      {
        icon: Activity,
        label: 'Total Scans',
        value: totalScans.toLocaleString(),
        change: `${scanBreakdownArray.length} status types`,
        trend: 'neutral',
        color: 'bg-cyan-500',
      },
      {
        icon: CheckCircle,
        label: 'Authentic Products',
        value: authenticCount.toLocaleString(),
        change: toPercentage(authenticCount, totalScans),
        trend: 'neutral',
        color: 'bg-emerald-500',
      },
      {
        icon: AlertTriangle,
        label: 'Suspicious Products',
        value: suspiciousCount.toLocaleString(),
        change: toPercentage(suspiciousCount, totalScans),
        trend: suspiciousCount > 0 ? 'up' : 'neutral',
        color: 'bg-orange-500 ',
      },
      {
        icon: Users,
        label: 'Active Users',
        value: Number(analytics?.users || 0).toLocaleString(),
        change: 'Registered users',
        trend: 'neutral',
        color: 'bg-blue-500',
      },
    ];

    const reportPalette = {
      open: '#f59e0b',
      reviewed: '#06b6d4',
      resolved: '#10b981',
      rejected: '#ef4444',
    };
    const categoryData = reportBreakdownArray.map((item) => ({
      name: STATUS_LABELS[item?._id] || String(item?._id || 'Unknown').replace(/_/g, ' '),
      value: Number(item?.count || 0),
      color: reportPalette[item?._id] || '#64748b',
    }));

    const weeklyData = getEmptyWeeklyData();
    const weeklyByKey = weeklyData.reduce((acc, day) => {
      acc[day.key] = day;
      return acc;
    }, {});

    recentScansArray.forEach((scan) => {
      const chartDate = formatChartDate(scan?.createdAt);
      if (!chartDate || !weeklyByKey[chartDate.key]) {
        return;
      }

      const status = scan?.verificationStatus;
      if (status === 'likely_authentic') {
        weeklyByKey[chartDate.key].authentic += 1;
      } else if (status === 'suspicious' || status === 'review_required') {
        weeklyByKey[chartDate.key].fake += 1;
      }
    });

    const scanTrendData = weeklyData.map((item) => ({
      date: item.date,
      authentic: item.authentic,
      fake: item.fake,
    }));

    const detectionData = getEmptyDetectionData();
    recentScansArray.forEach((scan) => {
      const createdAt = new Date(scan?.createdAt || '');
      if (Number.isNaN(createdAt.getTime())) {
        return;
      }

      const status = scan?.verificationStatus;
      if (status !== 'suspicious' && status !== 'review_required') {
        return;
      }

      const bucket = Math.min(5, Math.floor(createdAt.getHours() / 4));
      detectionData[bucket].detections += 1;
    });

    const recentItems = recentScansArray.map((scan) => {
      const status = scan?.verificationStatus || 'unverified';
      const confidence = Number(scan?.aiAnalysis?.confidence || 0);

      const rawDate = scan?.createdAt ? new Date(scan.createdAt) : null;
      const scanDate = rawDate && !Number.isNaN(rawDate.getTime())
        ? rawDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown date';

      return {
        id: scan?._id || '',
        productName: scan?.productName || 'Unknown Product',
        brandName: scan?.brandName || '—',
        imageUrl: scan?.uploadedImage?.url || null,
        status,
        confidence: Math.round(confidence),
        confidencePercentage: `${Math.round(confidence)}%`,
        scanDate,
      };
    });

    const mostScannedBrands = Array.isArray(analytics?.mostScannedBrands)
      ? analytics.mostScannedBrands
      : [];
    const mostScannedCategories = Array.isArray(analytics?.mostScannedCategories)
      ? analytics.mostScannedCategories
      : [];
    const mostReportedSuspicious = Array.isArray(analytics?.mostReportedSuspicious)
      ? analytics.mostReportedSuspicious
      : [];

    return {
      stats,
      categoryData,
      scanTrendData,
      detectionData,
      recentItems,
      mostScannedBrands,
      mostScannedCategories,
      mostReportedSuspicious,
    };
  }, [analytics]);

  const stats = transformed?.stats || [];
  const categoryData = transformed?.categoryData || [];
  const scanTrendData = transformed?.scanTrendData || [];
  const detectionData = transformed?.detectionData || [];
  const recentItems = transformed?.recentItems || [];
  const mostScannedBrands = transformed?.mostScannedBrands || [];
  const mostScannedCategories = transformed?.mostScannedCategories || [];
  const mostReportedSuspicious = transformed?.mostReportedSuspicious || [];

  return (
    <section className="min-h-screen pt-11 px-6 pb-20">
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

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => {
                void loadAnalytics();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Live</span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="h-11 w-11 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white font-semibold flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:scale-105 transition"
                aria-label="Open profile menu"
                title={userName}
              >
                {userInitial}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-white/10 bg-[#0b1229]/95 p-3 shadow-2xl backdrop-blur-xl z-50">
                  <div className="space-y-1 border-b border-white/10 pb-3 mb-3">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{userRole}</p>
                    {userEmail && <p className="text-[11px] text-white/50 truncate">{userEmail}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mb-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70">
            Loading dashboard data...
          </div>
        )}

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
                  Report status distribution
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

        {/* Analytics — Brands / Categories / Reported */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Most Scanned Brands */}
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Most Scanned Brands</h3>
                <p className="text-xs text-white/50">Top 5 brands</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostScannedBrands.length === 0 && (
                <p className="text-sm text-white/40">No data yet.</p>
              )}
              {mostScannedBrands.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-white/40 w-4 shrink-0">{i + 1}.</span>
                    <span className="text-sm truncate">{b._id || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-400 shrink-0 ml-2">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Scanned Categories */}
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">Most Scanned Categories</h3>
                <p className="text-xs text-white/50">Top 5 categories</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostScannedCategories.length === 0 && (
                <p className="text-sm text-white/40">No data yet.</p>
              )}
              {mostScannedCategories.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-white/40 w-4 shrink-0">{i + 1}.</span>
                    <span className="text-sm truncate capitalize">{c._id || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-semibold text-cyan-400 shrink-0 ml-2">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Reported Suspicious */}
          <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold">Most Reported Suspicious</h3>
                <p className="text-xs text-white/50">Top 5 reported products</p>
              </div>
            </div>
            <div className="space-y-3">
              {mostReportedSuspicious.length === 0 && (
                <p className="text-sm text-white/40">No data yet.</p>
              )}
              {mostReportedSuspicious.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-white/40 w-4 shrink-0">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{r._id || 'Unknown'}</p>
                      {r.brandName && (
                        <p className="text-xs text-white/40 truncate">{r.brandName}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-400 shrink-0">{r.count}</span>
                </div>
              ))}
            </div>
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
            {recentItems.length > 0 && (
              <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.8fr_0.7fr_0.8fr] gap-4 px-4 text-[11px] uppercase tracking-wide text-white/45">
                <span>Product</span>
                <span>Brand</span>
                <span>Authenticity Status</span>
                <span className="text-right">Confidence</span>
                <span className="text-right">Scan Date</span>
              </div>
            )}

            {recentItems.map((item, index) => {
              const isAuthentic = item.status === 'likely_authentic';
              const isSuspicious = item.status === 'suspicious' || item.status === 'review_required';
              const statusColor = isAuthentic
                ? 'bg-green-500/20 text-green-400'
                : isSuspicious
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-white/10 text-white/50';
              const scoreColor = isAuthentic
                ? 'text-green-400'
                : isSuspicious
                ? 'text-orange-400'
                : 'text-white/50';
              const statusLabel = item.status === 'likely_authentic'
                ? 'Authentic'
                : String(item.status || 'Unverified').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

              const row = (
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr_0.7fr_0.8fr_auto] gap-4 items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/8 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/10 shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-5 h-5 text-white/30" />
                      )}
                    </div>
                    <p className="font-medium truncate">{item.productName}</p>
                  </div>

                  <p className="text-sm text-white/80 truncate">{item.brandName}</p>

                  <div className={`justify-self-start md:justify-self-start px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${statusColor}`}>
                    {statusLabel}
                  </div>

                  <p className={`text-sm md:text-right font-semibold ${scoreColor}`}>{item.confidencePercentage}</p>

                  <p className="text-xs md:text-right text-white/50">{item.scanDate}</p>

                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 justify-self-end" />
                </div>
              );

              return item.id ? (
                <Link key={item.id} href={`/history/${item.id}`}>
                  {row}
                </Link>
              ) : (
                <div key={`no-id-${index}`}>{row}</div>
              );
            })}

            {!recentItems.length && !isLoading && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/60">
                No recent scans available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}