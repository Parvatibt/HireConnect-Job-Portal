import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateOnboarding } from './candidate-onboarding';

describe('CandidateOnboarding', () => {
  let component: CandidateOnboarding;
  let fixture: ComponentFixture<CandidateOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateOnboarding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateOnboarding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
