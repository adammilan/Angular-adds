import { async, TestBed } from '@angular/core/testing';
import { StaticsComponent } from './statics.component';
describe('StaticsComponent', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [StaticsComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(StaticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
});
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/statics/statics.component.spec.js.map