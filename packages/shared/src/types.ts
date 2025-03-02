// packages/shared/src/types.ts
export interface User {
    id: string;
    username: string;
  }

  export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    status: string;
  }