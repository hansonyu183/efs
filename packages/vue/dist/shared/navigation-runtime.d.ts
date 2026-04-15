export declare function normalizeEfsPath(path?: string | null): string;
export declare function useEfsNavigation(options: {
    initialPath?: string;
    loginPath?: string;
    firstResourcePath?: string;
}): {
    currentPath: import("vue").Ref<string, string>;
    normalizedPath: import("vue").ComputedRef<string>;
    isLoginRoute: import("vue").ComputedRef<boolean>;
    push: (path: string) => void;
    replace: (path: string) => void;
};
