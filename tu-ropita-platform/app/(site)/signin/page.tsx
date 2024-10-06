'use client'

import { publicUsersApiWrapper } from "@/api-wrappers/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SigninPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setError(null)
    const user = await publicUsersApiWrapper.signIn(email, password)
    if (!user) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.')
    } else {
        window.location.href = '/'
        // if (user.user_type === UserTypeEnum.BRAND_OWNER) {
        //     window.location.href = '/admin-shop/start'
        // } else {
        //     window.location.href = '/admin'
        // }
    }
  }

  return (
    <>
                                                                    {/* TODO: ver como centrarlo en la pagina sin un mt */}
      <Card className="w-full max-w-md shadow-lg m-4 mx-auto justify-center items-center mt-40">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta? <a href="/signup" className="text-primary hover:underline">Regístrate</a>
          </p>
        </CardFooter>
      </Card>
    </>
  )
}
