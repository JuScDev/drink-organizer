import { Component, inject, signal } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrinkEntry, StockTransaction } from '../../models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrl: './transaction-detail.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TransactionDetailComponent {
  private _transactionService = inject(TransactionService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  public isEditing = signal(false);
  public transactionId = signal<string | undefined>(undefined);
  public name = signal('');
  public isRestock = signal(true);
  public drinks = signal<Array<DrinkEntry>>([]);

  public constructor() {
    this._route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.isEditing.set(true);
        this.transactionId.set(id);

        const transaction = await this._transactionService.getTransactionById(
          id
        );
        if (transaction) {
          this.name.set(transaction.name);
          this.isRestock.set(transaction.isRestock);
          this.drinks.set(transaction.drinks);
        }
      } else {
        const allDrinks =
          await this._transactionService.getAllDrinksFromPreviousTransactions();
        this.drinks.set(allDrinks);
      }
    });
  }

  public toggleRestock() {
    this.isRestock.set(!this.isRestock());
  }

  public addDrink(name: string, quantity: string) {
    if (!name || !quantity || +quantity <= 0) return;
    if (this.drinks().some((drink) => drink.name === name)) {
      alert('Dieses Getränk ist bereits in der Liste.');
      return;
    }
    this.drinks.update((drinks) => [...drinks, { name, quantity: +quantity }]);
  }

  public removeDrink(name: string) {
    this.drinks.update((drinks) => drinks.filter((d) => d.name !== name));
  }

  public saveTransaction() {
    const transaction: StockTransaction = {
      name: this.name(),
      date: new Date().toISOString(),
      isRestock: this.isRestock(),
      drinks: this.drinks(),
    };

    if (this.isEditing()) {
      this._transactionService.updateTransaction({
        ...transaction,
        id: this.transactionId(),
      });
    } else {
      this._transactionService.addTransaction(transaction);
    }

    this._router.navigate(['/']);
  }

  public cancel() {
    this._router.navigate(['/']);
  }
}
