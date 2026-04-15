type SchemaPresetType = 'crud' | 'report' | 'workbench';
export type ScaffoldedPreset = {
    appSchema: string;
    mainEntry: string;
};
export declare function scaffoldPreset(preset: SchemaPresetType, name: string): ScaffoldedPreset;
export declare function listPresets(): SchemaPresetType[];
export {};
