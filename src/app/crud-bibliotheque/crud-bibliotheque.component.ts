import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import ePub, {Book} from 'epubjs';
import {EBook} from '../../models/ebook.models';
import {BehaviorSubject} from 'rxjs';
import {AsyncPipe} from '@angular/common';

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
        this.loadBook(arrayBuffer);
        await this.saveToIndexedDB(file.name, arrayBuffer);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  loadBook(data: ArrayBuffer): void {
    this.book = ePub(data);
    this.rendition = this.book.renderTo("viewer", {
      width: "100%",
      height: "100%",
      spread: "always",
      flow: "paginated"
    });

    this.book.ready.then(() => {
      this.rendition.display();
    });
  }

  async saveToIndexedDB(fileName: string, data: ArrayBuffer) {
    const dbName = 'EbookLibrary';
    const storeName = 'books';

    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'name' });
      }
    };

    request.onsuccess = async (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put({ name: fileName, data });

      transaction.oncomplete = async () => {
        console.log('Livre enregistré dans IndexedDB');
        const ebook = await this.createEBook({ name: fileName, data });
        this.updateEBooks(ebook);
      };

      transaction.onerror = () => console.error('Erreur lors de l\'enregistrement');
    };

    request.onerror = () => console.error('Erreur lors de l\'ouverture de IndexedDB');
  }

  async loadAllBooks() {
    const dbName = 'EbookLibrary';
    const storeName = 'books';

    const request = indexedDB.open(dbName, 1);

    request.onsuccess = async (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
        const books = getAllRequest.result;
        const eBooks = await Promise.all(books.map((bookData: any) => this.createEBook(bookData)));
        this.eBooksSubject.next(eBooks);
      };

      getAllRequest.onerror = () => console.error('Erreur lors de la récupération des livres');
    };

    request.onerror = () => console.error('Erreur lors de l\'ouverture de IndexedDB');
  }

  async createEBook(bookData: any): Promise<EBook> {
    return new Promise(async (resolve) => {
      const book = ePub(bookData.data);

      book.ready.then(async () => {
        const metadata = await book.loaded.metadata;
        let coverBlobUrl = '';

        try {
          const coverHref = await book.coverUrl();

          if (coverHref) {
            coverBlobUrl = coverHref;
          }
        } catch (error) {
          console.warn("Impossible de charger la couverture du livre", error);
        }

        resolve({
          title: metadata.title || 'Titre inconnu',
          cover: coverBlobUrl,
          artist: metadata.creator || 'Auteur inconnu',
          pourcentage: 0
        });
      });
    });
  }





  updateEBooks(newBook: EBook) {
    const currentEBooks = this.eBooksSubject.value;
    this.eBooksSubject.next([...currentEBooks, newBook]);
  }
}
