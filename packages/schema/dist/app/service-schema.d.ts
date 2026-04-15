export interface EfsServiceSchema {
    kind: 'http' | 'mock' | 'gateway';
    baseUrl?: string;
    port?: number;
    healthPath?: string;
    devCommand?: string;
    workingDir?: string;
    env?: Record<string, string>;
}
