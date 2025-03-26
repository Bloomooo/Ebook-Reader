import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {EBook} from '../../models/ebook.models';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {BdService} from '../services/bd/bd.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatMenu,
    MatMenuTrigger
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string | undefined;
  @Input() ebooks: EBook[] | undefined;

  @Output() onUpdateBook: EventEmitter<any> = new EventEmitter();

  private readonly indexedDBService = inject(BdService);

  terminateBook(book: EBook){
    book.pourcentage = book.pourcentage < 100 ? 100 : 0;
    this.indexedDBService.updateBook(book);
    this.onUpdateBook.emit();
  }
}
