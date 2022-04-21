import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
  throwError,
  Observable,
  of,
  map,
  concatMap,
  tap,
  mergeMap,
  switchMap,
  shareReplay,
  catchError,
} from 'rxjs';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl) //get array of suppliers, http call, the response is set into a supplier array
    .pipe( //pipe array of suppliers
      tap(data => console.log('suppliers', JSON.stringify(data))), //tap each supplier
      shareReplay(1), //cache data and catch errors
      catchError(this.handleError)
    )

  supplierWithMap$ = of(1, 5, 8) // mock list of supplier id's
    .pipe(
      map((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //each id is mapped
    );

  suppliersWithConcatMap$ = of(1, 5, 8) //emits after each is completed, one at a time
    .pipe(
      //pipe each id (one by one) through a set of operators
      tap((id) => console.log('concatMap source Observable', id)), //log id
      concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //transform id's into new observables and then flatten for the output stream
    );

  suppliersWithMergeMap$ = of(1, 5, 8) //emits in parallel
    .pipe(
      //pipe each id (one by one) through a set of operators
      tap((id) => console.log('mergeMap source Observable', id)), //log id
      mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //transform id's into new observables and then flatten for the output stream
    );

  suppliersWithSwitchMap$ = of(1, 5, 8) //emits in parallel
    .pipe(
      //pipe each id (one by one) through a set of operators
      tap((id) => console.log('switchMap source Observable', id)), //log id
      switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) //transform id's into new observables and then flatten for the output stream
    );

  constructor(private http: HttpClient) {
    this.suppliersWithConcatMap$.subscribe(
      //o => o.subscribe( //using a nested subscription works, but makes code too complicated and bug prone
      (item) => console.log('concatMap result', item)
    );
    this.suppliersWithMergeMap$.subscribe((item) =>
      console.log('mergeMap result', item)
    );
    this.suppliersWithSwitchMap$.subscribe((item) =>
      console.log('switchMap result', item)
    );
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
