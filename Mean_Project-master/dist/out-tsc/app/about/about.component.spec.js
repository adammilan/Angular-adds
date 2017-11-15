import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AboutComponent } from './about.component';
describe('Component: About', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [AboutComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(AboutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
    it('should display the string "About" in h4', function () {
        var el = fixture.debugElement.query(By.css('h4')).nativeElement;
        expect(el.textContent).toContain('About');
    });
});
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/about/about.component.spec.js.map