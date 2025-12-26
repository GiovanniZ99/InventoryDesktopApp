import { Routes } from '@angular/router';
import { ProductComponent } from './components/product/product.component';

export const routes: Routes = [
  { 
    path: '', 
    component: ProductComponent 
  },
  { 
    path: 'products', 
    component: ProductComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];

