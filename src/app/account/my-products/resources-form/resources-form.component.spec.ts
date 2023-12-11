import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResourcesFormComponent } from './resources-form.component';

describe('ResourcesFormComponent', () => {
  let component: ResourcesFormComponent;
  let fixture: ComponentFixture<ResourcesFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
