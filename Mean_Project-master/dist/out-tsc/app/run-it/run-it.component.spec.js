import { async, TestBed } from '@angular/core/testing';
import { RunItComponent } from './run-it.component';
describe('RunItComponent', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [RunItComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(RunItComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/run-it/run-it.component.spec.js.map