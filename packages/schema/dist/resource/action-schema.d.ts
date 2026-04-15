export interface EfsActionSchema {
    key: string;
    title?: string;
    icon?: string;
    order?: number;
    scope: 'page' | 'row' | 'batch' | 'detail';
    variant?: 'default' | 'primary' | 'danger' | 'ghost';
    confirm?: boolean;
    dangerous?: boolean;
}
