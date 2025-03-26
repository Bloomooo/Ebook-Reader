import { Injectable } from '@angular/core';
import { EBook } from '../../../models/ebook.models';

@Injectable({
  providedIn: 'root'
})
export class BdService {
  private readonly dbName = 'EbookLibrary';
  private readonly storeName = 'books';
  private readonly dbVersion = 2; // Increment version to force schema update

  /**
   * Open IndexedDB connection with explicit object store creation
   * @returns Promise resolving to IndexedDB database
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      // Explicitly create object store during version change
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Delete existing store if it exists to recreate
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // Create new object store with keyPath
        db.createObjectStore(this.storeName, {
          keyPath: 'name',
          autoIncrement: false
        });
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', event);
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  }

  /**
   * Save an eBook to IndexedDB
   * @param fileName Name of the file
   * @param data EBook data to save
   */
  async saveToIndexedDB(fileName: string, data: EBook): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.put({ name: fileName, data });

        request.onsuccess = () => {
          console.log('Book saved to IndexedDB');
          resolve();
        };

        request.onerror = (event: Event) => {
          console.error('Error saving book:', event);
          reject(new Error('Failed to save book'));
        };
      });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Load all books from IndexedDB
   * @returns Promise resolving to array of books
   */
  async loadAllBooks(): Promise<(EBook & { name: string })[]> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = (event: Event) => {
          console.error('Error retrieving books:', event);
          reject(new Error('Failed to retrieve books'));
        };
      });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Find a specific book by title
   * @param title Title of the book to find
   * @returns Promise resolving to the book or null
   */
  async findBook(title: string): Promise<EBook | null> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.openCursor();

        request.onsuccess = (event: Event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

          if (cursor) {
            const record = cursor.value;
            const book = record.data as EBook;

            if (book.title === title) {
              resolve(book);
              return;
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };

        request.onerror = (event: Event) => {
          console.error('Error retrieving book:', event);
          reject(new Error('Failed to retrieve book'));
        };
      });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Update an existing book in IndexedDB
   * @param book EBook to update
   * @returns Promise resolving when update is complete
   */
  async updateBook(book: EBook): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      return new Promise((resolve, reject) => {
        const request = store.openCursor();

        request.onsuccess = (event: Event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

          if (cursor) {
            const record = cursor.value;
            const existingBook = record.data as EBook;

            if (existingBook.title === book.title) {
              const updatedBook = {
                ...existingBook,
                ...book,
                currentPage: book.currentPage ?? existingBook.currentPage,
                pourcentage: book.pourcentage ?? existingBook.pourcentage
              };
              const updateRequest = cursor.update({
                name: record.name,
                data: updatedBook
              });

              updateRequest.onsuccess = () => {
                console.log('Book updated in IndexedDB');
                resolve();
              };

              updateRequest.onerror = (updateEvent: Event) => {
                console.error('Error updating book:', updateEvent);
                reject(new Error('Failed to update book'));
              };

              return;
            }

            cursor.continue();
          } else {
            reject(new Error(`Book with title ${book.title} not found`));
          }
        };

        request.onerror = (event: Event) => {
          console.error('Error finding book to update:', event);
          reject(new Error('Failed to find book for update'));
        };
      });
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
}
