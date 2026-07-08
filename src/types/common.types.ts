export interface Connection<T> {
  items: T[];
  nextCursor: number | null;
  total: number;
}
