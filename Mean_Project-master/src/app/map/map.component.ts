import {Component, OnInit, NgModule, ViewChild, ElementRef, NgZone} from '@angular/core';
import {FormGroup, FormControl, Validators, FormBuilder} from "@angular/forms";
import {Http} from "@angular/http";
import {DataService} from "../services/data.service";
import {ToastComponent} from "../shared/toast/toast.component";
import {BrowserModule} from "@angular/platform-browser";
import {AgmCoreModule, MapsAPILoader} from "angular2-google-maps/core";





@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{

  public searchControl: FormControl;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  //Added New
  ads = [];
  isLoading = true;

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
  messageLocation = new FormControl('', Validators.required);


  constructor(private http: Http,
              private dataService: DataService,
              public toast: ToastComponent,
              private formBuilder: FormBuilder,
              private ngZone: NgZone) {


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
      numOfdaysToShow: this.numOfdaysToShow,
      messageLocation: this.messageLocation

    });




  }



  setMap(ads) {
    var geocoder;
    var map;

    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeControl: true,
      mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
      navigationControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    if (geocoder) {
      for (let ad of ads) {
        geocoder.geocode({'address': ad.address}, function (results, status) {
          map.setCenter(results[0].geometry.location);

          var mark = new google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: ad.messageName,
            label: ad.messageName
          });


        });
      }
    }

    this.setAutocomplete(map);

  }


setAutocomplete(map: google.maps.Map){

  //create search FormControl
  this.searchControl = new FormControl();
  //load Places Autocomplete
  var autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
    autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }

        map.setCenter(place.geometry.location);
      });
    });



}


  getAds() {
    this.dataService.getAds().subscribe(
      data => this.ads = data,
      error => console.log(error),
      () => {this.isLoading=false;
      this.setMap(this.ads);

      }
    );
  }


  deleteAd(ad) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.dataService.deleteAd(ad).subscribe(
        res => {
          let pos = this.ads.map(elem => { return elem._id; }).indexOf(ad._id);
          this.ads.splice(pos, 1);
          this.toast.setMessage('item deleted successfully.', 'success');
          this.setMap(this.ads);
        },
        error => console.log(error)
      );
    }
  }

}



@NgModule({
  imports: [ BrowserModule, AgmCoreModule.forRoot() ],
  declarations: [ MapComponent ],
  bootstrap: [ MapComponent ]
})
export class AppModule {}
