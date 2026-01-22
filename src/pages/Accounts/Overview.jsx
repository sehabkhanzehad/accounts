import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, BarChart3, PieChart, Target, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine } from 'recharts'
import { useState, useEffect } from 'react'

export default function Overview() {
    const { t } = useI18n()
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'))
        }

        checkDarkMode()

        const observer = new MutationObserver(checkDarkMode)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    const chartColors = {
        axisLabel: isDarkMode ? '#e5e7eb' : '#111827',
        tickLabel: isDarkMode ? '#9ca3af' : '#374151',
        legendText: isDarkMode ? '#e5e7eb' : '#111827',
        tooltipText: isDarkMode ? '#f9fafb' : '#111827',
        gridLine: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        tooltipBg: isDarkMode ? 'hsl(var(--popover))' : 'hsl(var(--popover))',
        tooltipBorder: isDarkMode ? 'hsl(var(--border))' : 'hsl(var(--border))'
    }

    const { data, isLoading } = useQuery({
        queryKey: ['accounts-overview'],
        queryFn: async () => {
            const response = await api.get('/accounts/overview')
            return response.data
        }
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Title Skeleton */}
                    <Skeleton className="h-9 w-48" />

                    {/* Metrics Grid Skeleton */}
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="bg-card border border-border rounded-lg p-6">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-3.5 w-3.5 rounded" />
                                    </div>
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full max-w-md" />

                        {/* Trends Tab Content Skeleton */}
                        <div className="grid gap-2 md:grid-cols-2">
                            <Card className="p-6">
                                <Skeleton className="h-6 w-48 mb-4" />
                                <Skeleton className="h-80 w-full" />
                            </Card>
                            <Card className="p-6">
                                <Skeleton className="h-6 w-48 mb-4" />
                                <Skeleton className="h-80 w-full" />
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const overview = data || {}

    const metrics = [
        {
            title: t({ en: "Total Income", bn: "মোট আয়" }),
            value: `৳${overview.total_income || 0}`,
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            accentColor: 'border-l-green-500/30'
        },
        {
            title: t({ en: "Total Expense", bn: "মোট ব্যয়" }),
            value: `৳${overview.total_expense || 0}`,
            icon: TrendingDown,
            color: 'text-red-600 dark:text-red-400',
            accentColor: 'border-l-red-500/30'
        },
        {
            title: t({ en: "Current Balance", bn: "বর্তমান ব্যালেন্স" }),
            value: `৳${overview.current_balance || 0}`,
            icon: DollarSign,
            color: 'text-purple-600 dark:text-purple-400',
            accentColor: 'border-l-purple-500/30'
        },
        {
            title: t({ en: "Net Profit/Loss", bn: "নেট লাভ/ক্ষতি" }),
            value: `৳${overview.profit_loss || 0}`,
            icon: overview.profit_loss >= 0 ? TrendingUp : TrendingDown,
            color: overview.profit_loss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            accentColor: overview.profit_loss >= 0 ? 'border-l-green-500/30' : 'border-l-red-500/30'
        },
        {
            title: t({ en: "Today's Transactions", bn: "আজকের লেনদেন" }),
            value: overview.today_transactions_count || 0,
            icon: Zap,
            color: 'text-yellow-600 dark:text-yellow-400',
            accentColor: 'border-l-yellow-500/30'
        },
        {
            title: t({ en: "Last 7 Days Transactions", bn: "গত ৭ দিনের লেনদেন" }),
            value: overview.last_7_days_count || 0,
            icon: Calendar,
            color: 'text-indigo-600 dark:text-indigo-400',
            accentColor: 'border-l-indigo-500/30'
        },
        {
            title: t({ en: "Total Transactions", bn: "মোট লেনদেন" }),
            value: overview.total_transactions || 0,
            icon: Activity,
            color: 'text-blue-600 dark:text-blue-400',
            accentColor: 'border-l-blue-500/30'
        },

        {
            title: t({ en: "Avg Transaction Amount", bn: "গড় লেনদেন পরিমাণ" }),
            value: `৳${overview.average_transaction_amount || 0}`,
            icon: Target,
            color: 'text-orange-600 dark:text-orange-400',
            accentColor: 'border-l-orange-500/30'
        },
    ]

    const pieData = [
        { name: 'Expense', value: parseFloat(overview.total_expense) || 0 }, // Expense first (higher value)
        { name: 'Income', value: parseFloat(overview.total_income) || 0 }    // Income second
    ]

    const PIE_COLORS = ['#ef4444', '#22c55e'] // Red for expense, Green for income

    const breadcrumbs = [
        { type: 'link', text: t({ en: 'Dashboard', bn: 'ড্যাশবোর্ড' }), href: '/dashboard' },
        { type: 'separator' },
        { type: 'link', text: t({ en: 'Transactions', bn: 'লেনদেন' }), href: '/transactions/overview' },
        { type: 'separator' },
        { type: 'page', text: t({ en: 'Overview', bn: 'সারাংশ' }) },
    ]

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{t({ en: "Overview", bn: "সারাংশ" })}</h1>
                </div>

                {/* Main Metrics Grid */}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric, index) => (
                        <Card key={index} className="bg-card border border-border rounded-lg hover:bg-accent/30 p-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{metric.title}</span>
                                    <metric.icon className={`h-3.5 w-3.5 ${metric.color} opacity-70`} />
                                </div>
                                <div className={`text-2xl font-semibold ${metric.color} opacity-90`}>{metric.value}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <Tabs defaultValue="trends" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="trends">{t({ en: "Monthly Trends", bn: "মাসিক প্রবণতা" })}</TabsTrigger>
                        <TabsTrigger value="distribution">{t({ en: "Income vs Expense", bn: "আয় বনাম ব্যয়" })}</TabsTrigger>
                        <TabsTrigger value="sections">{t({ en: "Top Sections", bn: "শীর্ষ বিভাগ" })}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="trends" className="space-y-4">
                        <div className="grid gap-2 md:grid-cols-2">
                            <Card className="hover:shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BarChart3 className="h-5 w-5" />
                                        {t({ en: "Monthly Income vs Expense", bn: "মাসিক আয় বনাম ব্যয়" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={overview.monthly_trends || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke={chartColors.gridLine}
                                            />
                                            <XAxis
                                                dataKey="month"
                                                fontSize={12}
                                                tick={{ fill: chartColors.tickLabel }}
                                                axisLine={{ stroke: chartColors.axisLabel }}
                                            />
                                            <YAxis
                                                fontSize={12}
                                                tick={{ fill: chartColors.tickLabel }}
                                                axisLine={{ stroke: chartColors.axisLabel }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: chartColors.tooltipBg,
                                                    border: `1px solid ${chartColors.tooltipBorder}`,
                                                    borderRadius: '8px',
                                                    color: chartColors.tooltipText,
                                                    boxShadow: 'hsl(var(--shadow) / 0.1) 0px 4px 6px -1px'
                                                }}
                                                labelStyle={{ color: chartColors.tooltipText }}
                                                formatter={(value, name) => [
                                                    `৳${value}`,
                                                    name === 'Income' ? 'Income' : 'Expense'
                                                ]}
                                                cursor={false}
                                            />
                                            <Legend
                                                wrapperStyle={{ color: chartColors.legendText }}
                                            />
                                            <Bar
                                                dataKey="income"
                                                fill="#22c55e"
                                                name="Income"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="expense"
                                                fill="#ef4444"
                                                name="Expense"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">{t({ en: "Net Profit/Loss Trend", bn: "নেট লাভ/ক্ষতি প্রবণতা" })}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={overview.monthly_trends || []} margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridLine} />
                                            <XAxis
                                                dataKey="month"
                                                stroke={chartColors.axisLabel}
                                                fontSize={12}
                                                tick={{ fill: chartColors.tickLabel }}
                                            />
                                            <YAxis
                                                stroke={chartColors.axisLabel}
                                                fontSize={12}
                                                tick={{ fill: chartColors.tickLabel }}
                                                tickFormatter={(value) => `৳${value}`}
                                                width={60}
                                            />
                                            <ReferenceLine y={0} stroke={chartColors.axisLabel} strokeDasharray="5 5" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: chartColors.tooltipBg,
                                                    border: `1px solid ${chartColors.tooltipBorder}`,
                                                    borderRadius: '8px',
                                                    color: chartColors.tooltipText,
                                                    boxShadow: 'hsl(var(--shadow) / 0.1) 0px 4px 6px -1px'
                                                }}
                                                labelStyle={{ color: chartColors.tooltipText }}
                                                formatter={(value) => [
                                                    `৳${value}`,
                                                    value >= 0 ? 'Profit' : 'Loss'
                                                ]}
                                                cursor={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="net"
                                                stroke={chartColors.axisLabel}
                                                strokeWidth={2}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    const isProfit = payload.net >= 0;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={4}
                                                            fill={isProfit ? '#22c55e' : '#ef4444'}
                                                            stroke={isProfit ? '#22c55e' : '#ef4444'}
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }}
                                                activeDot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    const isProfit = payload.net >= 0;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={6}
                                                            fill={isProfit ? '#22c55e' : '#ef4444'}
                                                            stroke={isProfit ? '#22c55e' : '#ef4444'}
                                                            strokeWidth={2}
                                                        />
                                                    );
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="space-y-4">
                        <div className="grid gap-2 md:grid-cols-2">
                            <Card className="hover:shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <PieChart className="h-5 w-5" />
                                        {t({ en: "Transaction Distribution", bn: "লেনদেন বিতরণ" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pieData.every(item => item.value === 0) ? (
                                        <div className="flex items-center justify-center h-87.5 text-muted-foreground">
                                            <div className="text-center">
                                                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">{t({ en: "No transaction data available", bn: "কোনো লেনদেনের তথ্য নেই" })}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={400}>
                                            <RechartsPieChart
                                                style={{
                                                    fontFamily: 'inherit',
                                                    '--recharts-text-color': isDarkMode ? '#e5e7eb' : '#111827'
                                                }}
                                                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                                            >
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="45%"
                                                    labelLine={false}
                                                    label={({ name, value }) => {
                                                        const total = pieData.reduce((sum, item) => sum + item.value, 0)
                                                        if (total === 0) return ''
                                                        const percent = (value / total) * 100
                                                        return `${name} ${percent.toFixed(0)}%`
                                                    }}
                                                    outerRadius={window.innerWidth < 640 ? 70 : 100}
                                                    innerRadius={0}
                                                    dataKey="value"
                                                    stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                                                    strokeWidth={1}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                                                            strokeWidth={1}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                                                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                                                        borderRadius: '8px',
                                                        color: isDarkMode ? '#f9fafb' : '#111827',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        padding: '12px 16px'
                                                    }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0];
                                                            const value = data.value;
                                                            const name = data.name;
                                                            const total = pieData.reduce((sum, item) => sum + item.value, 0);
                                                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                                                            return (
                                                                <div style={{ lineHeight: '1.5' }}>
                                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{name}</div>
                                                                    {total > 0 && <div>{percent}% of total</div>}
                                                                    <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>৳{value.toLocaleString()}</div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                    cursor={false}
                                                />
                                                <Legend
                                                    wrapperStyle={{
                                                        color: isDarkMode ? '#e5e7eb' : '#111827',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        paddingTop: '20px'
                                                    }}
                                                    iconType="circle"
                                                    formatter={(value, entry) => (
                                                        <span style={{
                                                            color: isDarkMode ? '#e5e7eb' : '#111827',
                                                            fontSize: '14px'
                                                        }}>
                                                            {value}
                                                        </span>
                                                    )}
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-card border border-border rounded-lg hover:bg-accent/30">
                                <CardHeader className="p-6 pb-4">
                                    <CardTitle className="text-sm text-muted-foreground">{t({ en: "Quick Stats", bn: "দ্রুত পরিসংখ্যান" })}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                                        <span className="text-sm text-muted-foreground">{t({ en: "Income Transactions", bn: "আয় লেনদেন" })}</span>
                                        <span className="text-lg font-semibold text-foreground">{overview.income_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                                        <span className="text-sm text-muted-foreground">{t({ en: "Expense Transactions", bn: "ব্যয় লেনদেন" })}</span>
                                        <span className="text-lg font-semibold text-foreground">{overview.expense_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                                        <span className="text-sm text-muted-foreground">{t({ en: "Income %", bn: "আয় %" })}</span>
                                        <span className="text-lg font-semibold text-foreground">{overview.income_percentage || 0}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-muted/50 border border-border rounded-lg">
                                        <span className="text-sm text-muted-foreground">{t({ en: "Expense %", bn: "ব্যয় %" })}</span>
                                        <span className="text-lg font-semibold text-foreground">{overview.expense_percentage || 0}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="sections" className="space-y-4">
                        <Card className="hover:shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">{t({ en: "Top Sections", bn: "শীর্ষ বিভাগ" })}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {overview.top_sections?.map((section, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <span className="font-medium text-foreground">{section.section}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-foreground">{section.count}</div>
                                                <div className="text-sm text-muted-foreground">{t({ en: "transactions", bn: "লেনদেন" })}</div>
                                            </div>
                                        </div>
                                    )) || (
                                            <div className="text-center py-12">
                                                <p className="text-muted-foreground">{t({ en: "No data available", bn: "কোন তথ্য উপলব্ধ নেই" })}</p>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}