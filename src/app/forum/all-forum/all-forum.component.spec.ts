import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AllForumComponent } from './all-forum.component';

describe('AllForumComponent', () => {
  let component: AllForumComponent;
  let fixture: ComponentFixture<AllForumComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllForumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
