import type { AuthController } from './auth-controller';
import type { MainController } from './main-controller';
export interface AppController {
    kind: 'app';
    appName?: string;
    auth: AuthController;
    main: MainController;
}
