import { getEgresos } from "@/lib/actions/egresos"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mes = searchParams.get("mes") || undefined

  const egresos = await getEgresos(mes)
  return NextResponse.json(egresos)
}
