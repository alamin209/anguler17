import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UpgradeSubscriptionComponent } from './upgrade-subscription.component';

describe('UpgradeSubscriptionComponent', () => {
  let component: UpgradeSubscriptionComponent;
  let fixture: ComponentFixture<UpgradeSubscriptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpgradeSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
