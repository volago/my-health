import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogApiComponent } from './catalog-api.component';

describe('CatalogApiComponent', () => {
  let component: CatalogApiComponent;
  let fixture: ComponentFixture<CatalogApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogApiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
