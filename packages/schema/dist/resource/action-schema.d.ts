import type { EfsEndpointSchema } from './resource-schema';
export interface EfsActionSchema {
    key: string;
    title?: string;
    intent?: 'create' | 'update' | 'delete' | 'export' | 'import' | 'submit' | 'approve' | 'reject' | 'custom';
    permission?: string;
    api: EfsEndpointSchema;
    description?: string;
}
