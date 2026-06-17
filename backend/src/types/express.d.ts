import { Role } from '../constants/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
      requestId?: string;
    }
  }
}
export {};
