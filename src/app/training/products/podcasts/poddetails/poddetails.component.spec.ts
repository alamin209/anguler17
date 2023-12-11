import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PoddetailsComponent } from './poddetails.component';

describe('PoddetailsComponent', () => {
  let component: PoddetailsComponent;
  let fixture: ComponentFixture<PoddetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PoddetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
