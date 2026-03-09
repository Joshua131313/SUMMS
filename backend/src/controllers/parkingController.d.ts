import type { Request, Response } from 'express';
export declare const listSpots: (req: Request, res: Response) => Promise<void>;
export declare const reserveSpot: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=parkingController.d.ts.map