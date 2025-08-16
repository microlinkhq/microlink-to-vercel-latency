"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  { vercelRegion: "ARN1", location: "Stockholm", flag: "🇸🇪", avgLatency: 45, results: [], temp: "Hot" },
  { vercelRegion: "BOM1", location: "Mumbai", flag: "🇮🇳", avgLatency: 180, results: [], temp: "Cold" },
  { vercelRegion: "CDG1", location: "Paris", flag: "🇫🇷", avgLatency: 35, results: [], temp: "Cold" },
  { vercelRegion: "CLE1", location: "Cleveland", flag: "🇺🇸", avgLatency: 85, results: [], temp: "Cold" },
  { vercelRegion: "CPT1", location: "Cape Town", flag: "🇿🇦", avgLatency: 220, results: [], temp: "Cold" },
  { vercelRegion: "DUB1", location: "Dublin", flag: "🇮🇪", avgLatency: 40, results: [], temp: "Cold" },
  { vercelRegion: "FRA1", location: "Frankfurt", flag: "🇩🇪", avgLatency: 32, results: [], temp: "Cold" },
  { vercelRegion: "GRU1", location: "São Paulo", flag: "🇧🇷", avgLatency: 120, results: [], temp: "Cold" },
  { vercelRegion: "HKG1", location: "Hong Kong", flag: "🇭🇰", avgLatency: 95, results: [], temp: "Cold" },
  { vercelRegion: "HND1", location: "Tokyo", flag: "🇯🇵", avgLatency: 75, results: [], temp: "Hot" },
  { vercelRegion: "IAD1", location: "Washington DC", flag: "🇺🇸", avgLatency: 25, results: [], temp: "Hot" },
  { vercelRegion: "ICN1", location: "Seoul", flag: "🇰🇷", avgLatency: 88, results: [], temp: "Cold" },
  { vercelRegion: "KIX1", location: "Osaka", flag: "🇯🇵", avgLatency: 78, results: [], temp: "Hot" },
  { vercelRegion: "LHR1", location: "London", flag: "🇬🇧", avgLatency: 28, results: [], temp: "Hot" },
  { vercelRegion: "PDX1", location: "Portland", flag: "🇺🇸", avgLatency: 55, results: [], temp: "Hot" },
  { vercelRegion: "SFO1", location: "San Francisco", flag: "🇺🇸", avgLatency: 48, results: [], temp: "Hot" },
  { vercelRegion: "SIN1", location: "Singapore", flag: "🇸🇬", avgLatency: 92, results: [], temp: "Cold" },
  { vercelRegion: "SYD1", location: "Sydney", flag: "🇦🇺", avgLatency: 110, results: [], temp: "Cold" },
]

interface RegionTesterProps {
  isRunning: boolean
  targetUrl: string
}

export function RegionTester({ isRunning, targetUrl }: RegionTesterProps) {
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
    if (latency <= 50) return "bg-green-200 dark:bg-green-800"
    if (latency <= 100) return "bg-yellow-200 dark:bg-yellow-800"
    if (latency <= 150) return "bg-orange-200 dark:bg-orange-800"
    if (latency <= 200) return "bg-red-200 dark:bg-red-800"
    return "bg-red-300 dark:bg-red-900"
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  Vercel Region
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  Avg latency
                </th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="px-3 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{i + 1}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Temp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {regions.map((region, regionIndex) => (
                <tr key={region.vercelRegion} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {region.vercelRegion}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span>{region.flag}</span>
                      <span>{region.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{region.avgLatency}ms</td>
                  {Array.from({ length: 10 }, (_, testIndex) => {
                    const result = region.results[testIndex]
                    const isActive = isRunning && testIndex === currentTest - 1

                    return (
                      <td key={testIndex} className="px-3 py-3 text-center">
                        {result ? (
                          <div
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getIntensityColor(result.latency)}`}
                          >
                            {result.latency}ms
                          </div>
                        ) : isActive ? (
                          <div className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
                            ...
                          </div>
                        ) : (
                          <div className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
                            -
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3">
                    <Badge variant={region.temp === "Hot" ? "destructive" : "secondary"}>{region.temp}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
