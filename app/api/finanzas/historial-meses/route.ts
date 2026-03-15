import { getResumenMultiMes } from "@/lib/actions/finanzas"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get("fecha") || new Date().toISOString().substring(0, 7)
  const data = await getResumenMultiMes(fecha, 6)
  return NextResponse.json(data)
}