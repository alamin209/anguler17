import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPaymentOptionComponent } from './edit-payment-option.component';

describe('EditPaymentOptionComponent', () => {
  let component: EditPaymentOptionComponent;
  let fixture: ComponentFixture<EditPaymentOptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPaymentOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPaymentOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
