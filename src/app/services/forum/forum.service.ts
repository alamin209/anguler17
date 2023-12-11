import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as qs from 'qs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import store type interface.

import {IUser, IManufacturer, IForgotPassword, IResetPassword,IWishList,IUserAddress,IBlogPostComment} from '../../client-schema';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
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

  // fetch forum lists
  getForumList(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_forums_list?' + qs.stringify(cond), this.httpOptions);
  }
  // fetch user forum Summary
  getForumSummary(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_forums_summary?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch user forum lists
  getuserForumList(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get_user_forums_list', Data, this.httpOptions);
  }
  
  
  
  // fetch forum detail
  getForumDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_forum_details?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch forum detail
  getForumComments(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_fpost_comments?' + qs.stringify(cond), this.httpOptions);
  }
  
  // save forum post
  SaveForumPost(data: IBlogPostComment): Observable<any> {
    return this.http.post<[IBlogPostComment]>(this.url + 'save_forum_post', data, this.httpOptions);
  }
  
  // save post comment
  SavePostComment(data: IBlogPostComment): Observable<any> {
    return this.http.post<[IBlogPostComment]>(this.url + 'save_fpost_comment', data, this.httpOptions);
  }
  
  // fetch latest forum lists
  getLatestForum(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_forum?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get Forum Categories
  getForumCategories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'forum/categories?' + qs.stringify(cond), this.httpOptions);
  }
  

}
