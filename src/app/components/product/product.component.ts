import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, Subscription, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, mapTo, switchMap, take } from 'rxjs/operators';
import { CustomPaginatorIntl } from '../../custom-paginator-intl';
import { Product } from '../../models/product.model';
import { ProductService } from './product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

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
    MatProgressSpinnerModule
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

  loading: boolean = false;

  currentProduct: Product | null = null;
  productToDelete: Product | null = null;
  errorMessage = '';
  successMessage = '';
  totalElements = 0;
  pageSize = 8;
  currentPage = 0;
  displayedColumns: string[] = ['barcode', 'name', 'price', 'soldQuantity', 'stockQuantity', 'actions'];

  private routeSubscription: Subscription | undefined;
  private barcodeSubject = new Subject<string>();
  private nameSearchSubject = new Subject<string>();
  private barcodeSearchSubject = new Subject<string>();
  private nameSearchSub!: Subscription;
  private barcodeSearchSub!: Subscription;

  currentSearchTerm: string | null = null; // per tracciare la ricerca corrente

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({ barcode: [''] });
    this.searchForm = this.fb.group({ name: [''], barcode: [''] });
    this.editForm = this.fb.group({ name: [''], stockQuantity: [], price: [] });
    this.searchByBarcodeForm = this.fb.group({ barcode: [''] });

    this.barcodeSubject.pipe(debounceTime(50), distinctUntilChanged())
      .subscribe(() => this.registerOrSellProduct());
  }

  ngOnInit(): void {
    this.loading = true;
    this.waitLoadProductsReady().subscribe(() => {
      this.loadProducts();
      this.loading = false;
    });

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.searchForm.patchValue({ name: params['name'] || '' });
      this.currentSearchTerm = params['name'] || null;
      this.loadProducts();
    });


    this.productForm.get('barcode')?.valueChanges.subscribe(value => this.barcodeSubject.next(value));

    this.nameSearchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(name => {
        this.currentSearchTerm = name?.trim() || null;
        this.currentPage = 0;
        this.loadProducts();
      });

    this.barcodeSearchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(barcode => {
        if (barcode?.trim()) {
          this.searchByBarcode(barcode);
        } else {
          this.currentSearchTerm = null;
          this.loadProducts();
        }
      });

    this.searchForm.get('name')?.valueChanges.subscribe(value => this.nameSearchSubject.next(value));
    this.searchForm.get('barcode')?.valueChanges.subscribe(value => this.barcodeSearchSubject.next(value));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.barcodeInput?.nativeElement?.focus();
      this.cdr.detectChanges();
    }, 0);
  }

  waitLoadProductsReady(): Observable<void> {
    return timer(4000, 2000).pipe(
      switchMap(() =>
        this.productService.getAllProducts(this.currentPage, this.pageSize).pipe(
          mapTo(void 0),
          catchError(() => of(null))
        )
      ),
      filter(res => res !== null),
      take(1)
    );
  }

  loadProducts(): void {
    const request = this.currentSearchTerm
      ? this.productService.searchProducts(this.currentSearchTerm, this.currentPage, this.pageSize)
      : this.productService.getAllProducts(this.currentPage, this.pageSize);

    request.pipe()
      .subscribe({
        next: (response) => {
          this.products = response.content;
          this.totalElements = response.page.totalElements;
        },
        error: (err) => {
          if (!(err.error instanceof ProgressEvent)) {
            const backendMessage = err?.error;
            this.showError(backendMessage);
          }
          this.products = [];
          this.totalElements = 0;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  searchByBarcode(barcode: string): void {
    this.productService.getProductByBarcode(barcode).subscribe({
      next: (product) => {
        this.products = [product];
        this.totalElements = 1;
        this.currentPage = 0;
      },
      error: (err) => {
        const backendMessage = err?.error;
        this.showError(backendMessage);
        this.products = [];
        this.totalElements = 0;
      }
    });
  }

  clearBarcodeSearch(): void {
    this.searchForm.get('barcode')?.reset();
    const barcodeInput = document.getElementById('searchBarcode') as HTMLInputElement;
    barcodeInput?.focus();
  }

  private isUrl(value: string): boolean {
    const urlPattern = /^(https?:\/\/[^\s]+)/i;
    return urlPattern.test(value);
  }

  registerOrSellProduct(): void {
    if (this.productForm.valid) {
      const barcode = this.productForm.get('barcode')?.value;
      if (this.isUrl(barcode)) {
        this.showError('Attenzione! Hai scansionato un QR Code invece di un barcode');
      }
      this.productService.registerProduct(barcode).subscribe({
        next: (product) => {
          const productLabel = product.name ? product.name : barcode;
          if (product.soldQuantity) {
            this.showSuccess(`Prodotto "${productLabel}" venduto (tot. venduto ${product.soldQuantity}, 
              tot. magazzino ${product.stockQuantity})`);
          } else {
            this.showSuccess(`Prodotto "${productLabel}" registrato con successo`);
          }
          this.productForm.reset();
          this.loadProducts();
        },
        error: () => {
          this.showError('Errore nella registrazione del prodotto');
          setTimeout(() => this.barcodeInput?.nativeElement?.focus(), 100);
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.currentProduct = product;
    this.editForm.patchValue({
      name: product.name,
      price: product.price,
      stockQuantity: product.stockQuantity
    });
  }

  updateProduct(): void {
    if (this.editForm.valid && this.currentProduct) {
      const priceRaw = this.editForm.get('price')?.value ?? '';
      const priceValue = this.editForm.get('price')?.value ?? 0;
      const updatedProduct = {
        ...this.currentProduct,
        ...this.editForm.value,
        price: Number(priceValue)
      };
      this.productService.updateProduct(updatedProduct).subscribe({
        next: () => {
          this.showSuccess('Prodotto aggiornato con successo');
          this.currentProduct = null;
          this.loadProducts();

        },
        error: (err) => {
          const backendMessage = err?.error;
          this.showError(backendMessage);
          this.currentProduct = null;
        }
      });
      const barcode = document.getElementById('barcode') as HTMLInputElement;
      barcode.focus();
    }
  }

  decreaseQuantity(product: Product): void {
    this.productService.decreaseQuantity(product.barcode).subscribe({
      next: () => {
        this.showSuccess('Quantità diminuita con successo')
        this.loadProducts();
      },
      error: (err) => {
        const backendMessage = err?.error;
        this.showError(backendMessage);
      }
    });
  }

  deleteProduct(product: Product): void {
    this.productToDelete = product;
  }

  confirmDeleteProduct(): void {
    this.productService.deleteProduct(this.productToDelete!.barcode).subscribe({
      next: () => {
        this.showSuccess('Prodotto eliminato con successo');
        this.products = this.products.filter(p => p.barcode !== this.productToDelete!.barcode);
        this.totalElements--;
        if (this.products.length === 0 && this.currentPage > 0) this.currentPage--;
        this.productToDelete = null;
        this.loadProducts();
      },
      error: () => this.showError('Errore nell\'eliminazione del prodotto')
    });
  }

  private errorTimeout: any;
  private successTimeout: any;

  private showError(message: string): void {
    this.errorMessage = message;

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
      this.cdr.markForCheck();
    }, 8000);

    this.cdr.markForCheck();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;

    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }

    this.successTimeout = setTimeout(() => {
      this.successMessage = '';
      this.cdr.markForCheck();
    }, 8000);

    this.cdr.markForCheck();
  }
}
