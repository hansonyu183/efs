import type { Ref, DomainResPath } from './shared-types';
import type { DomainController } from './domain-controller';
export interface MainController {
    kind: 'main';
    domains: readonly DomainController[];
    currentPath?: Ref<DomainResPath | ''>;
}
