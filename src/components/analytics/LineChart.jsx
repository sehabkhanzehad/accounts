import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function LineChart({ data, title, description, xKey, lines, height = 300 }) {
    const { maxValue, minValue } = useMemo(() => {
        const allValues = data.flatMap(item =>
            lines.map(line => item[line.key] || 0)
        );
        return {
            maxValue: Math.max(...allValues, 0),
            minValue: Math.min(...allValues, 0),
        };
    }, [data, lines]);

    const getYPosition = (value) => {
        const range = maxValue - minValue;
        if (range === 0) return 50;
        return 100 - ((value - minValue) / range * 100);
    };

    const createPath = (lineKey) => {
        if (data.length === 0) return '';

        const points = data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * 100;
            const y = getYPosition(item[lineKey] || 0);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Legend */}
                    <div className="flex gap-4 justify-center flex-wrap">
                        {lines.map((line, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: line.color }}
                                />
                                <span className="text-sm text-muted-foreground">{line.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="relative" style={{ height: `${height}px` }}>
                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="w-full h-full"
                        >
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((y) => (
                                <line
                                    key={y}
                                    x1="0"
                                    y1={y}
                                    x2="100"
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="0.1"
                                    className="text-muted-foreground/20"
                                />
                            ))}

                            {/* Lines */}
                            {lines.map((line, index) => (
                                <g key={index}>
                                    <path
                                        d={createPath(line.key)}
                                        fill="none"
                                        stroke={line.color}
                                        strokeWidth="0.5"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Points */}
                                    {data.map((item, dataIndex) => {
                                        const x = (dataIndex / (data.length - 1 || 1)) * 100;
                                        const y = getYPosition(item[line.key] || 0);
                                        return (
                                            <circle
                                                key={dataIndex}
                                                cx={x}
                                                cy={y}
                                                r="0.8"
                                                fill={line.color}
                                                className="hover:r-1.5 transition-all cursor-pointer"
                                            >
                                                <title>{`${item[xKey]}: ${item[line.key]?.toLocaleString()}`}</title>
                                            </circle>
                                        );
                                    })}
                                </g>
                            ))}
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2">
                            {data.map((item, index) => (
                                <span key={index} className="text-xs text-muted-foreground">
                                    {item[xKey]}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
