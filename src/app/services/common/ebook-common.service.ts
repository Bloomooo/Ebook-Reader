import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EBook } from '../../../models/ebook.models';

@Injectable({
  providedIn: 'root'
})
export class EbookCommonService {
  private currentBookSubject: BehaviorSubject<EBook | null> = new BehaviorSubject<EBook | null>(null);

  currentBook$: Observable<EBook | null> = this.currentBookSubject.asObservable();

  getCurrentBook(): Observable<EBook | null> {
    return this.currentBook$;
  }

  setCurrentBook(book: EBook): void {
    this.currentBookSubject.next(book);
  }
}
