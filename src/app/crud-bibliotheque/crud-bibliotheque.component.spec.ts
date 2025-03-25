import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudBibliothequeComponent } from './crud-bibliotheque.component';

describe('CrudBibliothequeComponent', () => {
  let component: CrudBibliothequeComponent;
  let fixture: ComponentFixture<CrudBibliothequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudBibliothequeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudBibliothequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
