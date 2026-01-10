import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/Layouts/DashboardLayout';
import StatCard from '@/components/analytics/StatCard';
import LineChart from '@/components/analytics/LineChart';
import BarChart from '@/components/analytics/BarChart';
import PieChart from '@/components/analytics/PieChart';
import { analyticsApi } from '@/lib/api';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    CreditCard,
    Building2,
    UserCheck,
    Briefcase,
    FileText,
    Wallet
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsDashboard() {
    const { t } = useTranslation();
    const selectedYear = null;

    // Fetch dashboard analytics
    const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
        queryKey: ['analytics', 'dashboard', selectedYear],
        queryFn: () => analyticsApi.getDashboard(selectedYear).then(res => res.data),
    });

    // Fetch top performers
    const { data: topPerformersData, isLoading: isTopPerformersLoading } = useQuery({
        queryKey: ['analytics', 'top-performers'],
        queryFn: () => analyticsApi.getTopPerformers(5).then(res => res.data),
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount || 0).replace('BDT', '৳');
    };

    if (isDashboardLoading) {
        return (
            <DashboardLayout
                breadcrumbs={[
                    { type: 'link', text: t('app.home'), href: '/' },
                    { type: 'page', text: 'Analytics Dashboard' },
                ]}
            >
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { overview, financial, loans, trends } = dashboardData || {};

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'page', text: 'Analytics Dashboard' },
            ]}
        >
            <div className="space-y-6">
                {/* Overview Stats */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Income"
                            value={formatCurrency(overview?.total_income)}
                            icon={TrendingUp}
                            className="border-l-4 border-l-green-500"
                        />
                        <StatCard
                            title="Total Expense"
                            value={formatCurrency(overview?.total_expense)}
                            icon={TrendingDown}
                            className="border-l-4 border-l-red-500"
                        />
                        <StatCard
                            title="Net Balance"
                            value={formatCurrency(overview?.net_balance)}
                            icon={DollarSign}
                            className="border-l-4 border-l-blue-500"
                        />
                        <StatCard
                            title="Total Transactions"
                            value={overview?.total_transactions?.toLocaleString()}
                            icon={CreditCard}
                            className="border-l-4 border-l-purple-500"
                        />
                    </div>
                </div>

                {/* Pilgrims & Registrations */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Pilgrims & Registrations</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Pilgrims"
                            value={overview?.total_pilgrims?.toLocaleString()}
                            icon={Users}
                        />
                        <StatCard
                            title="Registrations"
                            value={overview?.total_registrations?.toLocaleString()}
                            icon={UserCheck}
                        />
                        <StatCard
                            title="Pre-Registrations"
                            value={overview?.total_pre_registrations?.toLocaleString()}
                            icon={FileText}
                        />
                        <StatCard
                            title="Umrah"
                            value={overview?.total_umrah?.toLocaleString()}
                            icon={Package}
                        />
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <PieChart
                        title="Financial Distribution by Section"
                        description="Balance breakdown across different sections"
                        data={financial?.section_breakdown?.map(item => ({
                            name: item.name,
                            value: Math.abs(item.value),
                        })) || []}
                        height={250}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Section Balances</CardTitle>
                            <CardDescription>Current balance in each section</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Banks</span>
                                </div>
                                <span className="font-medium">{formatCurrency(financial?.bank_balance)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Group Leaders</span>
                                </div>
                                <span className="font-medium">{formatCurrency(financial?.group_leader_balance)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Employees</span>
                                </div>
                                <span className="font-medium">{formatCurrency(financial?.employee_balance)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Bills</span>
                                </div>
                                <span className="font-medium">{formatCurrency(financial?.bill_balance)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Others</span>
                                </div>
                                <span className="font-medium">{formatCurrency(financial?.other_balance)}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between font-bold">
                                    <span>Total Balance</span>
                                    <span>{formatCurrency(financial?.total_balance)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Income vs Expense Trends */}
                <LineChart
                    title="Monthly Income vs Expense"
                    description="Financial trends over the year"
                    data={trends?.monthly || []}
                    xKey="month"
                    lines={[
                        { key: 'income', label: 'Income', color: '#10b981' },
                        { key: 'expense', label: 'Expense', color: '#ef4444' },
                        { key: 'net', label: 'Net', color: '#3b82f6' },
                    ]}
                    height={300}
                />

                {/* Loans Overview */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Loans Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lendings</CardTitle>
                                <CardDescription>Money lent to others</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <span className="font-medium">{formatCurrency(loans?.lendings?.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Paid</span>
                                    <span className="font-medium text-green-600">{formatCurrency(loans?.lendings?.total_paid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Due</span>
                                    <span className="font-medium text-red-600">{formatCurrency(loans?.lendings?.total_due)}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Pending</div>
                                            <div className="font-medium">{loans?.lendings?.by_status?.pending || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Partial</div>
                                            <div className="font-medium">{loans?.lendings?.by_status?.partial || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Paid</div>
                                            <div className="font-medium">{loans?.lendings?.by_status?.paid || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Borrowings</CardTitle>
                                <CardDescription>Money borrowed from others</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <span className="font-medium">{formatCurrency(loans?.borrowings?.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Paid</span>
                                    <span className="font-medium text-green-600">{formatCurrency(loans?.borrowings?.total_paid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Due</span>
                                    <span className="font-medium text-red-600">{formatCurrency(loans?.borrowings?.total_due)}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Pending</div>
                                            <div className="font-medium">{loans?.borrowings?.by_status?.pending || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Partial</div>
                                            <div className="font-medium">{loans?.borrowings?.by_status?.partial || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Paid</div>
                                            <div className="font-medium">{loans?.borrowings?.by_status?.paid || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Top Performers */}
                {!isTopPerformersLoading && topPerformersData && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Packages</CardTitle>
                                <CardDescription>Most popular packages by registrations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topPerformersData.top_packages?.map((pkg, index) => (
                                        <div key={pkg.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{pkg.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(pkg.price)} • {pkg.type}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {pkg.registrations} registrations
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Group Leaders</CardTitle>
                                <CardDescription>Leaders with most pilgrims</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topPerformersData.top_group_leaders?.map((leader, index) => (
                                        <div key={leader.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{leader.name}</div>
                                                    <div className="text-xs text-muted-foreground">{leader.phone}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {leader.pilgrims} pilgrims
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest 10 transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {trends?.recent_transactions?.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="flex-1">
                                        <div className="font-medium">{transaction.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {transaction.section} • {transaction.date}
                                        </div>
                                    </div>
                                    <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
