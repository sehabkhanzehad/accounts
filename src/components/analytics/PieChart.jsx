import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function PieChart({ data, title, description, height = 300 }) {
    const total = useMemo(() => {
        return data.reduce((sum, item) => sum + (item.value || 0), 0);
    }, [data]);

    const segments = useMemo(() => {
        return data.reduce((acc, item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const startAngle = acc.currentAngle;
            const endAngle = startAngle + angle;

            // Calculate path for donut segment
            const radius = 40;
            const innerRadius = 25;
            const centerX = 50;
            const centerY = 50;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            const x3 = centerX + innerRadius * Math.cos(endRad);
            const y3 = centerY + innerRadius * Math.sin(endRad);
            const x4 = centerX + innerRadius * Math.cos(startRad);
            const y4 = centerY + innerRadius * Math.sin(startRad);

            const largeArc = angle > 180 ? 1 : 0;

            const path = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                'Z'
            ].join(' ');

            acc.segments.push({
                ...item,
                path,
                percentage,
                startAngle,
                endAngle,
            });

            acc.currentAngle = endAngle;
            return acc;
        }, { segments: [], currentAngle: -90 }).segments;
    }, [data, total]);

    const colors = [
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Pie Chart */}
                    <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {segments.map((segment, index) => (
                                <g key={index}>
                                    <path
                                        d={segment.path}
                                        fill={colors[index % colors.length]}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    >
                                        <title>{`${segment.name}: ${segment.value.toLocaleString()} (${segment.percentage.toFixed(1)}%)`}</title>
                                    </path>
                                </g>
                            ))}
                            {/* Center text */}
                            <text
                                x="50"
                                y="50"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-2xl font-bold fill-current"
                            >
                                {total.toLocaleString()}
                            </text>
                        </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-sm">{segment.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {segment.value.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ({segment.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
