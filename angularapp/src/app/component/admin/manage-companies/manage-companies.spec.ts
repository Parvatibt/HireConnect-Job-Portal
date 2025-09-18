import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCompanies } from './manage-companies';

describe('ManageCompanies', () => {
  let component: ManageCompanies;
  let fixture: ComponentFixture<ManageCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCompanies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCompanies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
