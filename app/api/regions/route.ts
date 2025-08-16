import { NextResponse } from "next/server"

export const runtime = "edge"

// List of all Vercel Edge regions
const VERCEL_REGIONS = [
  { code: "iad1", name: "Washington, D.C., USA", continent: "North America" },
  { code: "sfo1", name: "San Francisco, USA", continent: "North America" },
  { code: "pdx1", name: "Portland, USA", continent: "North America" },
  { code: "yul1", name: "Montreal, Canada", continent: "North America" },
  { code: "lhr1", name: "London, UK", continent: "Europe" },
  { code: "fra1", name: "Frankfurt, Germany", continent: "Europe" },
  { code: "ams1", name: "Amsterdam, Netherlands", continent: "Europe" },
  { code: "cdg1", name: "Paris, France", continent: "Europe" },
  { code: "dub1", name: "Dublin, Ireland", continent: "Europe" },
  { code: "arn1", name: "Stockholm, Sweden", continent: "Europe" },
  { code: "nrt1", name: "Tokyo, Japan", continent: "Asia" },
  { code: "icn1", name: "Seoul, South Korea", continent: "Asia" },
  { code: "sin1", name: "Singapore", continent: "Asia" },
  { code: "hkg1", name: "Hong Kong", continent: "Asia" },
  { code: "bom1", name: "Mumbai, India", continent: "Asia" },
  { code: "syd1", name: "Sydney, Australia", continent: "Oceania" },
  { code: "gru1", name: "São Paulo, Brazil", continent: "South America" },
  { code: "cpt1", name: "Cape Town, South Africa", continent: "Africa" },
]

export async function GET() {
  return NextResponse.json({
    regions: VERCEL_REGIONS,
    total: VERCEL_REGIONS.length,
    continents: [...new Set(VERCEL_REGIONS.map((r) => r.continent))],
    timestamp: new Date().toISOString(),
  })
}
