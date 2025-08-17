'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { timestamp } from '@/lib/utils'
import prettyMs from 'pretty-ms'

interface CacheResult {
  microlinkLatency: number
  microlinkCacheStatus: string
  microlinkHeaders: Record<string, string>
  vercelLatency: number
  vercelCacheStatus: string
  vercelHeaders: Record<string, string>
}

interface RegionData {
  vercelRegion: string
  flag: string
  result?: CacheResult
  status: 'idle' | 'testing' | 'complete' | 'error'
}

const REGIONS: RegionData[] = [
  { vercelRegion: 'iad1', flag: '🇺🇸', status: 'idle' },
  { vercelRegion: 'lhr1', flag: '🇬🇧', status: 'idle' },
  { vercelRegion: 'sin1', flag: '🇸🇬', status: 'idle' }
]

interface RegionTesterProps {
  isRunning: boolean
  targetUrl: string
  apiKey: string
  regionCount: '1' | '3'
  onTestingComplete: () => void // Added callback prop
}

const getTTL = (headers: Record<string, string>): string => {
  const age = Number(headers['age']) || 0
  const maxAge = Number(headers['cache-control'].split('max-age=')[1])
  const inSeconds = maxAge - age
  const inMs = inSeconds * 1000
  return prettyMs(inMs)
}

export function RegionTester ({
  isRunning,
  targetUrl,
  apiKey,
  regionCount,
  onTestingComplete
}: RegionTesterProps) {
  // Filter regions based on regionCount
  const getActiveRegions = (count: '1' | '3') => {
    if (count === '1') {
      return [REGIONS[0]] // Only use first region (iad1 - US East)
    }
    return REGIONS // Use all 3 regions
  }

  const [regions, setRegions] = useState<RegionData[]>(() =>
    getActiveRegions(regionCount)
  )
  const isTestingRef = useRef(false)

  const getCacheStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'HIT':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'MISS':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'BYPASS':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'EXPIRED':
        return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'STALE':
        return 'bg-purple-50 text-purple-700 border border-purple-200'
      case 'UNKNOWN':
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getLatencyColor = (latency: number): string => {
    if (latency <= 100) return 'text-green-700'
    if (latency <= 300) return 'text-yellow-700'
    if (latency <= 500) return 'text-orange-700'
    return 'text-red-700'
  }

  // Update regions when regionCount changes
  useEffect(() => {
    setRegions(getActiveRegions(regionCount))
  }, [regionCount])

  useEffect(() => {
    if (isRunning && !isTestingRef.current) {
      // Reset regions to idle state before starting new test
      setRegions(prev =>
        prev.map(region => ({ ...region, status: 'idle', result: undefined }))
      )
      isTestingRef.current = true
      runTests()
    } else if (!isRunning) {
      isTestingRef.current = false
      // Don't clear results when stopping - let users see the results!
    }
  }, [isRunning, targetUrl, apiKey])

  const runTests = async () => {
    // Set all regions to testing status
    setRegions(prev =>
      prev.map(region => ({ ...region, status: 'testing' as const }))
    )

    try {
      const activeRegions = getActiveRegions(regionCount)
      const responses = await Promise.all(
        activeRegions.map(async regionData => {
          try {
            const duration = timestamp()
            // Build URL with query parameters for GET request
            const params = new URLSearchParams({
              url: targetUrl
            })
            if (apiKey) {
              params.set('apiKey', apiKey)
            }
            const baseUrl = `/api/microlink/${regionData.vercelRegion}`
            const url = `${baseUrl}?${params.toString()}`.toString()

            const response = await fetch(url, { cache: 'no-store' })
            const vercelLatency = duration()

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            data.vercelLatency = vercelLatency
            data.vercelCacheStatus =
              response.headers.get('x-vercel-cache') || 'UNKNOWN'
            data.vercelHeaders = Object.fromEntries(response.headers.entries())

            return {
              vercelRegion: regionData.vercelRegion,
              success: true,
              ...data
            }
          } catch (error) {
            console.error(
              `Error testing region ${regionData.vercelRegion}:`,
              error
            )
            return {
              vercelRegion: regionData.vercelRegion,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      // Process responses and update regions
      setRegions(prev =>
        prev.map(regionData => {
          const response = responses.find(
            r => r.vercelRegion === regionData.vercelRegion
          )

          if (!response) {
            return { ...regionData, status: 'error' as const }
          }

          if ('error' in response) {
            return { ...regionData, status: 'error' as const }
          }

          if (response.success) {
            return {
              ...regionData,
              status: 'complete' as const,
              result: {
                microlinkLatency: response.microlinkLatency,
                vercelLatency: response.vercelLatency,
                microlinkCacheStatus: response.microlinkCacheStatus,
                vercelCacheStatus: response.vercelCacheStatus,
                microlinkHeaders: response.microlinkHeaders,
                vercelHeaders: response.vercelHeaders
              }
            }
          }

          return { ...regionData, status: 'error' as const }
        })
      )
    } catch (error) {
      console.error('Error running tests:', error)
      // Set all regions to error status
      setRegions(prev =>
        prev.map(region => ({ ...region, status: 'error' as const }))
      )
    } finally {
      isTestingRef.current = false
      onTestingComplete()
    }
  }

  return (
    <div className='bg-card rounded-lg border border-border overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-muted border-b border-border'>
            <tr>
              <th className='px-4 py-4 text-left text-sm font-semibold text-foreground'>
                Vercel Region
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-foreground'>
                Microlink Cache
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-foreground'>
                Microlink Time
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-foreground'>
                Vercel Cache
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-foreground'>
                Vercel Time
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-foreground'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {regions.map(region => (
              <tr
                key={region.vercelRegion}
                className='hover:bg-muted/50 transition-colors'
              >
                <td className='px-4 py-4 text-sm font-mono font-medium text-foreground'>
                  {region.vercelRegion} {region.flag}
                </td>
                <td className='px-4 py-4 text-center'>
                  {region.result ? (
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getCacheStatusColor(
                        region.result.microlinkCacheStatus
                      )}`}
                    >
                      {region.result.microlinkCacheStatus}{' '}
                      {getTTL(region.result.microlinkHeaders)}{' '}
                      {region.result.microlinkHeaders['x-request-id']}
                    </div>
                  ) : region.status === 'testing' ? (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'>
                      ...
                    </div>
                  ) : (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-muted text-muted-foreground border border-border'>
                      -
                    </div>
                  )}
                </td>

                <td className='px-4 py-4 text-center'>
                  {region.result ? (
                    <span
                      className={`text-sm font-mono ${getLatencyColor(
                        region.result.microlinkLatency
                      )}`}
                    >
                      {region.result.microlinkLatency}ms
                    </span>
                  ) : region.status === 'testing' ? (
                    <span className='text-sm text-blue-700 animate-pulse'>
                      ...
                    </span>
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </td>

                <td className='px-4 py-4 text-center'>
                  {region.result ? (
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getCacheStatusColor(
                        region.result.vercelCacheStatus
                      )}`}
                    >
                      {region.result.vercelCacheStatus}{' '}
                      {getTTL(region.result.vercelHeaders)}{' '}
                      {region.result.vercelHeaders['x-vercel-id']}
                    </div>
                  ) : region.status === 'testing' ? (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'>
                      ...
                    </div>
                  ) : (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-muted text-muted-foreground border border-border'>
                      -
                    </div>
                  )}
                </td>

                <td className='px-4 py-4 text-center'>
                  {region.result ? (
                    <span
                      className={`text-sm font-mono ${getLatencyColor(
                        region.result.vercelLatency
                      )}`}
                    >
                      {region.result.vercelLatency}ms
                    </span>
                  ) : region.status === 'testing' ? (
                    <span className='text-sm text-blue-700 animate-pulse'>
                      ...
                    </span>
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </td>

                <td className='px-4 py-4 text-center'>
                  <Badge
                    variant={
                      region.status === 'complete'
                        ? 'default'
                        : region.status === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className={
                      region.status === 'complete'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : region.status === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : region.status === 'testing'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-muted text-muted-foreground border border-border'
                    }
                  >
                    {region.status === 'complete'
                      ? '✓'
                      : region.status === 'error'
                      ? '✗'
                      : region.status === 'testing'
                      ? '...'
                      : '○'}
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
