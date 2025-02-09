export interface StockTransactionDto extends StockTransaction {
  id?: string;
}

export interface StockTransaction {
  name: string;
  date: string;
  drinks: Array<DrinkEntry>;
  isRestock: boolean;
}

export interface DrinkEntry {
  name: string;
  quantity: number;
}
