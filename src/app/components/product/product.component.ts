import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomPaginatorIntl } from '../../custom-paginator-intl';
import { Product, PageResponse } from '../../models/product.model';
import { ProductService } from './product.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ]
})
export class ProductComponent implements OnInit, AfterViewInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  productForm: FormGroup;
  searchForm: FormGroup;
  editForm: FormGroup;
  searchByBarcodeForm: FormGroup;

  products: Product[] = [];

  currentProduct: Product | null = null;
  productToDelete: Product | null = null;
  errorMessage = '';
  successMessage = '';
  totalPages = 0;
  totalElements = 0;
  pageSize = 8;
  currentPage = 0;
  displayedColumns: string[] = ['barcode', 'name', 'price', 'soldQuantity', 'stockQuantity', 'actions'];

  private routeSubscription: Subscription | undefined;
  private barcodeSubject = new Subject<string>();
  private nameSearchSubject = new Subject<string>();
  private barcodeSearchSubject = new Subject<string>();

  currentSearchTerm: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    this.productForm = this.fb.group({ barcode: [''] });
    this.searchForm = this.fb.group({ name: [''], barcode: [''] });
    this.editForm = this.fb.group({ name: [''], stockQuantity: [], price: [] });
    this.searchByBarcodeForm = this.fb.group({ barcode: [''] });

    this.barcodeSubject.pipe(debounceTime(50), distinctUntilChanged())
      .subscribe(() => this.registerOrSellProduct());

    this.nameSearchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(name => {
          if (name?.trim()) {
          this.searchByName(name);
        } else {
          this.currentSearchTerm = null;
          this.currentPage = 0;
          this.loadProducts();
        }
      });

    this.barcodeSearchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((barcode: string) => {
        if (barcode?.trim()) {
          this.searchByBarcode(barcode);
        } else {
          this.currentSearchTerm = null;
          this.currentPage = 0;
          this.loadProducts();
        }
      });
  }

  ngOnInit(): void {
    this.loadProducts();

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.searchForm.patchValue({ name: params['name'] || '' });
      this.currentSearchTerm = params['name'] || null;
      this.loadProducts();
    });

    this.productForm.get('barcode')?.valueChanges.subscribe(value => this.barcodeSubject.next(value));
    this.searchForm.get('name')?.valueChanges.subscribe(value => this.nameSearchSubject.next(value));
    this.searchForm.get('barcode')?.valueChanges.subscribe(value => this.barcodeSearchSubject.next(value));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.barcodeInput?.nativeElement?.focus();
      this.cdr.detectChanges();
    }, 0);
  }

  /** Carica prodotti con paginazione */
  async loadProducts(): Promise<void> {
    try {
      let response: PageResponse<Product>;
    
      response = await this.productService.getAllProducts(this.currentPage, this.pageSize);

      this.products = response.content;
      this.totalElements = response.page.totalElements;
      console.log(this.totalElements)
    } catch (err) {
      this.products = [];
      this.totalElements = 0;
      this.showError('Errore nel caricamento prodotti');
    }
  }

/** Ricerca prodotti per nome con paginazione */
async searchByName(name: string): Promise<void> {
  try {
    // Chiamo il servizio passando nome, pagina corrente e dimensione pagina
    const response: PageResponse<Product> = await this.productService.getProductByName(name, this.currentPage, this.pageSize);
    console.log(response.page.totalElements)

    // Aggiorno i dati della tabella
    this.products = response.content;
    this.totalElements = response.page.totalElements;
    this.totalPages = response.page.totalPages;
    this.currentPage = response.page.number;
  } catch (error) {
    this.products = [];
    this.totalElements = 0;
    this.showError('Prodotto non trovato');
  }
}


  /** Ricerca prodotto per barcode */
  async searchByBarcode(barcode: string): Promise<void> {
    try {
      const product = await this.productService.getProductByBarcode(barcode);
      this.products = [product];
      this.totalElements = 1;
      this.currentPage = 0;
    } catch (err) {
      this.products = [];
      this.totalElements = 0;
      this.showError('Prodotto non trovato');
    }
  }

  /** Gestione cambio pagina */
  async onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    await this.loadProducts();
  }

  /** Registrazione/vendita prodotto */
  async registerOrSellProduct(): Promise<void> {
    if (!this.productForm.valid) return;

    const barcode = this.productForm.get('barcode')?.value;
    if (!barcode) return;

    try {
      const product = await this.productService.registerOrSellProduct(barcode);
      this.showSuccess(`Prodotto "${product.name || barcode}" scansionato con successo!`);
      this.productForm.reset();
      await this.loadProducts();
    } catch {
      this.showError('Errore nella registrazione del prodotto');
    }
  }

  /** Aggiorna prodotto */
  editProduct(product: Product): void {
    this.currentProduct = product;
    this.editForm.patchValue({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity
    });
  }

  async updateProduct(): Promise<void> {
    if (!this.editForm.valid || !this.currentProduct) return;

    const updatedProduct: Product = {
      ...this.currentProduct,
      ...this.editForm.value,
      price: Number(this.editForm.get('price')?.value ?? 0)
    };

    try {
      await this.productService.updateProduct(updatedProduct);
      this.showSuccess('Prodotto aggiornato con successo!');
      this.currentProduct = null;
      await this.loadProducts();
    } catch {
      this.showError('Errore durante l\'aggiornamento del prodotto');
    }
  }

  /** Decrementa quantità venduta */
  async decreaseQuantity(product: Product): Promise<void> {
    if(product.soldQuantity === 0){
      this.showError('La quantità venduta non può essere negativa!')
      return
    }
    try {
      await this.productService.decreaseQuantity(product.barcode);
      this.showSuccess('Quantità diminuita con successo!');
      await this.loadProducts();
    } catch {
      this.showError('Errore durante la diminuzione della quantità');
    }
  }

  /** Eliminazione prodotto */
  deleteProduct(product: Product): void {
    this.productToDelete = product;
  }

  async confirmDeleteProduct(): Promise<void> {
    if (!this.productToDelete) return;

    try {
      await this.productService.deleteProduct(this.productToDelete.barcode);
      this.showSuccess('Prodotto eliminato con successo!');
      this.productToDelete = null;
      await this.loadProducts();
    } catch {
      this.showError('Errore nell\'eliminazione del prodotto');
    }
  }

  clearBarcodeSearch(): void { 
    this.searchForm.get('barcode')?.reset(); 
    const barcodeInput = document.getElementById('searchBarcode') as HTMLInputElement; 
    barcodeInput?.focus();
   }

  /** Messaggi UI */
  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
    this.cdr.markForCheck();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
    this.cdr.markForCheck();
  }
}
