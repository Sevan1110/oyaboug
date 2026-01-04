// ============================================
// KPI Card - Statistics Display Component
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-primary',
  },
  success: {
    icon: 'bg-green-500/10 text-green-600',
    trend: 'text-green-600',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-600',
    trend: 'text-amber-600',
  },
  danger: {
    icon: 'bg-destructive/10 text-destructive',
    trend: 'text-destructive',
  },
  info: {
    icon: 'bg-blue-500/10 text-blue-600',
    trend: 'text-blue-600',
  },
};

const KPICard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: KPICardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% vs période préc.
              </p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            styles.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
