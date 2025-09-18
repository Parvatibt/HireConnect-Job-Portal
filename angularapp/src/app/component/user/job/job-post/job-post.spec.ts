import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostComponent} from './job-post';

describe('JobPost', () => {
  let component: JobPostComponent;
  let fixture: ComponentFixture<JobPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
