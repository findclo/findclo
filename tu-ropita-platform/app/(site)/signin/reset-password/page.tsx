'use client';

import { publicUsersApiWrapper } from '@/api-wrappers/users';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            await publicUsersApiWrapper.requestPasswordReset(email);
            setMessage("Revisa tu correo electrónico para restablecer tu contraseña.");
        } catch (err: any) {
            if (err.message.includes('404')) {
                setError('Usuario no encontrado');
            } else {
                setError('Ocurrió un error al solicitar el restablecimiento de contraseña. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            if (!token) {
                throw new Error('Token de restablecimiento faltante');
            }
            await publicUsersApiWrapper.resetPassword(token, newPassword);
            setMessage("Contraseña restablecida correctamente");
            setTimeout(() => {
                router.push('/signin');
            }, 3000);
        } catch (err) {
            setError('Ocurrió un error al restablecer la contraseña. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>{token ? 'Establecer Nueva Contraseña' : 'Restablecer Contraseña'}</CardTitle>
                    <CardDescription>
                        {token ? 'Ingrese su nueva contraseña a continuación.' : 'Ingrese su correo electrónico para solicitar un restablecimiento de contraseña.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {token ? (
                        <form onSubmit={handleResetPassword}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col">
                                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        className='mt-2'
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        className='mt-2'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <CardFooter className="flex justify-center mt-4">
                                <Button type="submit">Restablecer Contraseña</Button>
                            </CardFooter>
                        </form>
                    ) : (
                        <form onSubmit={handleRequestReset}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        className='mt-2'
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <CardFooter className="flex justify-center mt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Enviando..." : "Solicitar Restablecimiento"}
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </CardContent>
            </Card>
            {message && (
                <Alert className="mt-4">
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
