import { ExecutionContext } from '@nestjs/common';
declare const JwtRefreshAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtRefreshAuthGuard extends JwtRefreshAuthGuard_base {
    getRequest(context: ExecutionContext): any;
    handleRequest(err: any, user: any): any;
}
export {};
