import type { AuthController } from './auth-controller';
import type { MainController } from './main-controller';
export interface AppController {
    kind: 'app';
    auth: AuthController;
    main: MainController;
}
