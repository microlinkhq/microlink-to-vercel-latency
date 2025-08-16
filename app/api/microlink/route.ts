import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey, region } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

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

    const response = NextResponse.json({
      microlinkLatency,
      success: true,
      data: {
        title: data.data?.title,
        description: data.data?.description,
        image: data.data?.image?.url,
        url: data.data?.url,
      },
      region: process.env.VERCEL_REGION || region || "unknown",
      timestamp: new Date().toISOString(),
      endpoint: apiKey ? "pro.microlink.io" : "api.microlink.io",
      microlinkCacheStatus,
    })

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
