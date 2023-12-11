import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddPaymentOptionComponent } from './add-payment-option.component';

describe('AddPaymentOptionComponent', () => {
  let component: AddPaymentOptionComponent;
  let fixture: ComponentFixture<AddPaymentOptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPaymentOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPaymentOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
