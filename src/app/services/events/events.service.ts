import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import * as qs from 'qs';

// Import environment config file.
import { environment } from '../../../environments/environment';
import {IUser, IManufacturer, IForgotPassword, IResetPassword,IWishList,IUserAddress,ILikeVideo,IFavoriteVideo,IQueueVideo} from '../../client-schema';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  // Define the class property.
  private url: string = environment.config.API_URL
  private apikey: string = environment.config.APIKEY
  private httpOptions: any;

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey,
        authorization: localStorage.getItem("token") || "",
		'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
    };
  }

  
  //get videos
  getEvents(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get_events', Data, this.httpOptions);
  }

  //get videos
  getEventsList(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_events_shortcode?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  
  // Save Ticket
  SaveTicket(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'save_ticket', Data, this.httpOptions);
  }

  //get tickets
  getTickets(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_tickets?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  //get ticket
  getTicket(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_ticket?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  //close ticket
  CloseTicket(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "close_ticket?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  //get ticket Replies
  getTicketReplies(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_ticket_replies?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  
  // Save Ticket Reply
  SaveTicketReply(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'save_ticket_reply', Data, this.httpOptions);
  }
  
}

