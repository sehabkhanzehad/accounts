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
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
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
            return response.data.data ? response.data.data.attributes : response.data.attributes
        },
    })

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName || '')
            setLastName(userData.lastName || '')
            setEmail(userData.email)
            setAvatar(userData.avatar)
        }
    }, [userData])

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) =>
            await api.post('/user/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
        onSuccess: async () => {
            try {
                // Refetch user data to get the latest and update localStorage
                const response = await api.get('/user')
                const updatedUser = response.data.data ? response.data.data.attributes : response.data.attributes
                // Construct name from firstName and lastName to match sign-in structure
                updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName || ''}`.trim()
                // Match sign-in structure: {type: "user", id, attributes}
                const fullUser = {
                    type: "user",
                    id: updatedUser.id || user.id, // Use from updated or current user
                    attributes: updatedUser
                }
                localStorage.setItem('user', JSON.stringify(fullUser))
                // Dispatch custom event to update context in same tab
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
        const formData = new FormData()

        // Validate form with Zod
        const payload = { firstName, lastName, email }
        const result = accountSchema.safeParse(payload)

        if (!result.success) {
            // Use Zod's flatten() helper to reliably get field errors as a map
            const flattened = result.error.flatten()
            const fieldErrors = {}

            // flattened.fieldErrors is Record<string, string[]>
            Object.entries(flattened.fieldErrors).forEach(([key, arr]) => {
                if (arr && arr.length > 0) fieldErrors[key] = arr.join(', ')
            })

            // Also capture form-level (non-field) errors if any
            if (flattened.formErrors && flattened.formErrors.length) {
                fieldErrors._form = flattened.formErrors.join(', ')
            }

            setErrors(fieldErrors)
            return
        }

        setErrors({})

        if (avatar === null) {
            formData.append('avatar', '')
        } else if (avatar && avatar instanceof File) {
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

        formData.append('first_name', firstName)
        formData.append('last_name', lastName || '')
        formData.append('email', result.data.email)

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
                    <div className="text-red-500">
                        Error loading user data: {error.message}
                    </div>
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
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-4 animate-pulse">
                            <div className="h-20 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
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
                    <form action="" className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <div>
                                    <ImageUpload
                                        value={userData?.avatar}
                                        onChange={(file) => setAvatar(file)}
                                        onRemove={() => setAvatar(null)}
                                    />
                                    {errors.avatar && <p className="mt-1 text-xs text-red-600">{errors.avatar}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">{t('app.firstName')}</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">{t('app.lastName')}</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <div>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? t('app.saving') : t('app.save')}
                                </Button>
                            </div>
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