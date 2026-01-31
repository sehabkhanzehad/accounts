import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Users, UserCheck, UserX, CheckCircle, Calendar, Package } from "lucide-react"

export function PackageGrid({ packages, onEdit, onDelete, onViewPilgrims }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {packages?.map((pkg) => (
                <Card key={pkg.id} className="relative hover:shadow-md transition-shadow duration-200 gap-2">
                    <CardHeader className="pb-0">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-medium text-sm leading-tight">
                                        {pkg.attributes.name}
                                    </h3>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-sm text-primary">
                                        ৳{parseFloat(pkg.attributes.price).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant={pkg.attributes.status ? "default" : "secondary"} 
                                    className="text-xs h-5 px-2"
                                >
                                    {pkg.attributes.status ? 'Active' : 'Inactive'}
                                </Badge>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                        <EllipsisVertical className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onViewPilgrims(pkg)}>
                                        See Pilgrims
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onEdit(pkg)}>
                                        Edit Package
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(pkg)} className="text-destructive">
                                        Delete Package
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                            {pkg.attributes.start_date && pkg.attributes.end_date && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-xs">
                                        {new Date(pkg.attributes.start_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} to {new Date(pkg.attributes.end_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} {pkg.attributes.duration_days ? `(${pkg.attributes.duration_days} days)` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-border/50 my-2"></div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pr-8">
                            <div className="flex items-center gap-2 text-xs min-w-0">
                                <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground truncate">Total</span>
                                <span className="font-semibold ml-auto">{pkg.attributes.statistics.total_pilgrims}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs min-w-0">
                                <UserX className="h-3 w-3 text-red-500 shrink-0" />
                                <span className="text-muted-foreground truncate">Cancelled</span>
                                <span className="font-semibold text-red-600 ml-auto">{pkg.attributes.statistics.cancelled}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs min-w-0">
                                <UserCheck className="h-3 w-3 text-blue-500 shrink-0" />
                                <span className="text-muted-foreground truncate">Registered</span>
                                <span className="font-semibold text-blue-600 ml-auto">{pkg.attributes.statistics.registered}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs min-w-0">
                                <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                                <span className="text-muted-foreground truncate">Completed</span>
                                <span className="font-semibold text-green-600 ml-auto">{pkg.attributes.statistics.completed}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}