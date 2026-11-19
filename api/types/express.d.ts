declare global {
  namespace Express {
    interface Locals {
      userId: string;
      viewerId: string | null;
    }
  }
}

export {};
