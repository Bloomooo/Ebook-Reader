import { Injectable } from '@angular/core';
import { EBook } from '../../../models/ebook.models';
import ePub from 'epubjs';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  async createEBook(bookData: any): Promise<EBook> {
    return new Promise(async (resolve) => {
      const book = ePub(bookData.data);

      await book.ready;
      const metadata = await book.loaded.metadata;
      let coverBlobUrl = '';
      let bookBlobUrl = '';

      try {
        const coverHref = await book.coverUrl();
        if (coverHref) {
          coverBlobUrl = coverHref;
        }

      } catch (error) {
        console.warn("Impossible de charger la couverture ou le fichier du livre", error);
      }

      resolve({
        title: metadata.title || 'Titre inconnu',
        cover: coverBlobUrl,
        artist: metadata.creator || 'Auteur inconnu',
        pourcentage: 0,
        bookUrl: bookData.data
      });
    });
  }

  private getBookBlob(data: ArrayBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const blob = new Blob([data], { type: 'application/epub+zip' });
      resolve(blob);
    });
  }
}
