import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import ePub from 'epubjs';
import {EbookCommonService} from '../services/common/ebook-common.service';
import {EBook} from '../../models/ebook.models';
import {BdService} from '../services/bd/bd.service';

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

  private readonly dbService = inject(BdService);

  private readonly ebookCommonService = inject(EbookCommonService);

  constructor() {}

  ngOnInit(): void {
    const storedBook = localStorage.getItem('currentBook');
    if (storedBook) {
      const book: EBook = JSON.parse(storedBook);
      this.dbService.findBook(book.title).then((book: EBook | null) => {
        console.log(book);
        if(book !== null){
          this.loadBook(book.bookUrl as ArrayBuffer);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.book) {
      this.book.destroy();
    }
  }

  async loadBook(url : ArrayBuffer): Promise<void> {
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

  /**
   * Convert various book URL types to ArrayBuffer
   * @param bookUrl Book URL as Blob, base64 string, or ArrayBuffer
   * @returns Promise resolving to ArrayBuffer
   */
  async convertToArrayBuffer(bookUrl: string | Blob | ArrayBuffer): Promise<ArrayBuffer> {
    // If already an ArrayBuffer, return directly
    if (bookUrl instanceof ArrayBuffer) {
      return bookUrl;
    }

    // If it's a Blob, convert to ArrayBuffer
    if (bookUrl instanceof Blob) {
      return await this.blobToArrayBuffer(bookUrl);
    }

    // If it's a base64 string, convert to ArrayBuffer
    if (bookUrl.startsWith('data:') || this.isBase64(bookUrl)) {
      return this.base64ToArrayBuffer(this.extractBase64(bookUrl));
    }

    throw new Error('Unsupported book URL format');
  }

  /**
   * Convert Blob to ArrayBuffer
   * @param blob Blob to convert
   * @returns Promise resolving to ArrayBuffer
   */
  private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert Blob to ArrayBuffer'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Convert base64 string to ArrayBuffer
   * @param base64 Base64 encoded string
   * @returns ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const length = binary.length;
    const buffer = new ArrayBuffer(length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * Check if a string is base64 encoded
   * @param str String to check
   * @returns Boolean indicating if the string is base64
   */
  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  /**
   * Extract base64 data from a data URL
   * @param dataUrl Data URL
   * @returns Base64 encoded string
   */
  private extractBase64(dataUrl: string): string {
    // If it's a data URL, extract the base64 part
    if (dataUrl.startsWith('data:')) {
      return dataUrl.split(',')[1];
    }
    return dataUrl;
  }

}
