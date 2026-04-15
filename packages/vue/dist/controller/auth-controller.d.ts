import type { Ref, AuthOption } from './shared-types';
export interface AuthController {
    kind: 'auth';
    name: Ref<string>;
    pwd: Ref<string>;
    orgCode?: Ref<string>;
    orgOptions?: readonly AuthOption[];
    busy?: Ref<boolean>;
    error?: Ref<string>;
    authenticated?: Ref<boolean>;
    login: () => void | Promise<void>;
    logout?: () => void | Promise<void>;
}
