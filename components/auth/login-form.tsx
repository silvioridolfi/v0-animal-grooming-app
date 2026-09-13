"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { iniciarSesion, crearCuenta } from "@/lib/actions/auth"

export function LoginForm() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("login")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirm, setSignupConfirm] = useState("")
  const [codigoInvitacion, setCodigoInvitacion] = useState("")
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccessMsg, setSignupSuccessMsg] = useState<string | null>(null)
  const [signupLoading, setSignupLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const result = await iniciarSesion(loginEmail, loginPassword)
      if (result.error) {
        setLoginError(result.error)
        return
      }
      router.push("/")
      router.refresh()
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError(null)
    setSignupSuccessMsg(null)

    if (signupPassword !== signupConfirm) {
      setSignupError("Las contraseñas no coinciden.")
      return
    }

    setSignupLoading(true)
    try {
      const result = await crearCuenta(signupEmail, signupPassword, codigoInvitacion)
      if (result.error) {
        setSignupError(result.error)
        return
      }
      if (result.requiereConfirmacion) {
        setSignupSuccessMsg("Cuenta creada. Revisá tu email para confirmarla antes de iniciar sesión.")
        return
      }
      router.push("/")
      router.refresh()
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Textura de marca: la patita del logo (4 dedos ovalados + almohadilla
          corazón) repetida en rombo — cada fila va corrida medio ancho de
          tile respecto a la anterior, en vez de quedar todas alineadas en
          cuadrícula recta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Csymbol id='paw' viewBox='0 0 40 48'%3E%3Cellipse cx='14' cy='11' rx='5' ry='6.5' transform='rotate(-10 14 11)'/%3E%3Cellipse cx='26' cy='11' rx='5' ry='6.5' transform='rotate(10 26 11)'/%3E%3Cellipse cx='6' cy='18' rx='4' ry='5.5' transform='rotate(-30 6 18)'/%3E%3Cellipse cx='34' cy='18' rx='4' ry='5.5' transform='rotate(30 34 18)'/%3E%3Cpath d='M20,28.4 C20,22 8,22 8,28.4 C8,36.4 20,40.4 20,46.8 C20,40.4 32,36.4 32,28.4 C32,22 20,22 20,28.4 Z'/%3E%3C/symbol%3E%3C/defs%3E%3Cg fill='%23D6316F' fill-opacity='0.09'%3E%3Cuse href='%23paw' x='30' y='2' width='40' height='48'/%3E%3Cuse href='%23paw' x='-20' y='50' width='40' height='48'/%3E%3Cuse href='%23paw' x='80' y='50' width='40' height='48'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Manchas de color que flotan despacio — pura ambientación */}
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-primary/15 blur-3xl animate-drift-a pointer-events-none" />
      <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-drift-b pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-secondary/40 blur-3xl animate-drift-c pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Image src="/patita.png" alt="Logo" width={48} height={48} className="h-12 w-12" />
          <h1 className="text-xl font-heading font-semibold text-foreground text-center">
            Andrea | Peluquería Canina
          </h1>
        </div>

        <Card>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-4">
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                {signupSuccessMsg ? (
                  <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      {signupSuccessMsg}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar contraseña</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-invite">Código de invitación</Label>
                      <Input
                        id="signup-invite"
                        type="text"
                        required
                        value={codigoInvitacion}
                        onChange={(e) => setCodigoInvitacion(e.target.value)}
                      />
                    </div>

                    {signupError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{signupError}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={signupLoading}>
                      {signupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
