"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"

const regionData = [
  {
    code: "iad1",
    name: "Washington, D.C.",
    country: "USA",
    lat: 38.9,
    lng: -77.0,
    status: "excellent",
    responseTime: 45,
  },
  { code: "sfo1", name: "San Francisco", country: "USA", lat: 37.8, lng: -122.4, status: "good", responseTime: 52 },
  { code: "lhr1", name: "London", country: "UK", lat: 51.5, lng: -0.1, status: "excellent", responseTime: 38 },
  { code: "fra1", name: "Frankfurt", country: "Germany", lat: 50.1, lng: 8.7, status: "excellent", responseTime: 41 },
  { code: "ams1", name: "Amsterdam", country: "Netherlands", lat: 52.4, lng: 4.9, status: "good", responseTime: 48 },
  { code: "nrt1", name: "Tokyo", country: "Japan", lat: 35.7, lng: 139.7, status: "good", responseTime: 68 },
  { code: "sin1", name: "Singapore", country: "Singapore", lat: 1.3, lng: 103.8, status: "fair", responseTime: 72 },
  { code: "syd1", name: "Sydney", country: "Australia", lat: -33.9, lng: 151.2, status: "fair", responseTime: 85 },
  { code: "gru1", name: "São Paulo", country: "Brazil", lat: -23.5, lng: -46.6, status: "poor", responseTime: 95 },
]

export function RegionMap() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-yellow-500"
      case "fair":
        return "bg-orange-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-yellow-100 text-yellow-800",
      fair: "bg-orange-100 text-orange-800",
      poor: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Global Region Map</h2>
        <p className="text-muted-foreground">
          Visual overview of all Vercel Edge regions and their current performance status
        </p>
      </div>

      {/* World Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Global Edge Network
          </CardTitle>
          <CardDescription>Interactive map showing all Vercel Edge regions and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Interactive World Map</h3>
                <p className="text-muted-foreground">
                  In a production app, this would show an interactive world map with region markers
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Excellent (&lt;50ms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Good (50-70ms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Fair (70-90ms)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Poor (&gt;90ms)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionData.map((region) => (
          <Card key={region.code} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(region.status)}`} />

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{region.code.toUpperCase()}</CardTitle>
                  <CardDescription className="text-xs">
                    {region.name}, {region.country}
                  </CardDescription>
                </div>
                <Badge className={getStatusBadge(region.status)}>{region.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Response Time:
                </span>
                <span className="font-medium">{region.responseTime}ms</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Coordinates:
                </span>
                <span className="font-mono text-xs">
                  {region.lat}°, {region.lng}°
                </span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(region.status)}`}></div>
                  <span className="text-xs text-muted-foreground">Last tested: 2 minutes ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Global Performance Summary</CardTitle>
          <CardDescription>Overall network health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-muted-foreground">Excellent Regions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-muted-foreground">Good Regions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-muted-foreground">Fair Regions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-muted-foreground">Poor Regions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
