/* tslint:disable:no-unused-variable */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
describe('Component: App', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents().then(function () {
            fixture = TestBed.createComponent(AppComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    }));
    it('should create the app', async(function () {
        expect(component).toBeTruthy();
    }));
    it('should display the navigation bar correctly', function () {
        var de = fixture.debugElement.queryAll(By.css('a'));
        expect(de.length).toBe(2);
        expect(de[0].nativeElement.textContent).toContain('Home');
        expect(de[1].nativeElement.textContent).toContain('About');
        expect(de[0].attributes['routerLink']).toBe('/');
        expect(de[1].attributes['routerLink']).toBe('/about');
    });
});
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/app.component.spec.js.map