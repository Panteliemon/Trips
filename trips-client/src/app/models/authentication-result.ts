import { User } from './user';

export class AuthenticationResult {
    user: User;
    token: string;
    expires: Date;
}