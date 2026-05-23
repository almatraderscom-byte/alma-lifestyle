import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900 tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                change.positive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.positive ? '↑' : '↓'} {change.value} vs last month
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
