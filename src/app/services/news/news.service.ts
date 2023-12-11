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
export class NewsService {
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
  getNewsList(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_news_list?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch news detail
  getNewsDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_news_details?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch news detail
  getNewsComments(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_post_comments?' + qs.stringify(cond), this.httpOptions);
  }
  
  // save product QA
  SavePostComment(data: IBlogPostComment): Observable<any> {
    return this.http.post<[IBlogPostComment]>(this.url + 'save_post_comment', data, this.httpOptions);
  }
  
  // fetch news lists
  getLatestNews(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_news?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch news lists by shortcode
  getLatestNewsShortCode(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_news_shortcode?' + qs.stringify(cond), this.httpOptions);
  }

}
