import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { url, apiKey } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const startTime = Date.now()

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

    const endTime = Date.now()
    const latency = endTime - startTime

    if (!microlinkResponse.ok) {
      return NextResponse.json(
        { error: "Microlink API request failed", status: microlinkResponse.status },
        { status: microlinkResponse.status },
      )
    }

    const data = await microlinkResponse.json()

    return NextResponse.json({
      latency,
      success: true,
      data: {
        title: data.data?.title,
        description: data.data?.description,
        image: data.data?.image?.url,
        url: data.data?.url,
      },
      region: process.env.VERCEL_REGION || "unknown",
      timestamp: new Date().toISOString(),
      endpoint: apiKey ? "pro.microlink.io" : "api.microlink.io",
    })
  } catch (error) {
    console.error("Microlink API error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
