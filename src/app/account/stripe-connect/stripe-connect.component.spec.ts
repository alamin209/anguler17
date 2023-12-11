import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StripeConnectComponent } from './stripe-connect.component';

describe('StripeConnectComponent', () => {
  let component: StripeConnectComponent;
  let fixture: ComponentFixture<StripeConnectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StripeConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
