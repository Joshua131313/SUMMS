import type { Request, Response } from 'express';
export declare const getMyBookings: (req: Request, res: Response) => Promise<void>;
export declare const reserveVehicle: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const startRental: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const endRental: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const payRental: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=bookingController.d.ts.map