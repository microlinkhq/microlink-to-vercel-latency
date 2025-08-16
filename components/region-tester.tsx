"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface CacheResult {
  microlinkLatency: number
  vercelLatency: number
  microlinkCacheStatus: string
  vercelCacheStatus: string
  endpoint?: string
}

interface RegionData {
  vercelRegion: string
  location: string
  flag: string
  result?: CacheResult
  status: "idle" | "testing" | "complete" | "error"
}

const REGIONS: RegionData[] = [
  { vercelRegion: "IAD1", location: "Washington DC", flag: "🇺🇸", status: "idle" },
  { vercelRegion: "LHR1", location: "London", flag: "🇬🇧", status: "idle" },
  { vercelRegion: "SIN1", location: "Singapore", flag: "🇸🇬", status: "idle" },
]

interface RegionTesterProps {
  isRunning: boolean
  targetUrl: string
  apiKey: string
}

export function RegionTester({ isRunning, targetUrl, apiKey }: RegionTesterProps) {
  const [regions, setRegions] = useState<RegionData[]>(REGIONS)

  const performCacheTest = async (region: RegionData): Promise<CacheResult> => {
    try {
      const startTime = performance.now()
      const response = await fetch("/api/microlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl,
          apiKey: apiKey || undefined,
          region: region.vercelRegion,
        }),
      })
      const vercelLatency = Math.round(performance.now() - startTime)

      const data = await response.json()

      if (data.success) {
        return {
          microlinkLatency: data.microlinkLatency || 0,
          vercelLatency,
          microlinkCacheStatus: data.microlinkCacheStatus || "UNKNOWN",
          vercelCacheStatus: response.headers.get("x-vercel-cache") || "UNKNOWN",
          endpoint: data.endpoint,
        }
      } else {
        throw new Error(data.error || "API call failed")
      }
    } catch (error) {
      console.error(`Error testing region ${region.vercelRegion}:`, error)
      throw error
    }
  }

  useEffect(() => {
    if (isRunning) {
      // Reset all regions to testing state
      setRegions((prev) => prev.map((region) => ({ ...region, status: "testing", result: undefined })))

      // Test all regions simultaneously
      const testPromises = REGIONS.map(async (region, index) => {
        try {
          const result = await performCacheTest(region)
          return { index, result, status: "complete" as const }
        } catch (error) {
          return { index, error, status: "error" as const }
        }
      })

      Promise.all(testPromises).then((results) => {
        setRegions((prev) =>
          prev.map((region, index) => {
            const testResult = results[index]
            return {
              ...region,
              result: testResult.status === "complete" ? testResult.result : undefined,
              status: testResult.status,
            }
          }),
        )
      })
    } else {
      // Reset when not running
      setRegions((prev) => prev.map((region) => ({ ...region, status: "idle", result: undefined })))
    }
  }, [isRunning, targetUrl, apiKey])

  const getCacheStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case "HIT":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      case "MISS":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      case "BYPASS":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      case "EXPIRED":
        return "bg-orange-500/20 text-orange-400 border border-orange-500/30"
      case "STALE":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30"
      case "UNKNOWN":
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  const getLatencyColor = (latency: number): string => {
    if (latency <= 100) return "text-green-400"
    if (latency <= 300) return "text-yellow-400"
    if (latency <= 500) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Vercel Region</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Location</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-200">Microlink Cache</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-200">Microlink Time</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-200">Vercel Cache</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-200">Vercel Time</th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-200">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {regions.map((region) => (
              <tr key={region.vercelRegion} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-4 text-sm font-mono font-medium text-white">{region.vercelRegion}</td>
                <td className="px-4 py-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{region.flag}</span>
                    <span>{region.location}</span>
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  {region.result ? (
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getCacheStatusColor(region.result.microlinkCacheStatus)}`}
                    >
                      {region.result.microlinkCacheStatus}
                    </div>
                  ) : region.status === "testing" ? (
                    <div className="inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                      ...
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-600 border border-gray-700">
                      -
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  {region.result ? (
                    <span className={`text-sm font-mono ${getLatencyColor(region.result.microlinkLatency)}`}>
                      {region.result.microlinkLatency}ms
                    </span>
                  ) : region.status === "testing" ? (
                    <span className="text-sm text-blue-400 animate-pulse">...</span>
                  ) : (
                    <span className="text-sm text-gray-600">-</span>
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  {region.result ? (
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getCacheStatusColor(region.result.vercelCacheStatus)}`}
                    >
                      {region.result.vercelCacheStatus}
                    </div>
                  ) : region.status === "testing" ? (
                    <div className="inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                      ...
                    </div>
                  ) : (
                    <div className="inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-600 border border-gray-700">
                      -
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  {region.result ? (
                    <span className={`text-sm font-mono ${getLatencyColor(region.result.vercelLatency)}`}>
                      {region.result.vercelLatency}ms
                    </span>
                  ) : region.status === "testing" ? (
                    <span className="text-sm text-blue-400 animate-pulse">...</span>
                  ) : (
                    <span className="text-sm text-gray-600">-</span>
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  <Badge
                    variant={
                      region.status === "complete" ? "default" : region.status === "error" ? "destructive" : "secondary"
                    }
                    className={
                      region.status === "complete"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : region.status === "error"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : region.status === "testing"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-gray-700 text-gray-300 border border-gray-600"
                    }
                  >
                    {region.status === "complete"
                      ? "✓"
                      : region.status === "error"
                        ? "✗"
                        : region.status === "testing"
                          ? "..."
                          : "○"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
