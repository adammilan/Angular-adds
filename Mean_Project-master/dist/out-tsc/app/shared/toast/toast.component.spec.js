import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToastComponent } from './toast.component';
describe('ToastComponent', function () {
    var component;
    var fixture;
    beforeEach(async(function () {
        TestBed.configureTestingModule({
            declarations: [ToastComponent]
        })
            .compileComponents();
    }));
    beforeEach(function () {
        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', function () {
        expect(component).toBeTruthy();
    });
    it('should not have message set nor DOM element', function () {
        expect(component.message.body).toBeFalsy();
        expect(component.message.type).toBeFalsy();
        var de = fixture.debugElement.query(By.css('div'));
        expect(de).toBeNull();
    });
    it('should set the message and create the DOM element', function () {
        var mockMessage = {
            body: 'test message',
            type: 'warning'
        };
        component.setMessage(mockMessage.body, mockMessage.type);
        expect(component.message.body).toBe(mockMessage.body);
        expect(component.message.type).toBe(mockMessage.type);
        fixture.detectChanges();
        var de = fixture.debugElement.query(By.css('div'));
        var el = de.nativeElement;
        expect(de).toBeDefined();
        expect(el.textContent).toContain(mockMessage.body);
        expect(el.className).toContain(mockMessage.type);
    });
});
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/shared/toast/toast.component.spec.js.map