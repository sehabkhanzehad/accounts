import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function BarChart({ data, title, description, xKey, yKey, height = 300 }) {
    const maxValue = useMemo(() => {
        return Math.max(...data.map(item => item[yKey] || 0));
    }, [data, yKey]);

    const getBarHeight = (value) => {
        if (maxValue === 0) return 0;
        return (value / maxValue) * 100;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                                <div
                                    className="w-full bg-primary rounded-t-md hover:bg-primary/80 transition-all cursor-pointer relative group"
                                    style={{ height: `${getBarHeight(item[yKey])}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {item[yKey]?.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground text-center">
                                {item[xKey]}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
