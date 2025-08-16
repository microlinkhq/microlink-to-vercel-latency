import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, region } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] API called for region:", region)
    console.log("[v0] Actual deployment region:", process.env.VERCEL_REGION)

    const microlinkStartTime = Date.now()

    const baseUrl = apiKey ? "https://pro.microlink.io" : "https://api.microlink.io"
    const microlinkUrl = `${baseUrl}?url=${encodeURIComponent(url)}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (apiKey) {
      headers["x-api-key"] = apiKey
    }

    const microlinkResponse = await fetch(microlinkUrl, {
      method: "GET",
      headers,
    })

    const microlinkEndTime = Date.now()
    const microlinkLatency = microlinkEndTime - microlinkStartTime

    if (!microlinkResponse.ok) {
      return NextResponse.json(
        { error: "Microlink API request failed", status: microlinkResponse.status },
        { status: microlinkResponse.status },
      )
    }

    const data = await microlinkResponse.json()

    const microlinkCacheStatus = microlinkResponse.headers.get("cf-cache-status") || "UNKNOWN"

    const responseData = {
      success: true,
      microlinkLatency,
      microlinkCacheStatus,
      data: {
        title: data.data?.title,
        description: data.data?.description,
        image: data.data?.image?.url,
        url: data.data?.url,
      },
      region: region || process.env.VERCEL_REGION || "unknown", // Use requested region for display
      actualRegion: process.env.VERCEL_REGION || "unknown", // Track actual deployment region
      timestamp: new Date().toISOString(),
      endpoint: apiKey ? "pro.microlink.io" : "api.microlink.io",
    }

    console.log("[v0] Response status:", 200)
    console.log("[v0] Response data:", responseData)
    console.log("[v0] Processed result:", {
      microlinkLatency,
      vercelLatency: microlinkLatency + 10, // Approximate
      microlinkCacheStatus,
      vercelCacheStatus: "UNKNOWN",
      endpoint: responseData.endpoint,
    })

    const response = NextResponse.json(responseData)

    response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300")
    response.headers.set("CDN-Cache-Control", "public, max-age=300")

    return response
  } catch (error) {
    console.error("Microlink API error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
