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
export class ResourcesService {
  
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

  // fetch TIP post
  getTipPost(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_tip_post?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch TIP posts
  getTipPosts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_tip_posts?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch news lists
  getResourcesList(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resources_list?' + qs.stringify(cond), this.httpOptions);
  }
  
  
  // fetch news lists
  getResourcesPosts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resources_posts?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch single resource
  getResourcesSingle(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resources_single?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch news lists
  getLatestResources(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_news?' + qs.stringify(cond), this.httpOptions);
  }
  
  //get resources categories, this is API call
  getResourcesCategories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'resources/categories?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch news detail
  getResourcesDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resources_details?' + qs.stringify(cond), this.httpOptions);
  }

  //get resources categories, this is for adding resource by members
  getResourcesCategoriesMember(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resource_categories?' + qs.stringify(cond), this.httpOptions);
  }

  //get resources tags, this is for adding resource by members
  getResourcesTagsMember(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resource_tags?' + qs.stringify(cond), this.httpOptions);
  }
  
  //get resources
  getAllResources(data: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "get-all-resources",
      data,
      this.httpOptions
    );
  }
  
  // fetch news detail
  getResourceComments(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_resources_comments?' + qs.stringify(cond), this.httpOptions);
  }
  
  // save product QA
  SaveResourcePostComment(data: IBlogPostComment): Observable<any> {
    return this.http.post<[IBlogPostComment]>(this.url + 'save_resources_post_comment', data, this.httpOptions);
  }

  // save product QA
  SaveResourcePostMember(data: IBlogPostComment): Observable<any> {
    return this.http.post<[IBlogPostComment]>(this.url + 'add_edit_resource_member', data, this.httpOptions);
  }

  // remove user resource
  DeleteResourcePostMember(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_resource?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  searchResources(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'search_resources?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch Product posts
  getProductPosts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_posts?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch Product posts
  getTrainingProducts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_training_products?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch resources by shortcode
  getLatestResourcesShortCode(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_resources_shortcode?' + qs.stringify(cond), this.httpOptions);
  }

  //get resources tags, this is for adding resource by members
  getCMProductTypes(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_types?' + qs.stringify(cond), this.httpOptions);
  }

}