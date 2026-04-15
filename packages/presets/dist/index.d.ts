type PresetPageType = 'login' | 'workbench' | 'query-list' | 'paginated-list' | 'entity-list' | 'form-page' | 'detail-page' | 'report-page';
export type PresetManifest = {
    id: string;
    name: string;
    pageType: PresetPageType;
    domain: string;
    resource: string;
    standardComponents: string[];
    runtimeCapabilities: string[];
    exception: null;
};
export type ScaffoldedPreset = {
    manifest: PresetManifest;
    vue: string;
    fileBaseName: string;
};
export declare function scaffoldPreset(pageType: PresetPageType, name: string): ScaffoldedPreset;
export declare function listPresets(): PresetPageType[];
export {};
