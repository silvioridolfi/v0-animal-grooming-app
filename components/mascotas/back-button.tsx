"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()
  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      <ArrowLeft className="mr-1 h-4 w-4" />
      Volver
    </Button>
  )
}