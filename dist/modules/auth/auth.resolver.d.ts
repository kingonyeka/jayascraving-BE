import { AuthService } from './auth.service';
import { GoogleAuthInput } from './dto/google-auth.input';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
declare class AuthPayload {
    accessToken: string;
    user: User;
}
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    private setRefreshCookie;
    googleAuth(input: GoogleAuthInput, ctx: {
        res: Response;
    }): Promise<AuthPayload>;
    refreshToken(ctx: {
        req: any;
        res: Response;
    }): Promise<AuthPayload>;
    logout(user: User, ctx: {
        req: any;
        res: Response;
    }): Promise<boolean>;
    logoutAll(user: User, ctx: {
        res: Response;
    }): Promise<boolean>;
}
export {};
