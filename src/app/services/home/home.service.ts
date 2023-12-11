import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import * as qs from "qs";
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from "rxjs";
// Import environment config file.
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  // Define the class property.
  private url: string = environment.config.API_URL;
  private apikey: string = environment.config.APIKEY;
  private httpOptions: any;
  private pageContentService: any = new BehaviorSubject<any>("");
  // this service for globale popup
  castPageContent = this.pageContentService.asObservable();

  private siteSettingsService: any = new BehaviorSubject<any>("");
  castSiteSettings = this.siteSettingsService.asObservable();

  constructor(
    @Inject(DOCUMENT) private dom,
    private http: HttpClient
  ) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey
      })
    };
  }

  /**
   * this service for globale popup
   */
  setPageContent(PageData) {
    this.pageContentService.next(PageData);
  }

  setSiteSettings(Data) {
    this.siteSettingsService.next(Data);
  }

  /**
   * this service return categories list according to CID.
   */
  getCmsPage(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_cms_page_content?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return menu list according to CID.
   */
  getMenu(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_menu?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return menu list according to CID.
   */
  getFooterMenu(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_footer?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return membership menu list according to CID.
   */
  getMembershipMenu(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_membership_menu?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return getFinancingPage page data.
   */
  getFinancingPage(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_financing_page_content?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return site setting according to CID.
   */
  getSettings(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_settings?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return categories list according to CID.
   **/
  getTestimonials(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_testimonials?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service return categories list according to CID.
   **/
  getFaqs(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_faqs?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // fetch testimonials by shortcode
  getTestimonialsShortCode(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_testimonials_shortcode?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // fetch category by shortcode
  getShortCodeByCategoryId(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_latest_category_shortcode?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service for define dynamic CanonicalURL on pages
   */
  createCanonicalURL(url?:string) {
    const head = this.dom.getElementsByTagName('head')[0];
    var element: HTMLLinkElement= this.dom.querySelector(`link[rel='canonical']`) || null
    if (element==null) {
      element= this.dom.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('rel','canonical')
    element.setAttribute('href',url)
  }

}
