import type { ReactNode } from "react";

export type NavItem = {
  to: string;
  end: boolean;
  label: string;
  icon: ReactNode;
};
