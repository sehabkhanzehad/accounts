import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/Layouts/AuthLayout/AuthLayout";

// Zod validation schema
const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().default(false),
});

export default function Home() {
    usePageTitle(t('app.signIn'));
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation();

    // TanStack Query mutation for sign in
    const mutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/auth/sign-in", data);
            return response.data;
        },
        onSuccess: (response) => {
            console.log('Sign in success:', response);
            const { accessToken, user } = response.data;
            login(accessToken, user, formData.remember);
            toast.success(response.message || t('app.signInSuccess'));
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error('Sign in error:', error);
            const message = error?.response?.data?.message || t('app.signInFailed');
            toast.error(message);
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear field error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        // Zod validation
        const result = signInSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            // Safely handle Zod errors
            if (result.error?.issues) {
                result.error.issues.forEach(issue => {
                    const fieldName = issue.path[0];
                    if (fieldName) {
                        fieldErrors[fieldName] = issue.message;
                    }
                });
            }
            setErrors(fieldErrors);
            return;
        }

        // Submit with TanStack Query
        mutation.mutate(result.data);
    };

    return (
        <AuthLayout>
            <Card className="w-full border-border/50 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('app.signIn')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('app.welcome')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('app.email')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@rajtravels.com"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-destructive text-sm">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('app.password')}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-destructive text-sm">{errors.password}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={formData.remember}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, remember: checked }))
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm font-normal cursor-pointer"
                            >
                                {t('app.rememberMe')}
                            </Label>
                        </div>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full cursor-pointer"
                            size="lg"
                        >
                            {mutation.isPending ? t('app.signingIn') : t('app.signIn')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
