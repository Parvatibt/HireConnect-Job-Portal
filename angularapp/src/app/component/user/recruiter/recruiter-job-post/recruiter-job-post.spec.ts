import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterJobPost } from './recruiter-job-post';

describe('RecruiterJobPost', () => {
  let component: RecruiterJobPost;
  let fixture: ComponentFixture<RecruiterJobPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterJobPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterJobPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
