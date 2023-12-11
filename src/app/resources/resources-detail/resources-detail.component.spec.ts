import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourcesDetailComponent } from './resources-detail.component';

describe('ResourcesDetailComponent', () => {
  let component: ResourcesDetailComponent;
  let fixture: ComponentFixture<ResourcesDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
