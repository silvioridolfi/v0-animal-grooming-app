import { getResumenFinanciero } from "@/lib/actions/finanzas"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0]

  const resumen = await getResumenFinanciero(fecha)
  return NextResponse.json(resumen)
}
