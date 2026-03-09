import type { Request, Response } from 'express';
export declare const getMe: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateMe: (req: Request, res: Response) => Promise<void>;
export declare const updateUserRole: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userController.d.ts.map