import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketplaceMarketplaceMobileFilterComponent } from './marketplace-mobile-filter.component';

describe('MarketplaceMobileFilterComponent', () => {
  let component: MarketplaceMobileFilterComponent;
  let fixture: ComponentFixture<MarketplaceMobileFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceMobileFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceMobileFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
