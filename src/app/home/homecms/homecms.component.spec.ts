import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomecmsComponent } from './homecms.component';

describe('HomecmsComponent', () => {
  let component: HomecmsComponent;
  let fixture: ComponentFixture<HomecmsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomecmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomecmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
