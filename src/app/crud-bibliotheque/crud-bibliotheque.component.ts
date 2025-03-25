import {Component, OnInit} from '@angular/core';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-crud-bibliotheque',
  imports: [
    MatFabButton,
    MatIcon
  ],
  templateUrl: './crud-bibliotheque.component.html',
  styleUrl: './crud-bibliotheque.component.css'
})
export class CrudBibliothequeComponent implements OnInit {

  ngOnInit(): void {
    console.log('crudBibliothequeComponent');
  }
}
