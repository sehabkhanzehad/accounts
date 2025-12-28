import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, description, trend, icon: Icon, className }) {
    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend > 0) {
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        } else if (trend < 0) {
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        }
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        return trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';
    };

    return (
        <Card className={cn("hover:shadow-lg transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {getTrendIcon()}
                        <span className={getTrendColor()}>
                            {trend && `${trend > 0 ? '+' : ''}${trend}%`}
                        </span>
                        <span>{description}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
