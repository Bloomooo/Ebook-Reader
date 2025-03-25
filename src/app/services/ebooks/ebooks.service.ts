import { Injectable } from '@angular/core';
import {EBook} from '../../../models/ebook.models';
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
  }
}
