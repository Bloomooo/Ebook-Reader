import { Injectable } from '@angular/core';
import {EBook} from '../../../models/ebook.models';

@Injectable({
  providedIn: 'root'
})
export class BdService {

  private readonly dbName = 'EbookLibrary';
  private readonly storeName = 'books';

  async saveToIndexedDB(fileName: string, data: EBook) {

    const request = indexedDB.open(this.dbName, 1);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'name' });
      }
    };

    request.onsuccess = async (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put({ name: fileName,  data });

      transaction.oncomplete = async () => {
        console.log('Livre enregistré dans IndexedDB');
      };

      transaction.onerror = () => console.error('Erreur lors de l\'enregistrement');
    };

    request.onerror = () => console.error('Erreur lors de l\'ouverture de IndexedDB');
  }

  async loadAllBooks() {
    const dbName = 'EbookLibrary';
    const storeName = 'books';

    const request = indexedDB.open(dbName, 1);

    return new Promise<any[]>((resolve, reject) => {
      request.onsuccess = async (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => reject('Erreur lors de la récupération des livres');
      };

      request.onerror = () => reject('Erreur lors de l\'ouverture de IndexedDB');
    });
  }

  async findBook(title: string) {
    const request = indexedDB.open(this.dbName, 1);
    return new Promise<any>((resolve, reject) => {
      request.onsuccess = async (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(title);

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };

        getRequest.onerror = () => reject('Erreur lors de la récupération du livre');
      };

      request.onerror = () => reject('Erreur lors de l\'ouverture de IndexedDB');
    });
  }

}
