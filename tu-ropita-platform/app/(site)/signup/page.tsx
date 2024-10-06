'use client'

import { publicUsersApiWrapper } from "@/api-wrappers/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateUserDto } from "@/lib/backend/dtos/user.dto.interface"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const repeatPassword = formData.get('repeatPassword') as string

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setError(null)
    const userData: CreateUserDto = {
      full_name: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: password,
    }

    const result = await publicUsersApiWrapper.signUp(userData)
    if (!result) {
      setError('Error al crear el usuario. Por favor, inténtalo de nuevo.')
    } else {
        window.location.href = '/admin-shop';
    }
  }

  return (
    <>
                                                                    {/* TODO: ver como centrarlo en la pagina sin un mt */}
      <Card className="w-full max-w-md shadow-lg m-4 mx-auto justify-center items-center mt-28">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>Crea tu cuenta para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                required 
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="repeatPassword">Repetir Contraseña</Label>
              <Input 
                id="repeatPassword" 
                name="repeatPassword" 
                type="password" 
                required 
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full">Registrarse</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta? <a href="/signin" className="text-primary hover:underline">Inicia sesión</a>
          </p>
        </CardFooter>
      </Card>
    </>
  )
}