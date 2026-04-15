type SchemaPresetType = 'crud' | 'report' | 'workbench';
export type ScaffoldedPreset = {
    appSchema: string;
    runtimeEntry: string;
    rootVue: string;
};
export declare function scaffoldPreset(preset: SchemaPresetType, name: string): ScaffoldedPreset;
export declare function listPresets(): SchemaPresetType[];
export {};
