import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryCountComponent } from './category-count.component';

describe('CategoryCountComponent', () => {
  let component: CategoryCountComponent;
  let fixture: ComponentFixture<CategoryCountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
