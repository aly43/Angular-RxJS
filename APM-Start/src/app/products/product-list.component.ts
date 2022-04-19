import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, Observable, of, startWith, Subject, Subscription } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  // selectedCategoryId = 1;

  private categorySelectedSubject = new BehaviorSubject<number>(0); //initialize with number 0, otherwise 'new Subject<number>()'
  categorySelectedAction$ = this.categorySelectedSubject.asObservable(); // expose the subject as an observ'able

  products$ = combineLatest([ //combine action with data stream
    this.productService.productsWithCategory$, //want the category string, not id
    this.categorySelectedAction$
    .pipe(
      startWith(0) //initializes with number 0, same as behavior subject
    )
  ])
    .pipe( //perform filter
      map(([products, selectedCategoryId]) =>  //structure array elements, [products, cat id from user]
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId: true //simple filter
    )),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
    );

  // products$ = this.productService.productsWithCategory$ //: Observable<Product[]> | undefined =
  //   .pipe(
  //     catchError((err) => {
  //       this.errorMessage = err;
  //       return of([]);
  //     })
  //   );
  //sub!: Subscription;

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return of([]);
    })
  );

  // productsSimpleFilter$ = this.productService.productsWithCategory$.pipe(
  //   map((products) =>
  //     products.filter((product) =>
  //       this.selectedCategoryId
  //         ? product.categoryId === this.selectedCategoryId
  //         : true
  //     )
  //   ) //check if selected category exists, if it does compare, if not return true to select call
  // );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  // ngOnInit(): void {
  //   this.products$ = this.productService.getProducts()
  //     .pipe(
  //       catchError(err => {
  //         this.errorMessage = err;
  //         return of([]);
  //       })
  //     )
  //     // .subscribe({
  //     //   next: products => this.products = products,
  //     //   error: err => this.errorMessage = err
  //     // });
  // }

  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    // this.selectedCategoryId = +categoryId
    this.categorySelectedSubject.next(+categoryId);//called each time the user selects item from dropdown
  }
}
