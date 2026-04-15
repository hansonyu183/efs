import type { EfsAuthSchema } from './auth-schema.js';
import type { EfsServiceSchema } from './service-schema.js';
import type { EfsDomainSchema } from '../resource/resource-schema.js';
import type { EfsAppUiSchema } from '../resource/ui-schema.js';
export interface EfsAppSchema {
    schemaVersion: 'v1';
    app: EfsAppInfoSchema;
    auth?: EfsAuthSchema;
    services?: Record<string, EfsServiceSchema>;
    domains: EfsDomainSchema[];
    ui?: EfsAppUiSchema;
}
export interface EfsAppInfoSchema {
    id: string;
    name: string;
    title?: string;
    description?: string;
    brandIcon?: string;
    locale?: string;
    theme?: 'light' | 'dark';
    defaultDomain?: string;
    defaultRes?: string;
}
