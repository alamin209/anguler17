import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as qs from 'qs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
// Import store type interface.
import { IStore } from '../../client-schema';
import { IUserAddress } from '../../client-schema';
import { IStorePayment } from '../../client-schema';
import { IProductReview } from '../../client-schema';
import { IProductQA } from '../../client-schema';


@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Define the class property.
  private url: string = environment.config.API_URL
  private apikey: string = environment.config.APIKEY
  private httpOptions: any;
  private cartProductList: any = new BehaviorSubject<[]>([]);
  castCartProductList = this.cartProductList.asObservable();

  private quickProduct: any = new BehaviorSubject<[]>([]);
  castQuickProduct = this.quickProduct.asObservable();
  
  private paymentProductList: any = new BehaviorSubject<[]>([]);
  castPaymentProductList = this.paymentProductList.asObservable();
  
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
  setCartProductList(item) {
    this.cartProductList.next(item);
  }
  /**
     * this service for update payment page product list.
  */
  setPaymentProductList(item) {
    this.paymentProductList.next(item);
  }
  
  
  /**
     * this service quick product item.
  */
  setQuickProductItem(item) {
    this.quickProduct.next(item);
  }
  /**
   * this service return store list CID.
   */
  getStorelist(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_featured_products?' + qs.stringify(cond), this.httpOptions);
  }

  /**
  * this service return product list CID.
  */
  getProductsList(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_products_list?' + qs.stringify(cond), this.httpOptions);
  } 

  /**
  * this service return product details.
  */
  getProductDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_details?' + qs.stringify(cond), this.httpOptions);
  }
  
  /**
 * this service return seller details.
 */
  getSellerInfo(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_seller_info?' + qs.stringify(cond), this.httpOptions);
  }
  /**
 * this service return product details.
 */
  getSellerdetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_seller_details?' + qs.stringify(cond), this.httpOptions);
  } 

  /**
* this service return related products.
*/
  getRelatedProducts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_related_products?' + qs.stringify(cond), this.httpOptions);
  }
  
   /**
 * this service return product documents.
 */
  getProductDocuments(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_documents?' + qs.stringify(cond), this.httpOptions);
  }
  
   /**
 * this service return product next and pre product.
 */
  getProductNextPrevProducts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_next_prev_pro?' + qs.stringify(cond), this.httpOptions);
  }
  
  /**
 * this service return product accessories.
 */
  getProductAccessories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_accessories?' + qs.stringify(cond), this.httpOptions);
  }
  
  /**
 * this service return product parts.
 */
  getProductParts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_parts?' + qs.stringify(cond), this.httpOptions);
  }
  
  /**
 * this service return product attributes.
 */
  getProductAttributes(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_attributes?' + qs.stringify(cond), this.httpOptions);
  }
  
  /**
 * this service return related products.
 */
  getSubProducts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_sub_products?' + qs.stringify(cond), this.httpOptions);
  }

  /**
* this service return total rating.
*/
  getTotalRating(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_total_rating?' + qs.stringify(cond), this.httpOptions);
  }

  /**
   * temporary add product in table
   */
  tmpAddToProduct(data: IStore): Observable<any> {
    return this.http.post<[IStore]>(this.url + 'tmp_add_to_product', data, this.httpOptions);
  }

  /**
  * this service return cart info.
  */
  getProductCartInfo(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_cart_info?' + qs.stringify(cond), this.httpOptions);
  }

  /**
  * this service remove cart item.
  */
  removeCartItem(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'remove_cart_item?' + qs.stringify(cond), this.httpOptions);
  }

  /**
  * this service return cart info.
  */
  getCartSalesAndShipping(cond): Observable<any> {
    return this.http.post<[]>(this.url + 'get_cart_sales_shipping', cond, this.httpOptions);
  }
  
  /**
   * Save user address
   */
  SaveUserAddress(data: IUserAddress): Observable<any> {
    return this.http.post<[IUserAddress]>(this.url + 'save_user_address', data, this.httpOptions);
  }
  
  /**
   * make payment api
   */
  ReviewOrder(data: any): Observable<any> {
    return this.http.post<[IStorePayment]>(this.url + 'review_order', data, this.httpOptions);
  }
  
  /**
   * make payment api
   */
  MakePayment(data: any): Observable<any> {
    return this.http.post<[IStorePayment]>(this.url + 'make_payment', data, this.httpOptions);
  }

  /**
   * temporary add product in table
  */
  updateMemberId(data: object): Observable < any > {
    return this.http.post<[]>(this.url + 'update_add_to_product', data, this.httpOptions);
  }
  
  // update cart function
  updateCart(data: object): Observable < any > {
    return this.http.post<[]>(this.url + 'update_cart', data, this.httpOptions);
  }
  
  // update cart function
  ApplyCoupon(data: object): Observable < any > {
    return this.http.post<[]>(this.url + 'apply_coupon', data, this.httpOptions);
  }
  
  // update cart function
  RemoveCoupon(data: object): Observable < any > {
    return this.http.post<[]>(this.url + 'remove_coupon', data, this.httpOptions);
  }

  searchProducts(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'search_products?' + qs.stringify(cond), this.httpOptions);
  }

  getStoreAttributes(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_store_attributes?' + qs.stringify(cond), this.httpOptions);
  }
  
  // save product review
  SaveProductReview(data: IProductReview): Observable<any> {
    return this.http.post<[IProductReview]>(this.url + 'save_product_review', data, this.httpOptions);
  }
  
  // fetch product reviews
  getProductReviews(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_reviews?' + qs.stringify(cond), this.httpOptions);
  }
  
  // save product QA
  SaveProductQA(data: IProductQA): Observable<any> {
    return this.http.post<[IProductQA]>(this.url + 'save_product_qa', data, this.httpOptions);
  }
  
  // fetch product QA
  getProductQA(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_qa?' + qs.stringify(cond), this.httpOptions);
  }

  

  // get ip address 
  getIPAddress(): Observable<any> {
    return this.http.get<{ ip: string }>('https://jsonip.com');
  }
  
  // fetch product tracking information 
  LTLTrackingProduct(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'ltl_tracking_request?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get product tracking data 
  getProductTrackingData(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_tracking_data?' + qs.stringify(cond), this.httpOptions);
  }
  // get product tracking data 
  getOrderInfo(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_order_info?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch product tracking information 
  UPStrackingProduct(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'ups_tracking_request?' + qs.stringify(cond), this.httpOptions);
  }

  /**
   * this for cancel order
   */
  cancelOrder(data: any): Observable<any> {
    return this.http.post<[IStorePayment]>(this.url + 'cancel_order', data, this.httpOptions);
  }


  // get UPS service code 
  getUPSServiceCode(): Observable<any> {
    return this.http.get<[]>(this.url + 'get_ups_service_code', this.httpOptions);
  }

  // save ups code
  saveUPScode(data: any): Observable<any> {
    return this.http.post<[any]>(this.url + 'save_ups_code', data, this.httpOptions);
  }
  
  // save ups code
  SaveCheckoutData(data: any): Observable<any> {
    return this.http.post<[any]>(this.url + 'save_checkout_data', data, this.httpOptions);
  }


  // get product image and attributes 
  getQPImageAttributes(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_qp_image_attributes?' + qs.stringify(cond), this.httpOptions);
  }

  // save product QA
  SaveProductSeller(data): Observable<any> {
    return this.http.post<[]>(this.url + 'add_edit_product_seller', data, this.httpOptions);
  }

  // remove user resource
  DeleteProductSeller(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_product_seller?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // fetch single product
  getProductSingle(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_products_single?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch single product images
  getProductImagesSingle(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_products_single_images?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch single product docs
  getProductDocsSingle(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_products_single_docs?' + qs.stringify(cond), this.httpOptions);
  }

  getStoreUPSPackagingTypes(cond): Observable<any>{
    return this.http.get<[]>(this.url + 'get_store_ups_packaging_types?' + qs.stringify(cond), this.httpOptions);
  }

  // remove product image
  deleteProductImagesSingle(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_product_image_single?" + qs.stringify(cond),
      this.httpOptions
    );
  } 

  // remove product docs
  deleteProductDocsSingle(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_product_doc_single?" + qs.stringify(cond),
      this.httpOptions
    );
  } 

  // remove order files
  deleteProductOrderFiles(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_product_order_files?" + qs.stringify(cond),
      this.httpOptions
    );
  } 

  // fetch single product order files
  getProductOrderFiles(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_product_order_files?' + qs.stringify(cond), this.httpOptions);
  }

  // save new order status
  ChangeOrderStatus(data: IProductReview): Observable<any> {
    return this.http.post<[IProductReview]>(this.url + 'change_order_status', data, this.httpOptions);
  }

  // fetch store channel details
  getChannelDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_store_channel_details?' + qs.stringify(cond), this.httpOptions);
  }
  

}