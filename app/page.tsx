"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Play, RotateCcw } from "lucide-react"
import { RegionTester } from "@/components/region-tester"

export default function HomePage() {
  const [targetUrl, setTargetUrl] = useState("https://microlink.io/docs")
  const [isRunning, setIsRunning] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Microlink API Global Latency Test</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Test Microlink API response times from all Vercel Edge regions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              The demo invokes Vercel Functions in our 18 regions, which call the Microlink API to extract metadata from
              the target URL. Each function makes 10 requests to measure latency and performance across the global edge
              network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-url">Target URL for Microlink API</Label>
                <Input
                  id="target-url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="max-w-md"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  URL that Microlink API will analyze for metadata extraction
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Testing Microlink API...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Global Microlink Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <RegionTester isRunning={isRunning} targetUrl={targetUrl} />
      </main>
    </div>
  )
}
