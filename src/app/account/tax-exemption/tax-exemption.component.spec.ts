import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxExemptionComponent } from './tax-exemption.component';

describe('TaxExemptionComponent', () => {
  let component: TaxExemptionComponent;
  let fixture: ComponentFixture<TaxExemptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxExemptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxExemptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
