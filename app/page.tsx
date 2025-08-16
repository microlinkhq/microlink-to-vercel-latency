"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Play, RotateCcw, Key } from "lucide-react"
import { RegionTester } from "@/components/region-tester"

export default function HomePage() {
  const [targetUrl, setTargetUrl] = useState("https://microlink.io/docs")
  const [isRunning, setIsRunning] = useState(false)
  const [apiKey, setApiKey] = useState("")

  useEffect(() => {
    const savedApiKey = localStorage.getItem("microlink-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (value) {
      localStorage.setItem("microlink-api-key", value)
    } else {
      localStorage.removeItem("microlink-api-key")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              Microlink<span className="text-blue-400">API</span> Global Latency
            </h1>
            <p className="text-gray-400 text-lg">Test response times from all Vercel Edge regions</p>
          </div>

          {/* API Key input section */}
          <div className="mt-8 max-w-md mx-auto">
            <Label htmlFor="api-key" className="text-sm font-medium text-gray-300 mb-2 block">
              Microlink API Key
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter your Microlink API key..."
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{" "}
              <a
                href="https://microlink.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                microlink.io
              </a>
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter URL to test..."
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-400"
              />
            </div>
            <Button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isRunning} // removed !apiKey condition to make API key optional
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Global Latency
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4">Global Performance Testing</h2>
          <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
            The demo invokes Vercel Functions in our 3 regions, which call the Microlink API to extract metadata from
            the target URL. Each function makes 10 requests to measure latency and performance across the global edge
            network. {/* updated description to reflect 3 regions instead of 18 */}
          </p>
        </div>

        {/* Code Example */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">API Endpoint</h3>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <code className="text-green-400 text-sm font-mono">
              {`curl -X POST /api/microlink -d '{"url": "${targetUrl}"${apiKey ? `, "apiKey": "${apiKey}"` : ""}}'`}{" "}
              {/* made API key conditional in the example */}
            </code>
          </div>
        </div>

        {/* Results Table */}
        <RegionTester isRunning={isRunning} targetUrl={targetUrl} apiKey={apiKey} />
      </main>
    </div>
  )
}
