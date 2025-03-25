import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
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
  bookTitle: string = '';
  bookAuthor: string = '';
  coverImage: string | null = null;
  bookUrl: string = '';
  showReader: boolean = false;

  showSettings() {
    window.open("/index.html#page=crud", "_blank");
  }

  openReader(): void {
    this.showReader = true;
  }
}
