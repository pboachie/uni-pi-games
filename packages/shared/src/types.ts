// packages/shared/src/types.ts
import { ReactElement } from "react";

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

// Frontend-specific type for game plugins
export interface GamePlugin {
  name: string;
  render: () => ReactElement;
}
