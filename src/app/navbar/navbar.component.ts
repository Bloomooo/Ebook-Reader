import {Component, EventEmitter, Output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {PageType} from '../../models/enum/page.model';

@Component({
  selector: 'app-navbar',
  imports: [
    MatIcon
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() changePage: EventEmitter<PageType> = new EventEmitter();
  protected readonly PageType = PageType;
}
