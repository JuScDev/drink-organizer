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
    path: 'usage-overview',
    loadComponent: () =>
      import('./components/usage-overview/usage-overview.component').then(
        (m) => m.UsageOverviewComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/inventory/inventory.component').then(
        (m) => m.InventoryComponent
      ),
  },
];
