import type { EfsFieldSchema } from './field-schema';
export interface EfsDomainSchema {
    key: string;
    title: string;
    resources: EfsResourceSchema[];
}
export interface EfsResourceSchema {
    key: string;
    title: string;
    fields?: EfsFieldSchema[];
    apis?: EfsResourceApisSchema;
    description?: string;
}
export interface EfsResourceApisSchema {
    list?: EfsEndpointSchema;
    get?: EfsEndpointSchema;
    query?: EfsEndpointSchema;
    create?: EfsEndpointSchema;
    update?: EfsEndpointSchema;
    remove?: EfsEndpointSchema;
    custom?: Record<string, EfsEndpointSchema>;
}
export interface EfsEndpointSchema {
    path: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}
