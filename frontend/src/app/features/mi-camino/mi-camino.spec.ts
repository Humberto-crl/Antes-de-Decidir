import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiCamino } from './mi-camino';

describe('MiCamino', () => {
  let component: MiCamino;
  let fixture: ComponentFixture<MiCamino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiCamino],
    }).compileComponents();

    fixture = TestBed.createComponent(MiCamino);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
