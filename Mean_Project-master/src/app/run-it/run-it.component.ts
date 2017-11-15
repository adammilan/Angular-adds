import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators, FormBuilder} from "@angular/forms";
import {Http} from "@angular/http";
import {DataService} from "../services/data.service";
import {ToastComponent} from "../shared/toast/toast.component";

@Component({
  selector: 'app-run-it',
  templateUrl: './run-it.component.html',
  styleUrls: ['./run-it.component.css']
})
export class RunItComponent implements OnInit {

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


  setBorderColor(ad){
    if (ad.messageTemplatePath.toString() == "A") {
      return {
        borderColor: 'green'
      };
    }
    if (ad.messageTemplatePath.toString() == "B"){
      return{
        borderColor: 'red'
      };
    }
    if (ad.messageTemplatePath.toString() == "C"){
      return{
        borderColor: 'gold'
      };
    }
  }




  constructor(private http: Http,
              private dataService: DataService,
              public toast: ToastComponent,
              private formBuilder: FormBuilder) {
  }

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
      endDateWithTime: this.endDateWithTime,
      numOfdaysToShow: this.numOfdaysToShow
    });
  }



  getAds() {
    this.dataService.getAds().subscribe(
      data => this.ads = data,
      error => console.log(error),
      () => this.isLoading = false
    );
  }


}
