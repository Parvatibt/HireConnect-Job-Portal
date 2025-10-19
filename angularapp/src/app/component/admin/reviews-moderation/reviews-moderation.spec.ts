import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsModerationComponent } from './reviews-moderation';

describe('ReviewsModeration', () => {
  let component: ReviewsModerationComponent;
  let fixture: ComponentFixture<ReviewsModerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsModerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
