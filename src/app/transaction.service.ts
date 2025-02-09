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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StockTransaction, StockTransactionDto } from './models';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private firestore = inject(Firestore);
  private transactionsCollection = collection(this.firestore, 'transactions');

  public addTransaction(transaction: StockTransaction): Promise<void> {
    console.log(transaction);

    return addDoc(this.transactionsCollection, transaction)
      .then(() => console.log('Stock Transaction saved!'))
      .catch((err) => console.error('Error while saving: ', err));
  }

  public getTransactions(): Observable<Array<StockTransactionDto>> {
    return collectionData(this.transactionsCollection, {
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
      drinks: transaction.drinks,
    });
  }

  public async deleteTransaction(id: string): Promise<void> {
    const docRef = doc(this.firestore, `transactions/${id}`);
    await deleteDoc(docRef);
  }
}
