import type { LegacyAuthController } from './auth-controller';
import type { LegacyMainController } from './main-controller';
export interface LegacyAppController {
    kind: 'app';
    auth: LegacyAuthController;
    main: LegacyMainController;
}
