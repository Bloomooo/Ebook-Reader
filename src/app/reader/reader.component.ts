import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import ePub from 'epubjs';

interface Chapter {
  label: string;
  href: string;
  pageStart?: number;
  pageEnd?: number;
}

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reader.component.html',
  styleUrl: './reader.component.css'
})
export class ReaderComponent implements OnInit, OnDestroy {
  @Input() bookUrl: string = '';
  @ViewChild('viewer', { static: true }) viewerElement!: ElementRef;

  private book: any;
  private rendition: any;

  currentChapter: number = 1;
  totalChapters: number = 1;
  currentLocation: any = null;
  bookMetadata: any = null;

  chapters: Chapter[] = [];

  currentPage: number = 1;
  totalPages: number = 1;

  themes = [
    { name: 'Default', background: '#ffffff', text: '#000000' },
    { name: 'Sepia', background: '#f4ecd8', text: '#5b4636' },
    { name: 'Dark', background: '#2b2b2b', text: '#e0e0e0' }
  ];
  currentTheme = this.themes[0];

  fontSizes = [12, 14, 16, 18, 20, 22];
  currentFontSize = 16;

  constructor() {}

  ngOnInit(): void {
    if (this.bookUrl) {
      this.loadBook(this.bookUrl);
    }
  }

  ngOnDestroy(): void {
    if (this.book) {
      this.book.destroy();
    }
  }

  async loadBook(url: string): Promise<void> {
    const arrayBuffer = await this.convertBlobToArrayBuffer(url);
    this.book = ePub(url);
    this.rendition = this.book.renderTo('viewer', {
      width: '100%',
      height: '100%',
      spread: 'auto',
      flow: 'paginated',
      manager: 'continuous'
    });

    this.rendition.themes.default({
      'body': {
        'color': this.currentTheme.text,
        'background': this.currentTheme.background,
        'font-size': `${this.currentFontSize}px`,
        'line-height': '1.5',
        'padding': '20px'
      }
    });

    this.rendition.display();

    this.book.ready.then(async () => {
      this.bookMetadata = this.book.package.metadata;
      this.totalChapters = this.book.spine.length;

      await this.extractChapters();

      await this.book.locations.generate(1024);
      this.totalPages = this.book.locations.total;

      this.rendition.on('relocated', (location: any) => {
        this.currentLocation = location;
        this.currentChapter = this.book.spine.indexOf(location.start.index) + 1;

        if (this.book.locations) {
          this.currentPage = this.book.locations.locationFromCfi(location.start.cfi);
        }
      });
    });

    this.book.loaded.catch((error: any) => {
      console.error('Error loading book:', error);
    });
  }

  private convertBlobToArrayBuffer(url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as ArrayBuffer);
          };
          reader.onerror = () => reject(new Error('Failed to read Blob as ArrayBuffer'));
          reader.readAsArrayBuffer(blob);
        })
        .catch(reject);
    });
  }

  async extractChapters(): Promise<void> {
    const navigation = await this.book.loaded.navigation;

    this.chapters = navigation.toc.map((item: any, index: number) => ({
      label: item.label.trim(),
      href: item.href,
      pageStart: index + 1,
      pageEnd: index + 2
    }));
  }

  nextPage(): void {
    if (this.rendition) {
      this.rendition.next();
    }
  }

  previousPage(): void {
    if (this.rendition) {
      this.rendition.prev();
    }
  }

  changeTheme(theme: any): void {
    this.currentTheme = theme;
    this.rendition.themes.default({
      'body': {
        'color': theme.text,
        'background': theme.background
      }
    });
  }

  changeFontSize(size: number): void {
    this.currentFontSize = size;
    this.rendition.themes.default({
      'body': {
        'font-size': `${size}px`
      }
    });
  }

  goToChapter(chapter: Chapter): void {
    if (chapter.href) {
      this.rendition.display(chapter.href);
    }
  }
}
