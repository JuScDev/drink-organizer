import { Component, computed, effect, inject, signal } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StockTransactionDto } from '../../models';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class InventoryComponent {
  public transactions = signal<Array<StockTransactionDto>>([]);
  private _transactionService = inject(TransactionService);

  constructor() {
    this._transactionService.getTransactions().subscribe((transactions) => {
      this.transactions.set(transactions);
    });
  }

  public inventory = computed(() => {
    const stockMap = new Map<string, number>();

    for (const transaction of this.transactions()) {
      for (const drink of transaction.drinks) {
        const quantity = transaction.isRestock
          ? drink.quantity
          : -drink.quantity;
        stockMap.set(drink.name, (stockMap.get(drink.name) || 0) + quantity);
      }
    }

    return Array.from(stockMap, ([name, quantity]) => ({ name, quantity }));
  });

  public deleteTransaction(id: string) {
    this._transactionService.deleteTransaction(id).then(() => {
      this.transactions.set(this.transactions().filter((t) => t.id !== id));
    });
  }
}
