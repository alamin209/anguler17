import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourcesCommentsComponent } from './comments.component';

describe('ResourcesCommentsComponent', () => {
  let component: ResourcesCommentsComponent;
  let fixture: ComponentFixture<ResourcesCommentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
