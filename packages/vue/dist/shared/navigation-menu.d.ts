export type FlatMenuNode = {
    key: string;
    title: string;
    path?: string;
    icon?: string;
    order: number;
    parentKey?: string | null;
    type: 'group' | 'item';
    visible?: boolean;
    disabled?: boolean;
};
export type SidebarMenuTreeNode = {
    key: string;
    title: string;
    path?: string;
    icon?: string;
    order: number;
    parentKey?: string | null;
    type: 'group' | 'item';
    disabled?: boolean;
    children: SidebarMenuTreeNode[];
};
export declare function buildSidebarMenuTree(flatNodes?: Array<Partial<FlatMenuNode>>): SidebarMenuTreeNode[];
