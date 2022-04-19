import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { catchError, EMPTY, Subject, Subscription } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush // needs to make errors emit (.next)
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCategory$
  .pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  )

  products: Product[] = [];
  sub!: Subscription;

  selectedProduct$ = this.productService.selectedProduct$; //single product stream from the product service

  constructor(private productService: ProductService) { }

  // ngOnInit(): void {
  //   this.sub = this.productService.getProducts().subscribe({
  //     next: products => this.products = products,
  //     error: err => this.errorMessage = err
  //   });
  // }

  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId)
  }
}
