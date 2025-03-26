import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ReaderComponent } from '../reader/reader.component';
import { BehaviorSubject } from 'rxjs';
import { EBook } from '../../models/ebook.models';
import { BdService } from '../services/bd/bd.service';
import { EbooksService } from '../services/ebooks/ebooks.service';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EbookCommonService } from '../services/common/ebook-common.service';

@Component({
  selector: 'app-bibliotheque',
  imports: [
    MatIcon,
    ReaderComponent,
    AsyncPipe,
    MatProgressSpinner,
  ],
  templateUrl: './bibliotheque.component.html',
  styleUrls: ['./bibliotheque.component.css'],
})
export class BibliothequeComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  bookTitle: string = '';
  bookAuthor: string = '';
  coverImage: string | null = null;
  bookUrl: string = '';
  showReader: boolean = false;
  isLoading = false;
  private eBooksSubject = new BehaviorSubject<EBook[]>([]);
  eBooks$ = this.eBooksSubject.asObservable();

  private readonly indexedDBService = inject(BdService);
  private readonly ebookService = inject(EbooksService);
  private readonly ebookCommonService = inject(EbookCommonService);

  ngOnInit() {
    this.loadAllBooks();
  }

  async loadAllBooks() {
    this.isLoading = true;
    const books = await this.indexedDBService.loadAllBooks();
    const eBooks = await Promise.all(books.map((bookData: any) => {
      console.log(bookData);
      return bookData.data as EBook;
    }));
    this.eBooksSubject.next(eBooks);
    this.isLoading = false;
  }

  showSettings() {
    window.open("/index.html#page=crud", "_blank");
  }

  async onBookDoubleClick(book: EBook) {
    localStorage.setItem('currentBook', JSON.stringify(book));
    window.open(`/index.html#page=reader`, "_blank");
  }
}
