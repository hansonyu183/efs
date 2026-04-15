export interface EfsAppUiSchema {
    domains?: Record<string, EfsDomainUiSchema>;
}
export interface EfsDomainUiSchema {
    resources?: Record<string, EfsResourceUiSchema>;
}
export interface EfsResourceUiSchema {
    view?: EfsResourceViewUiSchema;
    fields?: Record<string, EfsFieldUiSchema>;
    actions?: Record<string, EfsActionUiSchema>;
}
export interface EfsResourceViewUiSchema {
    mode?: 'crud' | 'report' | 'workspace' | 'custom';
}
export interface EfsFieldUiSchema {
    hidden?: boolean;
    label?: string;
}
export interface EfsActionUiSchema {
    hidden?: boolean;
    label?: string;
    placement?: 'page' | 'row' | 'batch' | 'detail';
    api?: string;
    runtime?: EfsRuntimeActionKey;
}
export type EfsRuntimeActionKey = 'refresh' | 'filter' | 'toggle-hidden' | 'toggle-columns';
