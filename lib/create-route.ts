import { type NextRequest, NextResponse } from "next/server"
import { timestamp } from "@/lib/utils"

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const apiKey = searchParams.get('apiKey')

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const duration = timestamp()

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

    const microlinkLatency = duration()

    if (!microlinkResponse.ok) {
      return NextResponse.json(
        { error: "Microlink API request failed", status: microlinkResponse.status },
        { status: microlinkResponse.status },
      )
    }


    const microlinkCacheStatus = microlinkResponse.headers.get("cf-cache-status") || "UNKNOWN"

    const responseData = {
      microlinkLatency,
      microlinkCacheStatus,
      microlinkHeaders: Object.fromEntries(microlinkResponse.headers.entries()),
      timestamp: new Date().toISOString(),
    }

    const response = NextResponse.json(responseData)
    response.headers.set("Access-Control-Allow-Origin", "*")
    
    // Copy cache headers from Microlink response to mimic their caching behavior
    const microlinkCacheControl = microlinkResponse.headers.get("cache-control")
    const microlinkAge = microlinkResponse.headers.get("age")
    const microlinkEtag = microlinkResponse.headers.get("etag")

    if (microlinkCacheControl) {
      response.headers.set("Cache-Control", microlinkCacheControl)
      response.headers.set("CDN-Cache-Control", microlinkCacheControl)
    }
    if (microlinkAge) {
      response.headers.set("Age", microlinkAge)
    }
    if (microlinkEtag) {
      response.headers.set("ETag", microlinkEtag)
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
