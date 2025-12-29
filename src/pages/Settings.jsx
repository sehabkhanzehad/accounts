import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"
import AccountSettings from "./Settings/Account"
import PasswordSettings from "./Settings/Password"
import YearsSettings from "./Settings/Years"
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { User, Lock, Calendar, Palette } from 'lucide-react'

export default function Settings() {
    const { t } = useTranslation();

    const settingsNavItems = [
        {
            title: t('app.profile'),
            url: '/settings/profile',
            icon: User,
        },
        {
            title: t('app.password'),
            url: '/settings/password',
            icon: Lock,
        },
        {
            title: t('app.yearsManagement'),
            url: '/settings/years',
            icon: Calendar,
        },
        {
            title: t('app.appearance'),
            url: '/settings/appearance',
            icon: Palette,
        },
    ];

    return (
        <DashboardLayout
            breadcrumbs={[
                {
                    type: 'link',
                    text: t('app.dashboard'),
                    href: '/dashboard',
                },
                {
                    type: 'page',
                    text: t('app.settings'),
                },
            ]}
        >
            <div className="flex flex-1 overflow-hidden gap-4">
                {/* Settings Left Sidebar */}
                <aside className="w-64 shrink-0">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>{t('app.settings')}</CardTitle>
                            <CardDescription>{t('app.manageSettings')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2">
                            <nav className="space-y-1">
                                {settingsNavItems.map((item) => (
                                    <NavLink
                                        key={item.url}
                                        to={item.url}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-secondary text-secondary-foreground'
                                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </NavLink>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Settings Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route index element={<Navigate to="/settings/profile" replace />} />
                        <Route path="profile" element={<AccountSettings />} />
                        <Route path="password" element={<PasswordSettings />} />
                        <Route path="years" element={<YearsSettings />} />
                        <Route path="appearance" element={
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>{t('app.appearance')}</CardTitle>
                                    <CardDescription>{t('app.customizeAppearance')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">{t('app.theme')}</h3>
                                        <div className="flex items-center gap-2">
                                            <ThemeToggle />
                                            <span className="text-sm text-muted-foreground">{t('app.toggleTheme')}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">{t('app.language')}</h3>
                                        <div className="flex items-center gap-2">
                                            <LanguageToggle />
                                            <span className="text-sm text-muted-foreground">{t('app.selectLanguage')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        } />
                    </Routes>
                </main>
            </div>
        </DashboardLayout>
    )
}