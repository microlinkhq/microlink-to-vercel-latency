import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const startTime = Date.now()

    const microlinkResponse = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
    })
  } catch (error) {
    console.error("Microlink API error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
