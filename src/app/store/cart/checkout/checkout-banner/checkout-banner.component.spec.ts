import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckoutBannerComponent } from './checkout-banner.component';

describe('CheckoutBannerComponent', () => {
  let component: CheckoutBannerComponent;
  let fixture: ComponentFixture<CheckoutBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
