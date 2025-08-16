"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface TestResult {
  latency: number
  status: "hot" | "cold"
}

interface RegionData {
  vercelRegion: string
  location: string
  flag: string
  avgLatency: number
  results: TestResult[]
  temp: "Hot" | "Cold"
}

const REGIONS: RegionData[] = [
  { vercelRegion: "IAD1", location: "Washington DC", flag: "🇺🇸", avgLatency: 25, results: [], temp: "Hot" },
  { vercelRegion: "LHR1", location: "London", flag: "🇬🇧", avgLatency: 28, results: [], temp: "Hot" },
  { vercelRegion: "SIN1", location: "Singapore", flag: "🇸🇬", avgLatency: 92, results: [], temp: "Cold" },
]

interface RegionTesterProps {
  isRunning: boolean
  targetUrl: string
  apiKey: string
}

export function RegionTester({ isRunning, targetUrl, apiKey }: RegionTesterProps) {
  const [regions, setRegions] = useState<RegionData[]>(REGIONS)
  const [currentTest, setCurrentTest] = useState(0)

  const generateTestResults = (baseLatency: number): TestResult[] => {
    return Array.from({ length: 10 }, (_, i) => {
      // Microlink API can have more variation in response times
      const variation = (Math.random() - 0.5) * baseLatency * 1.2
      const latency = Math.max(15, Math.round(baseLatency + variation))
      const status = Math.random() > 0.4 ? "hot" : "cold"
      return { latency, status }
    })
  }

  useEffect(() => {
    if (isRunning && currentTest < 10) {
      const timer = setTimeout(() => {
        setRegions((prev) =>
          prev.map((region) => ({
            ...region,
            results: generateTestResults(region.avgLatency),
          })),
        )
        setCurrentTest((prev) => prev + 1)
      }, 800) // Slightly slower to simulate API calls
      return () => clearTimeout(timer)
    } else if (!isRunning) {
      setCurrentTest(0)
      setRegions((prev) => prev.map((region) => ({ ...region, results: [] })))
    }
  }, [isRunning, currentTest])

  const getIntensityColor = (latency: number): string => {
    if (latency <= 50) return "bg-green-500/20 text-green-400 border border-green-500/30"
    if (latency <= 100) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    if (latency <= 150) return "bg-orange-500/20 text-orange-400 border border-orange-500/30"
    if (latency <= 200) return "bg-red-500/20 text-red-400 border border-red-500/30"
    return "bg-red-600/30 text-red-300 border border-red-600/40"
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Vercel Region</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Location</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Avg latency</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="px-3 py-4 text-center text-sm font-semibold text-gray-200">
                  #{i + 1}
                </th>
              ))}
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-200">Temp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {regions.map((region, regionIndex) => (
              <tr key={region.vercelRegion} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-4 text-sm font-mono font-medium text-white">{region.vercelRegion}</td>
                <td className="px-4 py-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{region.flag}</span>
                    <span>{region.location}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-mono text-gray-300">{region.avgLatency}ms</td>
                {Array.from({ length: 10 }, (_, testIndex) => {
                  const result = region.results[testIndex]
                  const isActive = isRunning && testIndex === currentTest - 1

                  return (
                    <td key={testIndex} className="px-3 py-4 text-center">
                      {result ? (
                        <div
                          className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getIntensityColor(result.latency)}`}
                        >
                          {result.latency}ms
                        </div>
                      ) : isActive ? (
                        <div className="inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                          ...
                        </div>
                      ) : (
                        <div className="inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-600 border border-gray-700">
                          -
                        </div>
                      )}
                    </td>
                  )
                })}
                <td className="px-4 py-4">
                  <Badge
                    variant={region.temp === "Hot" ? "destructive" : "secondary"}
                    className={
                      region.temp === "Hot"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                    }
                  >
                    {region.temp}
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
