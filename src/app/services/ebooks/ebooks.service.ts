import { Injectable } from '@angular/core';
import { EBook } from '../../../models/ebook.models';
import ePub from 'epubjs';

@Injectable({
  providedIn: 'root'
})
export class EbooksService {

  async createEBook(bookData: any): Promise<EBook> {
    const book = ePub(bookData.data);
    await book.ready;
    const metadata = await book.loaded.metadata;
    let coverBase64 = '';

    try {
      const coverHref = await book.coverUrl();
      if (coverHref) {
        // Récupère le blob depuis l'URL
        const blob = await fetch(coverHref).then(res => res.blob());
        // Convertit en base64
        coverBase64 = await this.blobToBase64(blob);
      }
    } catch (error) {
      console.warn("Erreur de chargement de la couverture", error);
    }

    return {
      title: metadata.title || 'Titre inconnu',
      cover: coverBase64,  // Utilise base64 au lieu de blob URL
      artist: metadata.creator || 'Auteur inconnu',
      pourcentage: 0,
      bookUrl: bookData.data,
      currentPage: 0
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}
