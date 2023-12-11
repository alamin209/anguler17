import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketplaceBnnerComponent } from './marketplace-banner.component';

describe('MarketplaceBnnerComponent', () => {
  let component: MarketplaceBnnerComponent;
  let fixture: ComponentFixture<MarketplaceBnnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceBnnerComponent ]
    })
    .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceBnnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
