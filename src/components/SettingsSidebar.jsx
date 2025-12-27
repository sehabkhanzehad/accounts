import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, Lock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsNavItems = [
    {
        title: 'accountSettings',
        href: '/dashboard/settings/account',
        icon: User,
    },
    {
        title: 'passwordSettings',
        href: '/dashboard/settings/password',
        icon: Lock,
    },
    {
        title: 'yearsManagement',
        href: '/dashboard/settings/years',
        icon: Calendar,
    },
]

export function SettingsSidebar() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-muted">
            <div className="flex h-16 items-center border-b border-border px-6">
                <h2 className="text-lg font-semibold text-foreground">{t('app.settings')}</h2>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {settingsNavItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-card text-card-foreground shadow-sm border border-border'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {t(`app.${item.title}`)}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}