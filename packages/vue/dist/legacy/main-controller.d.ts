import type { DomainResPath } from './shared-types';
import type { LegacyDomainController } from './domain-controller';
export interface LegacyMainController {
    kind: 'main';
    domains: readonly LegacyDomainController[];
    defaultPath?: DomainResPath | '';
}
