import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, map, merge, Observable, scan, Subject, tap, throwError } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    //map(item => item.price * 1.5),
    // map(products => //emit the array
    //   products.map(product => ({// product.price ? product.price* 1.5 : 0  :map each element in array, if nullable use conditional, but could change structure for future calls
    //     ...product, //spread operator, copies products properties and values
    //     price: product.price ? product.price * 1.5 : 0,
    //     searchKey: [product.productName] //populate with product name,
    //   } as Product))), //strong typing
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price ? product.price * 1.5 : 0,
        category: categories.find(c => product.categoryId === c.id)?.name,
        searchKey: [product.productName]
      } as Product))
    )
  )

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$, //listens to products, with categories
    this.productSelectedAction$ //watches if something is selected and emits when it is
  ]).pipe(
    map(([products, selectedProductId]) =>  //emits array of products and productid
    products.find(product => product.id === selectedProductId) //find product that matches with id and send it back to subscriber
    ),
    tap(product => console.log('selectedProduct', product))
  )

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(
    scan((acc, value) =>
     (value instanceof Array) ? [...value] : [...acc, value], [] as Product[])
  )

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct) //call next on action stream to emit new product
  }

  constructor(private http: HttpClient, private productCategoryService: ProductCategoryService) { }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId) //emit id to action stream
  }
  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(data => console.log('Products: ', JSON.stringify(data))),
  //       catchError(this.handleError)
  //     );
  // }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
