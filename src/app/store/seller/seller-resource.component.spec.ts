import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SellerResourceComponent } from './seller-page.component';

describe('SellerResourceComponent', () => {
  let component: SellerResourceComponent;
  let fixture: ComponentFixture<SellerResourceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SellerResourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
