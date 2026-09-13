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
      {/* Textura de marca: patitas repetidas, muy tenues — funciona igual en claro y oscuro porque el tono es fijo y bajito de opacidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D6316F' fill-opacity='0.07'%3E%3Cellipse cx='32' cy='42' rx='11' ry='9'/%3E%3Cellipse cx='18' cy='24' rx='5' ry='6.5' transform='rotate(-15 18 24)'/%3E%3Cellipse cx='29' cy='18' rx='5' ry='6.5'/%3E%3Cellipse cx='41' cy='18' rx='5' ry='6.5'/%3E%3Cellipse cx='50' cy='26' rx='5' ry='6.5' transform='rotate(15 50 26)'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "64px 64px",
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
