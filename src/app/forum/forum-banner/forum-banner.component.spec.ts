import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForumBannerComponent } from './forum-banner.component';

describe('ForumBannerComponent', () => {
  let component: ForumBannerComponent;
  let fixture: ComponentFixture<ForumBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
