import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterProfile } from './recruiter-profile';

describe('RecruiterProfile', () => {
  let component: RecruiterProfile;
  let fixture: ComponentFixture<RecruiterProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
