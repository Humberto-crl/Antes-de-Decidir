import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Situaciones } from './situaciones';

describe('Situaciones', () => {
  let component: Situaciones;
  let fixture: ComponentFixture<Situaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Situaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Situaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
