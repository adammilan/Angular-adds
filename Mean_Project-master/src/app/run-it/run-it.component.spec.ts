/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RunItComponent } from './run-it.component';

describe('RunItComponent', () => {
  let component: RunItComponent;
  let fixture: ComponentFixture<RunItComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunItComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunItComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
