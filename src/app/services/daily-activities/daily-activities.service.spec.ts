import { TestBed } from '@angular/core/testing';

import { DailyActivitiesService } from './daily-activities.service';

describe('DailyActivitiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DailyActivitiesService = TestBed.get(DailyActivitiesService);
    expect(service).toBeTruthy();
  });
});
