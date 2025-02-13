import { Component, inject, signal } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockTransactionDto } from '../../models';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-usage-overview',
  templateUrl: './usage-overview.component.html',
  styleUrl: './usage-overview.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class UsageOverviewComponent {
  private _transactionService = inject(TransactionService);
  public transactions = signal<Array<StockTransactionDto>>([]);
  public selectedTransactionStart = signal<string | undefined>(undefined);
  public selectedTransactionEnd = signal<string | undefined>(undefined);
  public usage = signal<Array<{ name: string; quantity: number }>>([]);

  constructor() {
    this._transactionService.getTransactions().subscribe((transactions) => {
      this.transactions.set(transactions);
    });
  }

  public calculateUsage() {
    const startTransaction = this.transactions().find(
      (t) => t.id === this.selectedTransactionStart()
    );
    const endTransaction = this.transactions().find(
      (t) => t.id === this.selectedTransactionEnd()
    );

    if (!startTransaction || !endTransaction) return;

    const usageMap = new Map<string, number>();

    for (const drink of startTransaction.drinks) {
      usageMap.set(drink.name, drink.quantity);
    }

    for (const drink of endTransaction.drinks) {
      usageMap.set(
        drink.name,
        (usageMap.get(drink.name) || 0) - drink.quantity
      );
    }

    this.usage.set(
      Array.from(usageMap, ([name, quantity]) => ({
        name,
        quantity: Math.abs(quantity),
      }))
    );
  }

  public downloadUsageAsExcel() {
    const usageData = this.usage().map((item) => ({
      Getränk: item.name,
      Anzahl: item.quantity,
    }));

    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [['Getränk', 'Anzahl']], {
      origin: 'A1',
    });
    XLSX.utils.sheet_add_json(worksheet, usageData, {
      origin: 'A3',
      skipHeader: true,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usage Overview');
    XLSX.writeFile(workbook, 'usage-overview.xlsx');
  }
}
