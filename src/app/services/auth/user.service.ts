import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import * as qs from "qs";
import { Router } from "@angular/router";

// Import environment config file.
import { environment } from "../../../environments/environment";
import { IPinVideo } from "../../client-schema";

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
export class UserService {
  // Define the class property.
  private url: string = environment.config.API_URL;
  private apikey: string = environment.config.APIKEY;
  private CID: Number = environment.config.CID;
  private httpOptions: any;
  private previousUrl: any;
  private localStorage: any;

  private userData: any = new BehaviorSubject<[]>([]);
  castUserData = this.userData.asObservable();

  private accountData: any = new BehaviorSubject<[]>([]);
  castAccountDataList = this.accountData.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey,
        "Cache-Control":
          "no-cache, no-store, max-age=0, must-revalidate, post-check=0, pre-check=0",
        Pragma: "no-cache",
        Expires: "0",
      }),
    };
  }
  /**
   * this service set user data for broadcasting.
   */
  setUserDataList() {
    this.userData.next(JSON.parse(localStorage.getItem("user")));
  }

  /**
   * this service set previous url.
   */
  setPreviousUrl(url) {
    this.previousUrl = url;
  }

  setAccountDataList(item) {
    this.accountData.next(item);
  }

  /**
   * this service get previous url.
   */
  getPreviousUrl() {
    return this.previousUrl;
  }

  /**
   * this service set user data for broadcasting.
   */
  signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    let SessionID: any = localStorage.getItem("SessionID");
    // remove previous session data
    localStorage.removeItem("checkout_data_" + SessionID);
    this.setUserDataList();
    this.previousUrl = "";
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigateByUrl("", { replaceUrl: true });
  }
  /**
   * Register User
   */
  registerUser(userData: IUser): Observable<any> {
    return this.http.post<[]>(this.url + "sign_up", userData, this.httpOptions);
  }

  /**
   * Upgrade Subscription od a User
   */
  upgradeSubscription(data: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "user_subscription_upgrade",
      data,
      this.httpOptions
    );
  }

  /* Apply membership coupon code */
  getCoupon(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "coupon?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  /**
   * Register Premium User
   */
  registerPremiumUser(userData: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "sign_up_premium",
      userData,
      this.httpOptions
    );
  }

  /**
   * Login User
   */
  loginUser(userData: any): Observable<any> {
    return this.http.post<[]>(this.url + "login", userData, this.httpOptions);
  }
  /*** Register Manufacturer ***/
  registerManufacturer(data: any): Observable<any> {
    return this.http.post<[IManufacturer]>(
      this.url + "manufacturer_sign_up",
      data,
      this.httpOptions
    );
  }
  /**
   * this service will return user address.
   */
  getUserAddress(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_address?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  forgotPassword(data: IForgotPassword): Observable<any> {
    return this.http.post<[]>(this.url + "forgot_pass", data, this.httpOptions);
  }

  resetPassword(data: IResetPassword): Observable<any> {
    return this.http.post<[]>(this.url + "reset_pass", data, this.httpOptions);
  }

  getCurrentUserAddress(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_current_user_address?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  // check authentication
  public isAuthenticated(): boolean {
    const item = localStorage.getItem("token");
    let userData = JSON.parse(localStorage.getItem("user"));
    if (
      typeof item === "undefined" ||
      item === null ||
      (userData && userData.guest_user && userData.guest_user == "1")
    )
      return false;
    return true;
  }

  // get current user info
  getCurrentUser(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_current_user?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get paymemt options
  fetchCards(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_payment_options?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /*** update user information ***/
  editUserProfile(data: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "edit_user_profile",
      data,
      this.httpOptions
    );
  }

  /*** update user address ***/
  editAddress(data: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "edit_address",
      data,
      this.httpOptions
    );
  }

  // remove user address
  removeAddress(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "remove_address?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * password updated service
   */
  updatePassword(userData: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "update_password",
      userData,
      this.httpOptions
    );
  }

  // get current user orders
  getUserOrders(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_orders?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get current seller orders
  getSellerOrders(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_seller_orders?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get order details
  getOrderDetails(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_order_details?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get current user orders
  addToWishlist(Data: IWishList): Observable<any> {
    return this.http.post<[]>(
      this.url + "add_to_wishlist",
      Data,
      this.httpOptions
    );
  }

  // get order details
  getWishlist_Products(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_wishlist_products?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get order details
  removeProductFromWishlist(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "remove_product_from_wishlist?" + qs.stringify(cond),
      this.httpOptions
    );
  }
  // set default address
  updateDefaultAddress(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "update_default_address?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // set default address
  updateDefaultCard(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "update_default_card?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // remove user address
  DeleteCard(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "remove_card?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get payment option details
  getPaymentOptionDetails(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_payment_option?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get payment option details
  getDefaultPaymentOptionDetails(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_default_payment_option?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // save card api
  SavePaymentOption(data: any): Observable<any> {
    return this.http.post<[IUserAddress]>(
      this.url + "save_card_details",
      data,
      this.httpOptions
    );
  }

  // update card api
  UpdatePaymentOption(data: any): Observable<any> {
    return this.http.post<[IUserAddress]>(
      this.url + "update_card_details",
      data,
      this.httpOptions
    );
  }

  // get user default billing and shipping addresses
  getUserDefaultAddress(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_default_address?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /*** update default address ***/
  updateUserDefaultAddress(data: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "user_update_default_address",
      data,
      this.httpOptions
    );
  }

  /*** Validate user address ***/
  validateUserAddress(data: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "validate_user_address",
      data,
      this.httpOptions
    );
  }
  /**
   * Register Guest User
   */
  guestRegisterUser(userData: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "guest_sign_up",
      userData,
      this.httpOptions
    );
  }

  /**
   * Login Guest User
   */
  guestLoginUser(userData: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "guest_login",
      userData,
      this.httpOptions
    );
  }

  // create customer on cert catpure
  CertcreateCustomer(userData: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "create_customer",
      userData,
      this.httpOptions
    );
  }

  // get cert capture ecommerce token
  getEcommToken(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_ecomm_token?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get cert capture customer profile
  getCustomer(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_customer?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get cert capture customer certificates
  getCustomerCertificates(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_certificates?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get cert capture customer certificates
  getCustomerCertificateLink(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_certificate_link?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * this service active user account .
   */
  activatedNewAccount(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "activated_new_account?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /**
   * Contact us request save
   */
  saveContactRquest(IContactRequest: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "contact_us_request",
      IContactRequest,
      this.httpOptions
    );
  }

  /*** update user categories ***/
  editUserCategories(data: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "edit_user_categories",
      data,
      this.httpOptions
    );
  }

  /*** set My Interest category ***/
  setMyInterestCategory(data: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "set_user_interest_category",
      data,
      this.httpOptions
    );
  }

  /*** set My Interest All categories ***/
  setMyInterestAllCategories(data: any): Observable<any> {
    return this.http.post<[]>(
      this.url + "set_user_interest_all_categories",
      data,
      this.httpOptions
    );
  }

  /*** get Membership Packages ***/
  getMembershipPackages(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_membership_packages?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  /*** get Membership Package Details ***/
  getMembershipPackage(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_membership_package?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  getUserData(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_data?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  getPackageDetail(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_membership_package?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  cancelSubscription(Data): Observable<any> {
    return this.http.post<[]>(
      this.url + "user_subscription_cancel",
      Data,
      this.httpOptions
    );
  }

  getSubscription(Data): Observable<any> {
    return this.http.post<[]>(
      this.url + "user_subscription_get",
      Data,
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
  getUserPinnedPosts(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_pinned_posts?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // pin video
  PinPost(Data: IPinVideo): Observable<any> {
    return this.http.post<[]>(this.url + "pin_post", Data, this.httpOptions);
  }

  /**
   * Mark Stripe Account acctivated
   */
  st_account_status_update(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "st_account_status_update?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  getUserProducts(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_products_list?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  getProducTypesCount(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_product_types_count?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  GenerateStripeLink(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "generate_stripe_link?" + qs.stringify(cond),
      this.httpOptions
    );
  }


  getLeads(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_user_leads?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  getLead(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "get_lead?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  saveLead(data: IUser): Observable<any> {
    return this.http.post<[]>(
      this.url + "save_lead",
      data,
      this.httpOptions
    );
  }

  removeLead(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "remove_lead?" + qs.stringify(cond),
      this.httpOptions
    );
  }

}
