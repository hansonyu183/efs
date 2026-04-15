import type { EfsResourceSchema } from '../resource/resource-schema.js';
import type { EfsResourceUiSchema, EfsRuntimeActionKey } from '../resource/ui-schema.js';
export type InferredResourceViewMode = 'crud' | 'report' | 'workspace' | 'custom';
export interface InferredResourceAction {
    key: string;
    kind: 'operation' | 'runtime';
    placement: 'page' | 'row' | 'batch' | 'detail';
    hidden: boolean;
    label?: string;
    api?: string;
    runtime?: EfsRuntimeActionKey;
}
export interface InferredResourceRuntime {
    mode: InferredResourceViewMode;
    actions: InferredResourceAction[];
}
export declare function inferResourceRuntime(resource: EfsResourceSchema, ui?: EfsResourceUiSchema): InferredResourceRuntime;
