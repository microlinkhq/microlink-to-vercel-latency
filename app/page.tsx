'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search, Play, RotateCcw, Key, Globe } from 'lucide-react'
import { RegionTester } from '@/components/region-tester'

export default function HomePage () {
  const [targetUrl, setTargetUrl] = useState('https://microlink.io/docs')
  const [isRunning, setIsRunning] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [regionCount, setRegionCount] = useState<'1' | '3'>('1')

  useEffect(() => {
    const savedApiKey = localStorage.getItem('microlink-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (value) {
      localStorage.setItem('microlink-api-key', value)
    } else {
      localStorage.removeItem('microlink-api-key')
    }
  }

  const handleTestingComplete = () => {
    setIsRunning(false)
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Header */}
      <header className='border-b border-border'>
        <div className='max-w-4xl mx-auto px-6 py-8'>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-3 mb-2'>
              <img
                src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSIzMSI+PHBhdGggZmlsbD0iI2VhNDA3YiIgZD0iTTM4LjQ2Mi4yMDlIMTguNTg3Yy0yLjg3OSAwLTUuMjIxIDIuMjE0LTUuMjIxIDQuOTM1VjcuNjZoMy4zVjUuMTQ0YzAtLjg5NS44NjItMS42MjIgMS45MjEtMS42MjJoMTkuODc1YzEuMDYgMCAxLjkyMS43MjggMS45MjEgMS42MjJWMTcuMjJjMCAuODk0LS44NjIgMS42MjEtMS45MiAxLjYyMUgxOC41ODZjLTEuMDYgMC0xLjkyMi0uNzI3LTEuOTIyLTEuNjIxdi0zLjg1OGgtMy4zdjMuODU4YzAgMi43MiAyLjM0MyA0LjkzNCA1LjIyMiA0LjkzNGgxOS44NzVjMi44NzkgMCA1LjIyLTIuMjE0IDUuMjItNC45MzRWNS4xNDRjMC0yLjcyMi0yLjM0MS00LjkzNS01LjIyLTQuOTM1eiIvPjxwYXRoIGZpbGw9IiM2NTRlYTMiIGQ9Ik0zMC4zMTcgMjUuNzM3VjIzLjIyaC0zLjN2Mi41MTdjMCAuODk1LS44NjIgMS42MjItMS45MjIgMS42MjJINS4yMjFjLTEuMDU5IDAtMS45MjEtLjcyOC0xLjkyMS0xLjYyMlYxMy42NmMwLS44OTQuODYyLTEuNjIxIDEuOTIxLTEuNjIxaDE5Ljg3NGMxLjA2IDAgMS45MjIuNzI3IDEuOTIyIDEuNjIxdjMuODU4aDMuM1YxMy42NmMwLTIuNzItMi4zNDMtNC45MzUtNS4yMjItNC45MzVINS4yMkMyLjM0MyA4LjcyNSAwIDEwLjk0IDAgMTMuNjZ2MTIuMDc3YzAgMi43MjEgMi4zNDMgNC45MzUgNS4yMjEgNC45MzVoMTkuODc0YzIuODggMCA1LjIyMi0yLjIxMyA1LjIyMi00LjkzNXoiLz48L3N2Zz4='
                alt='Microlink'
                className='w-5'
              />
              <h1 className='text-2xl font-bold'>
                Microlink <span className='text-primary'>API</span> Global
                Latency
              </h1>
            </div>
            <p className='text-muted-foreground text-base'>
              Test response times from all Vercel Edge regions
            </p>
          </div>

          {/* Configuration section */}
          <div className='mt-8 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* API Key input */}
            <div>
              <Label
                htmlFor='api-key'
                className='text-sm font-medium text-foreground mb-2 block'
              >
                Microlink API Key
              </Label>
              <div className='relative'>
                <Key className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  id='api-key'
                  type='password'
                  value={apiKey}
                  onChange={e => handleApiKeyChange(e.target.value)}
                  placeholder='Enter your Microlink API key...'
                  className='pl-10 bg-card border-border text-foreground placeholder-muted-foreground focus:border-primary'
                />
              </div>
            </div>

            {/* Region count selector */}
            <div>
              <Label
                htmlFor='region-count'
                className='text-sm font-medium text-foreground mb-2 block'
              >
                Regions to Test
              </Label>
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10' />
                <Select
                  value={regionCount}
                  onValueChange={(value: '1' | '3') => setRegionCount(value)}
                >
                  <SelectTrigger className='pl-10 bg-card border-border text-foreground focus:border-primary'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1 Region (Fast)</SelectItem>
                    <SelectItem value='3'>3 Regions (Complete)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mt-6 flex justify-center'>
            <div className='relative max-w-md w-full'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder='Enter URL to test...'
                className='pl-10 bg-card border-border text-foreground placeholder-muted-foreground focus:border-primary'
              />
            </div>
            <Button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isRunning} // removed !apiKey condition to make API key optional
              className='ml-3 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50'
            >
              {isRunning ? (
                <>
                  <RotateCcw className='w-4 h-4 animate-spin mr-2' />
                  Testing...
                </>
              ) : (
                <>
                  <Play className='w-4 h-4 mr-2' />
                  Verify Cache Integrity
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-8'>
        {/* Description */}
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            Cache Integrity Verification
          </h2>
          <p className='text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            The demo verifies cache integrity between Vercel and Microlink
            across 3 regions. Each test performs a single request to check
            cf-cache-status from Microlink and cache headers from Vercel,
            measuring response times to analyze caching behavior across the
            global edge network.
          </p>
        </div>

        {/* Results Table */}
        <RegionTester
          isRunning={isRunning}
          targetUrl={targetUrl}
          apiKey={apiKey}
          regionCount={regionCount}
          onTestingComplete={handleTestingComplete}
        />
      </main>
    </div>
  )
}
