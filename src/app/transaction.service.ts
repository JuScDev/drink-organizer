import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { StockTransaction, StockTransactionDto, DrinkEntry } from './models';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private firestore = inject(Firestore);
  private transactionsCollection = collection(this.firestore, 'transactions');

  public async addTransaction(transaction: StockTransaction): Promise<void> {
    const allDrinks = await this.getAllDrinksFromPreviousTransactions();
    transaction.drinks = allDrinks
      .map((drink) => ({
        name: drink.name,
        quantity:
          transaction.drinks.find((d) => d.name === drink.name)?.quantity || 0,
      }))
      .filter((drink) => drink.quantity > 0);

    return addDoc(this.transactionsCollection, transaction)
      .then(() => console.log('Stock Transaction saved!'))
      .catch((err) => console.error('Error while saving: ', err));
  }

  public getTransactions(): Observable<Array<StockTransactionDto>> {
    const transactionsQuery = query(
      this.transactionsCollection,
      orderBy('date', 'desc')
    );
    return collectionData(transactionsQuery, {
      idField: 'id',
    }) as Observable<Array<StockTransactionDto>>;
  }

  public async getTransactionById(
    id: string
  ): Promise<StockTransaction | null> {
    const docRef = doc(this.firestore, `transactions/${id}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id, ...docSnap.data() } as StockTransactionDto)
      : null;
  }

  public async updateTransaction(
    transaction: StockTransactionDto
  ): Promise<void> {
    if (!transaction.id) return;
    const docRef = doc(this.firestore, `transactions/${transaction.id}`);
    await updateDoc(docRef, {
      name: transaction.name,
      isRestock: transaction.isRestock,
      drinks: transaction.drinks.filter((drink) => drink.quantity > 0),
    });
  }

  public async deleteTransaction(id: string): Promise<void> {
    const docRef = doc(this.firestore, `transactions/${id}`);
    await deleteDoc(docRef);
  }

  public async getAllDrinksFromPreviousTransactions(): Promise<
    Array<DrinkEntry>
  > {
    try {
      if (!this.firestore || !this.transactionsCollection) {
        console.error('Firestore or transactions collection not initialized');
        return [];
      }

      const transactions = await firstValueFrom(
        collectionData(this.transactionsCollection, {
          idField: 'id',
        })
      );
      const allDrinksMap = new Map<string, DrinkEntry>();

      if (!transactions || transactions.length === 0) {
        return [];
      }

      (transactions as StockTransactionDto[]).forEach(
        (transaction: StockTransactionDto) => {
          transaction.drinks.forEach((drink) => {
            if (!allDrinksMap.has(drink.name)) {
              allDrinksMap.set(drink.name, { name: drink.name, quantity: 0 });
            }
          });
        }
      );

      const allDrinks = Array.from(allDrinksMap.values());
      return allDrinks;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
}
