import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { ImageUpload } from "@/components/ui/image-upload"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { z } from 'zod'

const accountSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
})

export default function AccountSettings() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { data: userData, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await api.get('/user')
            return response.data.data.attributes;
        },
    })

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (userData) {
            setName(userData.name)
            setEmail(userData.email)
            setAvatar(userData.avatar)
        }
    }, [userData])

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) =>
            await api.post('/user/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: async () => {
            try {
                const response = await api.get('/user')
                const updatedUser = response.data.data?.attributes || response.data.attributes

                const fullUser = {
                    type: "user",
                    id: updatedUser.id || user.id,
                    attributes: updatedUser
                }

                localStorage.setItem('user', JSON.stringify(fullUser))
                window.dispatchEvent(new CustomEvent('userUpdated', { detail: fullUser }))
                queryClient.setQueryData(['user'], updatedUser)
                toast.success('Account updated!')
            } catch (e) {
                console.error('Error refetching user:', e)
                toast.error('Account updated, but failed to refresh data.')
            }
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update account.')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        const result = accountSchema.safeParse({ name, email })

        if (!result.success) {
            const flattened = result.error.flatten()
            const fieldErrors = {}

            Object.entries(flattened.fieldErrors).forEach(([key, arr]) => {
                if (arr?.length) fieldErrors[key] = arr.join(', ')
            })

            if (flattened.formErrors?.length) {
                fieldErrors._form = flattened.formErrors.join(', ')
            }

            setErrors(fieldErrors)
            return
        }

        setErrors({})

        const formData = new FormData()
        formData.append('name', result.data.name)
        formData.append('email', result.data.email)

        if (avatar === null) {
            formData.append('avatar', '')
        } else if (avatar instanceof File) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
            const maxSize = 2 * 1024 * 1024 // 2MB

            if (!allowedTypes.includes(avatar.type)) {
                setErrors({ avatar: 'Avatar must be a JPG or PNG image.' })
                return
            }

            if (avatar.size > maxSize) {
                setErrors({ avatar: 'Avatar must be less than 2MB.' })
                return
            }

            formData.append('avatar', avatar)
        }

        mutate(formData)
    }

    if (error) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('app.profile')}</CardTitle>
                    <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">Error loading user data: {error.message}</div>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('app.profile')}</CardTitle>
                    <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-w-md animate-pulse">
                        <div className="h-20 bg-gray-300 rounded"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                        <div className="h-10 bg-gray-300 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('app.profile')}</CardTitle>
                    <CardDescription>{t('app.updateAccountInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <ImageUpload
                                    value={userData?.avatar}
                                    onChange={setAvatar}
                                    onRemove={() => setAvatar(null)}
                                />
                                {errors.avatar && <p className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="name">{t('app.name')}</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <Button type="submit" disabled={isPending}>
                                {isPending ? t('app.saving') : t('app.save')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.language')}</CardTitle>
                    <CardDescription>{t('app.selectLanguage')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Label>{t('app.language')}:</Label>
                        <LanguageToggle />
                    </div>
                </CardContent>
            </Card>
        </>
    )
}