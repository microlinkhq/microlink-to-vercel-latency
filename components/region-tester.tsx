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
  onTestingComplete
}: RegionTesterProps) {
  const [regions, setRegions] = useState<RegionData[]>(REGIONS)
  const isTestingRef = useRef(false)

  const getCacheStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'HIT':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'MISS':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'BYPASS':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'EXPIRED':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      case 'STALE':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'UNKNOWN':
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const getLatencyColor = (latency: number): string => {
    if (latency <= 100) return 'text-green-400'
    if (latency <= 300) return 'text-yellow-400'
    if (latency <= 500) return 'text-orange-400'
    return 'text-red-400'
  }

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
      const responses = await Promise.all(
        REGIONS.map(async regionData => {
          try {
            const duration = timestamp()
            // Build URL with query parameters for GET request
            const params = new URLSearchParams({
              url: targetUrl
            })
            if (apiKey) {
              params.set('apiKey', apiKey)
            }
            // const baseUrl = `https://vercel-latency-jucqt31sj-microlink.vercel.app/api/microlink/${regionData.vercelRegion}`
            const baseUrl = `/api/microlink/${regionData.vercelRegion}`

            const url = `${baseUrl}?${params.toString()}`.toString()

            console.log({ url })

            const response = await fetch(url, {
              method: 'GET'
              // Remove cache: 'no-store' to allow Vercel caching
            })
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

      console.log(responses)

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
    <div className='bg-gray-900 rounded-lg border border-gray-800 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-800 border-b border-gray-700'>
            <tr>
              <th className='px-4 py-4 text-left text-sm font-semibold text-gray-200'>
                Vercel Region
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-gray-200'>
                Microlink Cache
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-gray-200'>
                Microlink Time
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-gray-200'>
                Vercel Cache
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-gray-200'>
                Vercel Time
              </th>
              <th className='px-4 py-4 text-center text-sm font-semibold text-gray-200'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-800'>
            {regions.map(region => (
              <tr
                key={region.vercelRegion}
                className='hover:bg-gray-800/50 transition-colors'
              >
                <td className='px-4 py-4 text-sm font-mono font-medium text-white'>
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
                      {getTTL(region.result.microlinkHeaders)}
                    </div>
                  ) : region.status === 'testing' ? (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'>
                      ...
                    </div>
                  ) : (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-600 border border-gray-700'>
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
                    <span className='text-sm text-blue-400 animate-pulse'>
                      ...
                    </span>
                  ) : (
                    <span className='text-sm text-gray-600'>-</span>
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
                      {getTTL(region.result.vercelHeaders)}
                    </div>
                  ) : region.status === 'testing' ? (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'>
                      ...
                    </div>
                  ) : (
                    <div className='inline-block px-2 py-1 rounded text-xs bg-gray-800 text-gray-600 border border-gray-700'>
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
                    <span className='text-sm text-blue-400 animate-pulse'>
                      ...
                    </span>
                  ) : (
                    <span className='text-sm text-gray-600'>-</span>
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
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : region.status === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : region.status === 'testing'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-700 text-gray-300 border border-gray-600'
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
