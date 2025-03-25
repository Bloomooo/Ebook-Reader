import {Component, OnInit} from '@angular/core';
import {PageType} from '../models/enum/page.model';
import {HomeComponent} from './home/home.component';
import {BibliothequeComponent} from './bibliotheque/bibliotheque.component';
import {NavbarComponent} from './navbar/navbar.component';
import {ReaderComponent} from './reader/reader.component';
import {CrudBibliothequeComponent} from './crud-bibliotheque/crud-bibliotheque.component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    HomeComponent,
    BibliothequeComponent,
    NavbarComponent,
    ReaderComponent,
    CrudBibliothequeComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  pageType: PageType = PageType.HOME;
  protected readonly PageType = PageType;
  bookUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const hash = window.location.hash.substr(1);
    const hashParts = hash.split('#');

    let pageParam = '';
    let bookUrlParam = '';

    hashParts.forEach(part => {
      if (part.startsWith('page=')) {
        pageParam = part.split('=')[1];
      } else if (part.startsWith('bookUrl=')) {
        bookUrlParam = part.split('=')[1];
      }
    });

    if (pageParam) {
      this.setPageFromParam(pageParam);
    } else {
      window.location.hash = '#page=home';
    }

    if (bookUrlParam) {
      this.bookUrl = bookUrlParam;
      console.log('Book URL:', this.bookUrl);
    }
  }

  private setPageFromParam(pageParam: string): void {
    const pageMap: Record<string, PageType> = {
      'home': PageType.HOME,
      'bibliotheque': PageType.BIBLIOTHEQUE,
      'reader': PageType.READER,
      'crud': PageType.CRUD
    };

    if (pageMap[pageParam]) {
      this.pageType = pageMap[pageParam];
    }
  }

  changePage(pageType: PageType): void {
    this.pageType = pageType;
  }
}
