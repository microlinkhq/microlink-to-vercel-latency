import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Get region from headers (Vercel automatically sets this)
  const region = request.headers.get("x-vercel-id") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"
  const ip = request.headers.get("x-forwarded-for") || "unknown"

  // Simulate some processing time
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10))

  const endTime = Date.now()
  const processingTime = endTime - startTime

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    region: region,
    processingTime: processingTime,
    headers: {
      userAgent: userAgent,
      ip: ip,
      region: request.headers.get("x-vercel-id"),
      country: request.headers.get("x-vercel-ip-country"),
      city: request.headers.get("x-vercel-ip-city"),
    },
    message: `Hello from Vercel Edge Function! Processed in ${processingTime}ms`,
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const endTime = Date.now()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      region: request.headers.get("x-vercel-id") || "unknown",
      processingTime: endTime - startTime,
      receivedData: body,
      message: "POST request processed successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  }
}
