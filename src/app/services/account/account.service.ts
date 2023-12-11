import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import * as qs from "qs";
import { Router } from "@angular/router";

// Import environment config file.
import { environment } from "../../../environments/environment";
import {
  IUser,
  IManufacturer,
  IForgotPassword,
  IResetPassword,
  IWishList,
  IUserAddress,
} from "../../client-schema";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  // Define the class property.
  private url: string = environment.config.API_URL;
  private apikey: string = environment.config.APIKEY;
  private CID: Number = environment.config.CID;
  private httpOptions: any;
  private previousUrl: any;
  
  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey,
        'Cache-Control':  'no-cache, no-store, max-age=0, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }),
    };
  }
  getUserData(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_data?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  
  
  
  getUserChannels(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_channels?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  getUserLikes(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_likes?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  getUserWatchLater(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_watchlater?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  getUserFavorites(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_favorites?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  
  
  

}
