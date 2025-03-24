import {Component} from '@angular/core';
import {PageType} from '../models/enum/page.model';
import {HomeComponent} from './home/home.component';
import {BibliothequeComponent} from './bibliotheque/bibliotheque.component';
import {NavbarComponent} from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [
    HomeComponent,
    BibliothequeComponent,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  pageType: PageType = PageType.HOME;
  protected readonly PageType = PageType;

  changePage(pageType: PageType): void {
    this.pageType = pageType;
  }
}
