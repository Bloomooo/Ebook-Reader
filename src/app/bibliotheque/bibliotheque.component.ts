import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import * as pdfjsLib from 'pdfjs-dist';
import ePub from 'epubjs';

@Component({
  selector: 'app-bibliotheque',
  imports: [
    MatIcon,
  ],
  templateUrl: './bibliotheque.component.html',
  styleUrl: './bibliotheque.component.css'
})
export class BibliothequeComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  downloadBook(): void {
    this.fileInput.nativeElement.click();
  }

  onEBookSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      console.log(file);
    }
  }
}
