import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });

  constructor(private http: Http) { }

  getAds(): Observable<any> {
    return this.http.get('/ads').map(res => res.json());
  }

  addAd(ad): Observable<any> {
    return this.http.post('/ad', JSON.stringify(ad), this.options);
  }

  editAd(ad): Observable<any> {
    return this.http.put(`/ad/${ad._id}`, JSON.stringify(ad), this.options);
  }

  deleteAd(ad): Observable<any> {
    return this.http.delete(`/ad/${ad._id}`, this.options);
  }

}
