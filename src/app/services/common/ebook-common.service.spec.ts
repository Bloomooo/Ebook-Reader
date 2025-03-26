import { TestBed } from '@angular/core/testing';

import { EbookCommonService } from './ebook-common.service';

describe('EbookService', () => {
  let service: EbookCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EbookCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
