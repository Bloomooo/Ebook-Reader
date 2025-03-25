import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BdService {

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
      };

      transaction.onerror = () => console.error('Erreur lors de l\'enregistrement');
    };

    request.onerror = () => console.error('Erreur lors de l\'ouverture de IndexedDB');
  }

  // Charger tous les livres d'IndexedDB
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
}
