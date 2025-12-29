import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'

const schema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        path: ['password_confirmation'],
        message: 'Passwords do not match',
    })

export default function PasswordSettings() {
    const { t } = useTranslation()
    const [error, setError] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) => await api.post('/user/change-password', data),
        onSuccess: () => {
            setError('')
            reset()
            toast.success(t('app.passwordUpdated'))
        },
        onError: (error) => {
            setError(error?.response?.data?.message || 'An error occurred.')
        },
    })

    const onSubmit = (data) => {
        mutate(data)
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('app.password')}</CardTitle>
                <CardDescription>{t('app.updatePassword')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">
                                {t('app.currentPassword')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showCurrent ? 'text' : 'password'}
                                    {...register('current_password')}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                >
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.current_password && (
                                <p className="text-sm text-destructive">{errors.current_password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t('app.newPassword')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showNew ? 'text' : 'password'}
                                    {...register('password')}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                    onClick={() => setShowNew(!showNew)}
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                {t('app.confirmNewPassword')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    {...register('password_confirmation')}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? t('app.updatingPassword') : t('app.updatePasswordButton')}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}