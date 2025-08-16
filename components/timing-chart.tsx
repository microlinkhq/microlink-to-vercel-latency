"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, Zap } from "lucide-react"

// Sample data for demonstration
const timingData = [
  { region: "IAD1", dns: 8, connect: 15, ssl: 25, ttfb: 45, download: 12, total: 105 },
  { region: "SFO1", dns: 12, connect: 18, ssl: 30, ttfb: 52, download: 15, total: 127 },
  { region: "LHR1", dns: 6, connect: 12, ssl: 22, ttfb: 38, download: 8, total: 86 },
  { region: "FRA1", dns: 7, connect: 14, ssl: 24, ttfb: 41, download: 10, total: 96 },
  { region: "NRT1", dns: 15, connect: 25, ssl: 35, ttfb: 68, download: 18, total: 161 },
  { region: "SIN1", dns: 18, connect: 28, ssl: 38, ttfb: 72, download: 20, total: 176 },
  { region: "SYD1", dns: 22, connect: 32, ssl: 42, ttfb: 85, download: 25, total: 206 },
  { region: "GRU1", dns: 25, connect: 35, ssl: 45, ttfb: 95, download: 28, total: 228 },
]

const performanceOverTime = [
  { time: "00:00", response: 120, uptime: 100 },
  { time: "04:00", response: 115, uptime: 99.9 },
  { time: "08:00", response: 108, uptime: 100 },
  { time: "12:00", response: 125, uptime: 99.8 },
  { time: "16:00", response: 118, uptime: 100 },
  { time: "20:00", response: 112, uptime: 100 },
  { time: "24:00", response: 116, uptime: 99.9 },
]

export function TimingChart() {
  const avgResponseTime = timingData.reduce((acc, curr) => acc + curr.total, 0) / timingData.length
  const fastestRegion = timingData.reduce((prev, curr) => (prev.total < curr.total ? prev : curr))
  const slowestRegion = timingData.reduce((prev, curr) => (prev.total > curr.total ? prev : curr))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <p className="text-muted-foreground">Detailed timing breakdown and performance trends across all regions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Response</p>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fastest Region</p>
                <p className="text-2xl font-bold">{fastestRegion.region}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {fastestRegion.total}ms
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Slowest Region</p>
                <p className="text-2xl font-bold">{slowestRegion.region}</p>
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {slowestRegion.total}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timing Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>HTTP Timing Breakdown by Region</CardTitle>
          <CardDescription>Detailed breakdown of DNS, connection, SSL, TTFB, and download times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value, name) => [`${value}ms`, name.toUpperCase()]}
                  labelFormatter={(label) => `Region: ${label}`}
                />
                <Bar dataKey="dns" stackId="a" fill="#3b82f6" name="DNS" />
                <Bar dataKey="connect" stackId="a" fill="#10b981" name="Connect" />
                <Bar dataKey="ssl" stackId="a" fill="#f59e0b" name="SSL" />
                <Bar dataKey="ttfb" stackId="a" fill="#ef4444" name="TTFB" />
                <Bar dataKey="download" stackId="a" fill="#8b5cf6" name="Download" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends (24h)</CardTitle>
          <CardDescription>Response time and uptime trends over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "response" ? `${value}ms` : `${value}%`,
                    name === "response" ? "Response Time" : "Uptime",
                  ]}
                />
                <Area type="monotone" dataKey="response" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Region Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Region Performance</CardTitle>
          <CardDescription>Complete timing data for all tested regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Region</th>
                  <th className="text-right p-2">DNS</th>
                  <th className="text-right p-2">Connect</th>
                  <th className="text-right p-2">SSL</th>
                  <th className="text-right p-2">TTFB</th>
                  <th className="text-right p-2">Download</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-center p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {timingData.map((region) => {
                  const grade = region.total < 100 ? "A" : region.total < 150 ? "B" : region.total < 200 ? "C" : "D"
                  const gradeColor =
                    grade === "A"
                      ? "bg-green-100 text-green-800"
                      : grade === "B"
                        ? "bg-yellow-100 text-yellow-800"
                        : grade === "C"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"

                  return (
                    <tr key={region.region} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{region.region}</td>
                      <td className="p-2 text-right">{region.dns}ms</td>
                      <td className="p-2 text-right">{region.connect}ms</td>
                      <td className="p-2 text-right">{region.ssl}ms</td>
                      <td className="p-2 text-right">{region.ttfb}ms</td>
                      <td className="p-2 text-right">{region.download}ms</td>
                      <td className="p-2 text-right font-bold">{region.total}ms</td>
                      <td className="p-2 text-center">
                        <Badge className={gradeColor}>{grade}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
