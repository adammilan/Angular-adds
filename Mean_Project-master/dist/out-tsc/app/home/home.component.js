var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastComponent } from '../shared/toast/toast.component';
import { DataService } from '../services/data.service';
export var HomeComponent = (function () {
    function HomeComponent(http, dataService, toast, formBuilder) {
        this.http = http;
        this.dataService = dataService;
        this.toast = toast;
        this.formBuilder = formBuilder;
        this.ads = [];
        this.isLoading = true;
        this.daysAvailable = ['Sunday', 'Monday',
            'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.ad = {};
        this.isEditing = false;
        this.messageName = new FormControl('', Validators.required);
        this.messageID = new FormControl('', Validators.required);
        this.messageText = new FormControl('', Validators.required);
        this.messagePics = new FormControl('', Validators.required);
        this.messageTemplatePath = new FormControl('', Validators.required);
        this.messageNumOfSeconds = new FormControl('', Validators.required);
        // messageTimeSet = new FormControl('', Validators.required);
        this.startDateWithTime = new FormControl('', Validators.required);
        this.endDateWithTime = new FormControl('', Validators.required);
        this.numOfdaysToShow = new FormControl('', Validators.required);
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.getAds();
        this.addAdForm = this.formBuilder.group({
            messageName: this.messageName,
            messageID: this.messageID,
            messageText: this.messageText,
            messagePics: this.messagePics,
            messageTemplatePath: this.messageTemplatePath,
            messageNumOfSeconds: this.messageNumOfSeconds,
            // messageTimeSet: this.formBuilder.group({
            // startDateTime: "",
            // endDateTime: "",
            // numOfdaysToShow: [""]
            //   }
            // )
            startDateWithTime: this.startDateWithTime,
            endDateWithTime: this.endDateWithTime,
            numOfdaysToShow: this.numOfdaysToShow
        });
    };
    HomeComponent.prototype.getAds = function () {
        var _this = this;
        this.dataService.getAds().subscribe(function (data) { return _this.ads = data; }, function (error) { return console.log(error); }, function () { return _this.isLoading = false; });
    };
    HomeComponent.prototype.addAd = function () {
        var _this = this;
        this.dataService.addAd(this.addAdForm.value).subscribe(function (res) {
            console.log(res.json());
            var newAd = res.json();
            _this.ads.push(newAd);
            _this.addAdForm.reset();
            _this.toast.setMessage('item added successfully.', 'success');
        }, function (error) { return console.log(error); });
    };
    HomeComponent.prototype.enableEditing = function (ad) {
        this.isEditing = true;
        this.ad = ad;
    };
    HomeComponent.prototype.cancelEditing = function () {
        this.isEditing = false;
        this.ad = {};
        this.toast.setMessage('item editing cancelled.', 'warning');
        // reload the ads to reset the editing
        this.getAds();
    };
    HomeComponent.prototype.editAd = function (ad) {
        var _this = this;
        this.dataService.editAd(ad).subscribe(function (res) {
            _this.isEditing = false;
            _this.ad = ad;
            _this.toast.setMessage('item edited successfully.', 'success');
        }, function (error) { return console.log(error); });
    };
    HomeComponent.prototype.deleteAd = function (ad) {
        var _this = this;
        if (window.confirm('Are you sure you want to permanently delete this item?')) {
            this.dataService.deleteAd(ad).subscribe(function (res) {
                var pos = _this.ads.map(function (elem) { return elem._id; }).indexOf(ad._id);
                _this.ads.splice(pos, 1);
                _this.toast.setMessage('item deleted successfully.', 'success');
            }, function (error) { return console.log(error); });
        }
    };
    HomeComponent = __decorate([
        Component({
            selector: 'app-home',
            templateUrl: './home.component.html',
            styleUrls: ['./home.component.css']
        }), 
        __metadata('design:paramtypes', [Http, DataService, ToastComponent, FormBuilder])
    ], HomeComponent);
    return HomeComponent;
}());
//# sourceMappingURL=D:/Files/WebstormProjects/My_Mean_Project/src/app/home/home.component.js.map