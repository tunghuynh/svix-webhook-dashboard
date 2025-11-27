import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useEndpoints } from '../hooks/useEndpoints'
import { useMessages, useAttemptsByEndpoint, useAllAttempts } from '../hooks/useMessages'
import { formatDateTime } from '../utils/helpers'

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { selectedApp } = useAppStore()
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [timeRange, setTimeRange] = useState('7d') // 24h, 7d, 30d

  const { data: endpointsData } = useEndpoints(selectedApp?.id, { limit: 100 })
  const endpoints = endpointsData?.data || []

  const { data: messagesData } = useMessages(selectedApp?.id, { limit: 100 })
  const messages = messagesData?.data || []

  // Get attempts for selected endpoint or all endpoints
  const { data: endpointAttemptsData } = useAttemptsByEndpoint(
    selectedApp?.id,
    selectedEndpoint?.id,
    { limit: 200 }
  )

  // Get all attempts when no endpoint is selected
  const { data: allAttemptsData } = useAllAttempts(
    selectedEndpoint ? null : selectedApp?.id,
    { limit: 200 }
  )

  // Use the appropriate data source
  const attempts = selectedEndpoint
    ? (endpointAttemptsData?.data || [])
    : (allAttemptsData?.data || [])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMessages = messages.length
    const totalAttempts = attempts.length
    const successAttempts = attempts.filter((a) => a.status === 0 || a.status === 3).length
    const failedAttempts = attempts.filter((a) => a.status === 2).length
    const pendingAttempts = attempts.filter((a) => a.status === 1).length

    const avgResponseTime =
      attempts.length > 0
        ? Math.round(
            attempts
              .filter((a) => a.responseDurationMs !== undefined)
              .reduce((sum, a) => sum + a.responseDurationMs, 0) /
              attempts.filter((a) => a.responseDurationMs !== undefined).length
          )
        : 0

    const successRate = totalAttempts > 0 ? ((successAttempts / totalAttempts) * 100).toFixed(1) : 0

    return {
      totalMessages,
      totalAttempts,
      successAttempts,
      failedAttempts,
      pendingAttempts,
      avgResponseTime,
      successRate,
    }
  }, [messages, attempts])

  // Prepare timeline data (last 7 days)
  const timelineData = useMemo(() => {
    const now = new Date()
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayMessages = messages.filter((m) => {
        const msgDate = new Date(m.timestamp)
        return msgDate >= date && msgDate < nextDate
      })

      const dayAttempts = attempts.filter((a) => {
        const attDate = new Date(a.timestamp)
        return attDate >= date && attDate < nextDate
      })

      const success = dayAttempts.filter((a) => a.status === 0 || a.status === 3).length
      const failed = dayAttempts.filter((a) => a.status === 2).length

      // Calculate average response time for the day
      const responseTimes = dayAttempts
        .filter(a => a.responseDurationMs !== undefined && a.responseDurationMs !== null)
        .map(a => a.responseDurationMs)
      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: dayMessages.length,
        attempts: dayAttempts.length,
        success,
        failed,
        avgResponseTime,
      })
    }

    return data
  }, [messages, attempts, timeRange])

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Success', value: stats.successAttempts, color: '#10b981' },
    { name: 'Failed', value: stats.failedAttempts, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingAttempts, color: '#f59e0b' },
  ].filter((item) => item.value > 0)

  // Response time by endpoint
  const responseTimeByEndpoint = useMemo(() => {
    const endpointMap = new Map()

    attempts.forEach((attempt) => {
      if (attempt.responseDurationMs !== undefined && attempt.endpointId) {
        if (!endpointMap.has(attempt.endpointId)) {
          endpointMap.set(attempt.endpointId, {
            endpointId: attempt.endpointId,
            times: [],
          })
        }
        endpointMap.get(attempt.endpointId).times.push(attempt.responseDurationMs)
      }
    })

    return Array.from(endpointMap.values())
      .map((item) => {
        const endpoint = endpoints.find((ep) => ep.id === item.endpointId)
        return {
          name: endpoint?.description || item.endpointId.substring(0, 8),
          avgTime: Math.round(item.times.reduce((a, b) => a + b, 0) / item.times.length),
        }
      })
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5)
  }, [attempts, endpoints])

  // Messages & Attempts by Endpoint
  const messagesByEndpoint = useMemo(() => {
    const endpointMap = new Map()

    // Count messages by endpoint
    messages.forEach((message) => {
      // Get attempts for this message to determine which endpoints received it
      const messageAttempts = attempts.filter(a => a.msgId === message.id)
      messageAttempts.forEach(attempt => {
        if (attempt.endpointId) {
          if (!endpointMap.has(attempt.endpointId)) {
            endpointMap.set(attempt.endpointId, {
              endpointId: attempt.endpointId,
              messages: new Set(),
              attempts: 0,
            })
          }
          const data = endpointMap.get(attempt.endpointId)
          data.messages.add(message.id)
          data.attempts++
        }
      })
    })

    return Array.from(endpointMap.values())
      .map((item) => {
        const endpoint = endpoints.find((ep) => ep.id === item.endpointId)
        return {
          name: endpoint?.description || item.endpointId.substring(0, 8),
          messages: item.messages.size,
          attempts: item.attempts,
        }
      })
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5)
  }, [messages, attempts, endpoints])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analytics and insights for your webhook delivery
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedApp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endpoint (Optional)
            </label>
            <select
              value={selectedEndpoint?.id || ''}
              onChange={(e) => {
                const endpoint = endpoints.find((ep) => ep.id === e.target.value)
                setSelectedEndpoint(endpoint || null)
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">All Endpoints</option>
              {endpoints.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.description || ep.url}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {selectedApp ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Messages Inbound"
              value={stats.totalMessages}
              change={12}
              icon={MessageSquare}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Attempts Outbound"
              value={stats.totalAttempts}
              change={8}
              icon={Send}
              color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            />
            <StatCard
              title="Failed Attempts"
              value={stats.failedAttempts}
              change={-5}
              icon={AlertTriangle}
              color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            />
            <StatCard
              title="Avg Response Time"
              value={`${stats.avgResponseTime}ms`}
              change={-3}
              icon={Clock}
              color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
            />
          </div>

          {/* Main Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Timeline Charts (Vertical Stack) */}
            <div className="space-y-6">
              {/* Activity Timeline */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Activity Timeline
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Messages"
                    />
                    <Area
                      type="monotone"
                      dataKey="attempts"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Attempts"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Success vs Failed Timeline */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Success vs Failed
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="success" fill="#10b981" name="Success" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Response Time Timeline */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Response Time
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value) => [`${value}ms`, 'Avg Time']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="avgResponseTime"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Avg Response Time (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column - Response Time by Endpoint and Attempt Status */}
            <div className="space-y-6">
              {/* Response Time by Endpoint */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Response Time by Endpoint
                </h3>
                {responseTimeByEndpoint.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={responseTimeByEndpoint} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value) => [`${value}ms`, 'Avg Time']}
                      />
                      <Bar dataKey="avgTime" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>

              {/* Attempt Status */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Attempt Status
                </h3>
                {statusDistribution.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={186}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {statusDistribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>

              {/* Messages & Attempts by Endpoint */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Messages & Attempts by Endpoint
                </h3>
                {messagesByEndpoint.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={messagesByEndpoint}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
                      <Bar dataKey="attempts" fill="#10b981" name="Attempts" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.successRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {endpoints.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Endpoints</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingAttempts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messages.length > 0 ? formatDateTime(messages[0].timestamp) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last Message</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select an Application
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose an application to view analytics and insights
          </p>
        </div>
      )}
    </div>
  )
}
