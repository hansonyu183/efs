import type { AuthController } from './auth-controller';
import type { MainController } from './main-controller';
export interface AppShellBrand {
    title?: string;
    subtitle?: string;
}
export interface AppShellAuthPage {
    title?: string;
    subtitle?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    passwordLabel?: string;
    passwordPlaceholder?: string;
    orgLabel?: string;
    orgPlaceholder?: string;
    submitLabel?: string;
    submittingLabel?: string;
}
export interface AppShellRuntimeCopy {
    crudSubtitle?: string;
    reportSubtitle?: string;
    unsupportedSubtitle?: string;
    emptyTitle?: string;
    emptySubtitle?: string;
}
export interface AppShellConfig {
    brand?: AppShellBrand;
    locale?: string;
    theme?: 'light' | 'dark';
    authPage?: AppShellAuthPage;
    runtime?: AppShellRuntimeCopy;
}
export interface AppController {
    kind: 'app';
    appName?: string;
    shell?: AppShellConfig;
    auth: AuthController;
    main: MainController;
}
