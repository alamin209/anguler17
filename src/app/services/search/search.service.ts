import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as qs from 'qs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import store type interface.
import { IBlogPostComment } from '../../client-schema';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Define the class property.
  private url: string = environment.config.API_URL
  private apikey: string = environment.config.APIKEY
  private httpOptions: any;
  
  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey
      })
    };
  }

  // fetch news lists
  getSearchList(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_search_results?' + qs.stringify(cond), this.httpOptions);
  }
  

}
