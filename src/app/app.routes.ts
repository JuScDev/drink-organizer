import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inventory/inventory.component').then(
        (m) => m.InventoryComponent
      ),
  },
  {
    path: 'transaction/new',
    loadComponent: () =>
      import(
        './components/transaction-detail/transaction-detail.component'
      ).then((m) => m.TransactionDetailComponent),
  },
  {
    path: 'transaction/:id',
    loadComponent: () =>
      import(
        './components/transaction-detail/transaction-detail.component'
      ).then((m) => m.TransactionDetailComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/inventory/inventory.component').then(
        (m) => m.InventoryComponent
      ),
  },
];
