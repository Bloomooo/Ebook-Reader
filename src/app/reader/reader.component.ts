import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import ePub from 'epubjs';
import {EbookCommonService} from '../services/common/ebook-common.service';
import {EBook} from '../../models/ebook.models';
import {BdService} from '../services/bd/bd.service';

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
  bookMetadata: any = null;

  currentPage: number = 1;
  totalPages: number = 1;
  currentBook: EBook | null = null;
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

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.saveBookProgressBeforeUnload.bind(this));

    const storedBook = localStorage.getItem('currentBook');
    if (storedBook) {
      const book: EBook = JSON.parse(storedBook);
      this.dbService.findBook(book.title).then((book: EBook | null) => {
        if(book !== null){
          this.currentBook = book;
          this.loadBook(book.bookUrl as ArrayBuffer, book);
        }
      });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.saveBookProgressBeforeUnload);

    if (this.book) {
      this.book.destroy();
    }
  }

  private saveBookProgressBeforeUnload(event: Event): void {
    if (this.currentBook && this.currentPage) {
      event.preventDefault();
      this.saveBookProgress();
    }
  }

  private saveBookProgress(): void {
    if (this.currentBook && this.currentPage) {
      const progressPercentage = Math.round((this.currentPage / this.totalPages) * 100);

      const updatedBook: EBook = {
        ...this.currentBook,
        currentPage: this.currentPage,
        pourcentage: progressPercentage
      };

      try {
        localStorage.setItem('currentBook', JSON.stringify(updatedBook));
      } catch (error) {
        console.error('Erreur localStorage:', error);
      }

      this.dbService.updateBook(updatedBook)
        .then(() => {
          console.log('Progression du livre sauvegardée avec succès');
        })
        .catch(error => {
          console.error('Erreur lors de la mise à jour du livre:', error);
        });
    }
  }

  async loadBook(url: ArrayBuffer, bookInfo: EBook): Promise<void> {
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

    try {
      await this.book.ready;

      await this.book.locations.generate(1024);

      this.totalPages = this.book.locations.total || 1;

      this.bookMetadata = this.book.package.metadata;
      this.totalChapters = this.book.spine.length;

      if (bookInfo && bookInfo.currentPage > 0) {
        const targetLocation = this.book.locations.locationFromCfi(
          this.book.locations.cfiFromLocation(bookInfo.currentPage)
        );

        if (targetLocation) {
          await this.rendition.display(
            this.book.locations.cfiFromLocation(targetLocation)
          );
          this.currentPage = targetLocation;
        } else {
          await this.rendition.display();
          this.currentPage = 1;
        }
      } else {
        await this.rendition.display();
        this.currentPage = 1;
      }

      this.rendition.on('relocated', (location: any) => {
        if (this.book.locations) {
          const currentPageLocation = this.book.locations.locationFromCfi(location.start.cfi);
          this.currentPage = currentPageLocation || 1;

          this.currentChapter = this.book.spine.indexOf(location.start.index) + 1;
        }
      });

    } catch (error) {
      console.error('Erreur lors du chargement du livre:', error);
      this.currentPage = 1;
      this.totalPages = 1;
    }
  }

  nextPage(): void {
    if (this.rendition && this.currentPage < this.totalPages) {
      this.rendition.next();
      this.currentPage = Math.min(this.currentPage + 1, this.totalPages);
    }
  }

  previousPage(): void {
    if (this.rendition && this.currentPage > 1) {
      this.rendition.prev();
      this.currentPage = Math.max(this.currentPage - 1, 1);
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
}
