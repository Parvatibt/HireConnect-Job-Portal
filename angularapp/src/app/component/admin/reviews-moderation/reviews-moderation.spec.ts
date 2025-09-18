import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsModeration } from './reviews-moderation';

describe('ReviewsModeration', () => {
  let component: ReviewsModeration;
  let fixture: ComponentFixture<ReviewsModeration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsModeration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewsModeration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
