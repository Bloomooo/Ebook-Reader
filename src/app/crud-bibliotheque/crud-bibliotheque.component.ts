import {Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import ePub, {Book} from 'epubjs';
import {EBook} from '../../models/ebook.models';
import {BehaviorSubject} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {EbooksService} from '../services/ebooks/ebooks.service';
import {BdService} from '../services/bd/bd.service';

@Component({
  selector: 'app-crud-bibliotheque',
  imports: [
    MatFabButton,
    MatIcon,
    AsyncPipe
  ],
  templateUrl: './crud-bibliotheque.component.html',
  styleUrl: './crud-bibliotheque.component.css'
})
export class CrudBibliothequeComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  bookUrl: string = '';
  book?: Book;
  rendition?: any;

  private eBooksSubject = new BehaviorSubject<EBook[]>([]);
  eBooks$ = this.eBooksSubject.asObservable();

  private readonly ebookService = inject(EbooksService)
  private readonly indexedDBService = inject(BdService);

  ngOnInit() {
    this.loadAllBooks();
  }

  downloadBook(): void {
    this.fileInput.nativeElement.click();
  }

  onEBookSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        await this.loadBook(arrayBuffer).then(async (ebook) => {
          await this.indexedDBService.saveToIndexedDB(file.name, ebook as EBook);
        });

      };

      reader.readAsArrayBuffer(file);
    }
  }

  async loadBook(data: ArrayBuffer): Promise<EBook | undefined> {
    let book: EBook | undefined;
    await this.ebookService.createEBook({ data }).then((ebook) => {
      this.updateEBooks(ebook);
      book = ebook;
    });

    return book;
  }

  async loadAllBooks() {
    const books = await this.indexedDBService.loadAllBooks();
    const eBooks = await Promise.all(books.map((bookData: any) => {
      console.log(bookData);
      return bookData.data as EBook;
    }));
    this.eBooksSubject.next(eBooks);
  }

  updateEBooks(newBook: EBook) {
    const currentEBooks = this.eBooksSubject.value;
    this.eBooksSubject.next([...currentEBooks, newBook]);
  }
}
