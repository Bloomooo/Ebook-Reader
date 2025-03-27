import {Component, inject, OnInit} from '@angular/core';
import {HeaderComponent} from "../header/header.component";
import {BdService} from '../services/bd/bd.service';
import {EBook} from '../../models/ebook.models';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  private readonly dbService = inject(BdService);

  bookToContinue: EBook[] = [];
  bookFinished: EBook[] = [];
  isLoading = false;
  ngOnInit(): void {
    this.loadAllBooks();
  }

  async loadAllBooks(): Promise<void> {
    this.isLoading = true;
    const books = await this.dbService.loadAllBooks();
    this.bookToContinue = await Promise.all(books.map((bookData: any) => {
      return bookData.data as EBook;
    }).filter(book => book.pourcentage !== 100)
      .sort((bookDesc, bookAsc) => bookAsc.pourcentage - bookDesc.pourcentage));


    this.bookFinished = await Promise.all(books.map((bookData: any) => {
      return bookData.data as EBook;
    }).filter(book => book.pourcentage === 100));
    this.isLoading = false;
  }

  updateComponent(): void {
    this.loadAllBooks();
  }
}
