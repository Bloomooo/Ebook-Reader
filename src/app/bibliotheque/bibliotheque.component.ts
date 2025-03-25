import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import ePub from 'epubjs';
import { Router } from '@angular/router';
import { EpubService } from '../services/epub/epub.service';
import { ReaderComponent } from '../reader/reader.component';

@Component({
  selector: 'app-bibliotheque',
  imports: [
    MatIcon,
    ReaderComponent,
  ],
  templateUrl: './bibliotheque.component.html',
  styleUrls: ['./bibliotheque.component.css'],
})
export class BibliothequeComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private readonly router: Router = inject(Router);
  private readonly epubService = inject(EpubService);

  bookTitle: string = '';
  bookAuthor: string = '';
  coverImage: string | null = null;
  bookUrl: string = '';
  showReader: boolean = false;

  downloadBook(): void {
    this.fileInput.nativeElement.click();
  }

  onEBookSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {


      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.bookUrl = reader.result as string;
      };
      reader.readAsArrayBuffer(file);
    }
  }

  openReader(): void {
    this.showReader = true;
  }

  openBlobInNewTab(blobUrl: string): void {
    window.open(blobUrl, '_blank');
  }

}
