import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import * as qs from 'qs';

// Import environment config file.
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Define the class property.
  private url: string = environment.config.API_URL
  private apikey: string = environment.config.APIKEY
  private httpOptions: any;
  private categoryList: any = new BehaviorSubject<[]>([]);
  castCategory = this.categoryList.asObservable();

  private aAttachmentList: any = new BehaviorSubject<[]>([]);
  castaAttachmentList = this.aAttachmentList.asObservable();
  // this for universal page content model
  private universalModel: any = new BehaviorSubject<[]>([]);
  castUniversalModel= this.universalModel.asObservable();

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey
      })
    };
  }

  /**
   * this service set category list for broadcasting.
   */
  setCategoryList(categoryList) {
    this.categoryList.next(categoryList);
  }
  /**
   * this service return categories list according to CID.
   */
  getCategories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_categories?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get featured categories 
  getFeaturedCategories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_featured_categories?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get all parents of child category
  getCategoryParents(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_category_parents?' + qs.stringify(cond), this.httpOptions);
  }

  // get accessory attachment types
  getAATypes(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_accessory_attachment_types?' + qs.stringify(cond), this.httpOptions);
  }

  /**
   * this service set category list for broadcasting.
   */
  setAATypes(aAList) {
    this.aAttachmentList.next(aAList);
  }

  /**
   * this service set global page content for broadcasting.
   */
  setUnvirsalPageContent(castUniversalModel) {
    this.castUniversalModel.next(castUniversalModel);
  }

  // get accessory attachment types
  getAATProduct(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_accessory_attachment_total_product?' + qs.stringify(cond), this.httpOptions);
  }

  
}

