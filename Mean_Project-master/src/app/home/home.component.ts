import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';

import { ToastComponent } from '../shared/toast/toast.component';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  ads = [];
  isLoading = true;

  ad = {};
  isEditing = false;

  addAdForm: FormGroup;
  messageName = new FormControl('', Validators.required);
  messageID = new FormControl('', Validators.required);
  messageText = new FormControl('', Validators.required);
  messagePics = new FormControl('', Validators.required);
  messageTemplatePath = new FormControl('', Validators.required);
  messageNumOfSeconds = new FormControl('', Validators.required);
  startDateWithTime = new FormControl('', Validators.required);
  endDateWithTime = new FormControl('', Validators.required);
  numOfdaysToShow = new FormControl('', Validators.required);
  address = new FormControl('', Validators.required);


  constructor(private http: Http,
              private dataService: DataService,
              public toast: ToastComponent,
              private formBuilder: FormBuilder) { }

  ngOnInit() {


    this.getAds();

    this.addAdForm = this.formBuilder.group({
      messageName: this.messageName,
      messageID: this.messageID,
      messageText: this.messageText,
      messagePics: this.messagePics,
      messageTemplatePath: this.messageTemplatePath,
      messageNumOfSeconds: this.messageNumOfSeconds,
      startDateWithTime: this.startDateWithTime,
      endDateWithTime:this.endDateWithTime,
      numOfdaysToShow:this.numOfdaysToShow,
      address:this.address

    });
  }


  getAds() {
    this.dataService.getAds().subscribe(
      data => this.ads = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }

  addAd() {
    this.dataService.addAd(this.addAdForm.value).subscribe(
      res => {
        console.log(res.json());
        let newAd = res.json();
        this.ads.push(newAd);
        this.addAdForm.reset();
        this.toast.setMessage('item added successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  enableEditing(ad) {
    this.isEditing = true;
    this.ad = ad;
  }

  cancelEditing() {
    this.isEditing = false;
    this.ad = {};
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the ads to reset the editing
    this.getAds();
  }

  editAd(ad) {
    this.dataService.editAd(ad).subscribe(
      res => {
        this.isEditing = false;
        this.ad = ad;
        this.toast.setMessage('item edited successfully.', 'success');
      },
      error => console.log(error)
    );
  }

  deleteAd(ad) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.dataService.deleteAd(ad).subscribe(
        res => {
          let pos = this.ads.map(elem => { return elem._id; }).indexOf(ad._id);
          this.ads.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
        },
        error => console.log(error)
      );
    }
  }

}
