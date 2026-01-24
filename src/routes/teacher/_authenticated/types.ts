
export type ViewType =
    | 'dashboard'
    | 'products'
    | 'calendar'
    | 'suppliers'
    | 'reports'
    | 'notifications'
    | 'settings'
    | 'support';

export interface StatCardProps {
    label: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: string;
    iconBgColor: string;
    iconTextColor: string;
}

export interface NavItemProps {
    icon: string;
    label: string;
    view: ViewType;
    isActive: boolean;
    onClick: (view: ViewType) => void;
    hasDot?: boolean;
}
