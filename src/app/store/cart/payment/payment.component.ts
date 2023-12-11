import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/auth/user.service'
import { CountriesService } from '../../../services/countries/countries.service';
import * as _ from "lodash";
import { forkJoin } from 'rxjs';
import { HomeService } from '../../../services/home/home.service'

declare var stripe: any;
declare var elements: any;
declare let fbq:Function;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.sass']
})
export class PaymentComponent implements OnInit {

  @ViewChild('cardInfo') cardInfo: ElementRef;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;

  paymentForm: any;
  formData: any;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  FINANCING: boolean = environment.config.FINANCING;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  cartProductList: any;
  productCount: Number;
  subTotal: any;
  subTotal2: any;
  UserToken: string;
  userData: any;
  CountriesList: any;
  statesList: any;
  payment: any;
  checkout_data: any;
  BillingAddress: any;
  ShippingAddress: any;
  salesTax: any;
  totalOrderAmount: any;
  totalOrderAmount2: any;
  Total_Shipping: any;
  Total_Tax: any;
  shippingData: any;
  shippingTotal: Number;
  notifyValue: string;
  notesValue: string;
  PaymentOption: any;
  statusNotifyValue: boolean;
  orderNumber: string;
  TotalDiscount: any;
  HaveCouponCode: boolean;
  CouponCode: string;
  CouponCodeApplied: boolean;
  CouponDiscount: any;
  CouponCodeData: any;
  CouponApply_on: any
  Apply_on_productsList: any;
  CouponDiscountPerProduct: any;
  Cards: any;
  ShowCardForm: boolean;
  currentUser: any;
  ipAddress: any;
  TaxExemptApplied: any;
  CurrentuserData: any;
  serviceCodeList: any;
  SessionID:any;
  CartToken:any;
  localStorage:any;
  Digital_Items_in_Cart: boolean = false;
  Physical_Items_in_Cart: boolean = false;

  
  constructor(
    private router: Router,
    private StoreService: StoreService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private UserService: UserService,
    private CountriesService: CountriesService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private location: Location,
    private HomeService: HomeService
  ) {

    // Set translate language
    translate.setDefaultLang('en');
    // set empty value
    this.notifyValue = '';
    this.notesValue = '';
    this.CouponCode = '';
    this.CouponDiscount = 0;
    this.CouponCodeData = '';
    this.CouponApply_on = 0;
    this.Apply_on_productsList = [];
    this.CouponDiscountPerProduct = 0;
    this.TotalDiscount = 0;
  }

  ngOnInit() {

    this.SessionID = localStorage.getItem('SessionID')
    
    this.CartToken = '';
    this.route.paramMap.subscribe(params => {
        this.CartToken = params.get("token");
    });
    if(this.CartToken && this.CartToken != ''){
        this.SessionID = this.CartToken;
        this.getProductCartList();
    }
    
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      if (!(this.userData)) {
        let slug = "login?keyParms=payment";
        //this.changeRouter(slug);
        window.location.href = location.origin + '/checkout';
      } else {
      
        // save checkout data with cart
        this.SaveCheckoutDataCart();
        
        // calling get product info method
        //this.getCartSalesAndShipping();
        this.StoreService.castPaymentProductList.subscribe(res1 => {
            this.getCartSalesAndShipping();
        });
        this.getPaymentOptions();
        this.getUserData();
      }
      // get user token
      this.UserToken = localStorage.getItem('token');
    });


    this.paymentForm = this.formBuilder.group({
      cc_name: ['', Validators.required],
      cc_number: ['', Validators.required],
      cc_month: ['', Validators.required],
      cc_year: ['', Validators.required],
      cc_cvc: ['', Validators.required]
    });

    this.TaxExemptApplied = 0;

    this.HaveCouponCode = false;
    this.CouponCodeApplied = false;
    this.PaymentOption = '';
    this.ShowCardForm = false;

    // get ip address
    this.StoreService.getIPAddress().subscribe(res => {
      if (res && res.ip) {
        this.ipAddress = res.ip;
      }
    }, (err) => {
    });

    // get UPS code list
    //this.getUPSServiceCode();
    
    
    
  }

  // Get UPS service code
  /* getUPSServiceCode(): void {
     this.StoreService.getUPSServiceCode().subscribe(res => {
       if (res && res.data && res.data.length) {
         this.serviceCodeList = res.data;
       }
     }, (err) => {
     });
   }*/

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  ngAfterViewInit() {
    
    this.card = elements.create('card', {
        hidePostalCode: true
    });
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.cardHandler);
  }

  ngOnDestroy() {
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  // apply coupon code
  ApplyCoupon(): void {

    if (this.SessionID) {
      let dataObj = {
        CID: this.CID,
        SessionID: this.SessionID,
        CouponCode: this.CouponCode,
        cartProductList: this.cartProductList,
        subTotal: this.subTotal
      }
      this.StoreService.ApplyCoupon(dataObj).subscribe(res1 => {
        if (res1 && res1.data) {
          this.CouponDiscount = res1.data[0].Discount_Price;
          this.subTotal = this.subTotal - this.CouponDiscount;
          this.totalOrderAmount = this.totalOrderAmount - this.CouponDiscount;
          this.CouponCodeData = res1.data[0].COData;
          this.CouponApply_on = res1.data[0].Apply_on_products;
          this.Apply_on_productsList = res1.data[0].Apply_on_productsList;
          this.CouponDiscountPerProduct = res1.data[0].CouponDiscountPerProduct;
          // Display message 
          this.translate.get('COUPON_APPLIED_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
          this.CouponCodeApplied = true;
        } else {
          this.translate.get('INVALID_COUPON_CODE').subscribe((res: string) => {
            this.toastr.error(res);
          });
        }
      }, (error) => {
        // Reset value for service
        if (error.error.error) {
          this.toastr.error(error.error.error, 'Error!');
        }
      });
    }

  }

  // apply coupon code
  RemoveCoupon(): void {

    if (this.CouponCodeApplied) {
      this.subTotal = this.subTotal2;
      this.totalOrderAmount = this.totalOrderAmount2;
      this.CouponCodeApplied = false;
      this.CouponCode = '';
    }
  }

  // make payment now to complete the order
  MakePayment(token?: any) {
    if (this.SessionID && this.userData) {
    
      
          
      let cond = {
        SessionID: this.SessionID,
        CID: this.CID,
        CustomerID: this.userData.id,
        Guest_Checkout: this.userData.guest_user,
        cardToken: token ? token.id : "",
        Currency: 'USD',
        CustomerData: this.currentUser,
        CheckoutData: this.checkout_data,
        productCount: this.productCount,
        cartProductList: this.cartProductList,
        subTotal: this.subTotal,
        totalOrderAmount: this.totalOrderAmount,
        Total_Shipping: this.Total_Shipping,
        Total_Tax: this.Total_Tax,
        OrderID: this.orderNumber,
        salesTax: this.salesTax,
        Payment_Discount: this.TotalDiscount,
        CouponCodeApplied: this.CouponCodeApplied,
        CouponCode: this.CouponCode,
        CouponDiscount: this.CouponDiscount,
        CouponCodeData: this.CouponCodeData,
        CouponApply_on: this.CouponApply_on,
        Apply_on_productsList:this.Apply_on_productsList,
        CouponDiscountPerProduct: this.CouponDiscountPerProduct,
        Shipping_Method: 'UPS',
        IP_ADDRESS: (this.ipAddress) ? this.ipAddress : '',
        ShippingDiscount: this.shippingData.discount,
        ShippingSubTotal: this.shippingData.subAmount,
        ShippingTotal: this.shippingData.total,
        notifyValue: this.notifyValue,
        Extra_Info: this.notesValue,
        PaymentOption: this.PaymentOption,
        TaxExemptApplied: this.TaxExemptApplied,
        Physical_Items_in_Cart: this.Physical_Items_in_Cart,
        Digital_Items_in_Cart: this.Digital_Items_in_Cart
      };

      // calling service
      this.StoreService.MakePayment(cond)
        .subscribe(
          (res) => {
            // rest added product in cart 
            this.StoreService.setCartProductList('');
            localStorage.removeItem('checkout_data_' + this.SessionID);

            this.paymentForm.reset();
            this.translate.get('ORDER_SUCCESS').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });

            let proids = [];
            
            if (this.cartProductList && this.cartProductList.length) {
              _.map(this.cartProductList, function (p) {
                proids.push({id:p.Product_ID,quantity:p.Product_Count});
              });
            }
            
            fbq('track', 'Purchase', 
              {
                value: this.totalOrderAmount, 
                currency: 'USD',
                contents: proids,
                content_type: 'product'
              }
            );

            

            if (this.orderNumber) {
              let OrderID = this.orderNumber;
              //this.changeRouter('member/order-detail/'+OrderID+'?Order=Success');

              window.location.href = location.origin + '/member/order-detail/' + OrderID + '?Order=Success';
            } else {
              this.changeRouter('shop');
            }


          },
          (error: any) => {
            if (error.error) {
              this.toastr.error(error.error.message, 'Error!');
            }
          }
        );
    } else {
      this.changeRouter('shop');
    }
  }

  async getToken() {
    if (this.PaymentOption) {
      let status = true;
      this.statusNotifyValue = false;
      if (!this.notifyValue) {
        status = false;
        this.statusNotifyValue = true;
      }

      if (status) {
        this.MakePayment();
      }
    } else {
      const { source, error } = await stripe.createSource(this.card);
      if (error) {
        this.toastr.error(error.message, 'Error!');
      } else {
        let status = true;
        this.statusNotifyValue = false;
        if (!this.notifyValue) {
          status = false;
          this.statusNotifyValue = true;
        }

        if (status) {
          this.MakePayment(source);
        }
      }
    }
  }

  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsDirty();

      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
  }

  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getCurrentUser(dataObj).subscribe(res => {
        if (res && res.data) {
          this.currentUser = res.data;
        } else {
          this.currentUser = [];
        }
      }, (error) => {
        this.currentUser = [];
      });
    }
  }

  // Get cart info with sales/shipping
  getCartSalesAndShipping(): void {
    if (this.SessionID && this.userData) {

      let checkoutdata: any = localStorage.getItem('checkout_data_' + this.SessionID);
      if (checkoutdata) {
        this.checkout_data = JSON.parse(checkoutdata);
        //console.log(this.checkout_data);
      } else {
        //this.changeRouter('checkout');
      }

      let dataObj = {
        cid: this.CID,
        SessionID: this.SessionID,
        userData: this.userData,
        checkout_data: this.checkout_data
      };
      // calling cart sales and shipping
      this.StoreService.getCartSalesAndShipping(dataObj).subscribe(res1 => {
        if (res1 && res1.data && res1.data.length) {
          this.productCount = res1.productCount;
          this.cartProductList = res1.data;
          this.subTotal = res1.subTotal;
          this.subTotal2 = res1.subTotal;
          this.totalOrderAmount = res1.totalOrderAmount;
          this.totalOrderAmount2 = res1.totalOrderAmount;
          this.Total_Shipping = res1.Total_Shipping;
          this.Total_Tax = res1.Total_Tax;
          this.salesTax = res1.salesTax;
          this.shippingData = res1.shippingData;
          this.orderNumber = res1.orderNumber;

          let _Physical_Items_in_Cart = false;
          let _Digital_Items_in_Cart = false;
          if (this.cartProductList && this.cartProductList.length) {
            _.map(this.cartProductList, function (v) {
              
              if (v.ProductType == 'Physical') {
                _Physical_Items_in_Cart = true;
              }
              if (v.ProductType == 'Digital') {
                _Digital_Items_in_Cart = true;
              }
              
            })
          }
          

          this.Physical_Items_in_Cart = _Physical_Items_in_Cart;
          this.Digital_Items_in_Cart = _Digital_Items_in_Cart;

          let TotalDiscount_ = 0;
          if (this.cartProductList && this.cartProductList.length) {
            _.map(this.cartProductList, function (cartItem) {
              if (cartItem && cartItem.Discount_Price > 0) {
                let TotalDiscount__ = (cartItem.Product_Price * cartItem.Product_Count) - (cartItem.Discount_Price * cartItem.Product_Count);
                TotalDiscount_ = TotalDiscount_ + TotalDiscount__;
              }
            })
          }

          this.TotalDiscount = TotalDiscount_.toFixed(2);

          // This service will fetch user address
          this.get_user_address();
          
          if (this.subTotal && this.subTotal < 30 && _Physical_Items_in_Cart) {
            //this.changeRouter('checkout');
            window.location.href = location.origin + '/checkout';
            this.translate.get('MIN_AMOUNT_ORDER_ERROR').subscribe((res: string) => {
                this.toastr.error(res,'Error!');
            });
            return;
          }
          
          
        } else {
          this.changeRouter('shop');
        }
      }, (error) => {
        this.changeRouter('shop');
      });
    } else {
      this.changeRouter('shop');
    }
  }
  
  // Get cart info 
  getProductCartList(): void {
    if (this.CartToken) {
      let dataObj = {
        cid: this.CID,
        SessionID: this.CartToken
      }
      this.StoreService.getProductCartInfo(dataObj).subscribe(res1 => {
        if (res1 && res1.data && res1.data.length) {
            // emit data with broadcast service
            this.StoreService.setCartProductList(res1);
        }
      }, (error) => {
        // Reset value for service
        this.StoreService.setCartProductList('');
      });
    }
  }

  // Get store list
  get_user_address(): void {
    let checkoutdata: any = localStorage.getItem('checkout_data_' + this.SessionID);
    if (checkoutdata) {
      this.checkout_data = JSON.parse(checkoutdata);
    }
  }
  getNotifymeValue(e): void {
    this.notifyValue = e.target.checked;
    this.statusNotifyValue = false;
  }
  additionalNotes(value): void {
    this.notesValue = value;
  }
  setPaymentOption(value): void {
    this.PaymentOption = value;
    if (value) {
      this.ShowCardForm = true;
    } else {
      this.ShowCardForm = false;
    }
  }

  getCouponValue(value) {
    if (value != '') {
      this.CouponCode = value;
      this.HaveCouponCode = true;
    } else {
      this.HaveCouponCode = false;
    }
  }

  // fetch payment options
  getPaymentOptions(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.fetchCards(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.Cards = res.data;
          if (this.Cards && this.Cards.length) {
            let defcard = false;
            _.map(this.Cards, function (Card) {
              if (Card.Default_Address == 1) {
                defcard = Card.ID;
              }
            })
            if (defcard) {
              this.PaymentOption = defcard;
              this.ShowCardForm = true;
            }
          }

        } else {
          this.Cards = [];
          this.ShowCardForm = false;
        }
      }, (error) => {
        this.ShowCardForm = false;
      });
    }
  }

  // open global popup
  openModal(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }

  // apply tax exemption
  ApplyExempt() {

    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          this.CurrentuserData = res.data;
		  this.UserService.setAccountDataList(res);
          if (this.CurrentuserData && this.CurrentuserData.CertCaptureUser == 0) {
            this.changeRouter('member/tax-exemption?back=checkout');
            this.toastr.error('Please Submit your Tax Exemption Certificate first', 'Error!');
          } else {

            // Set conditions
            let cond = {
              cid: this.CID,
              CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
              CertCaptureCustomerID: (this.CurrentuserData && this.CurrentuserData.id) ? this.CurrentuserData.CertCaptureCustomerID : ''
            };
            // calling service
            this.UserService.getCustomerCertificates(cond)
              .subscribe(res => {
                if (res && res.data && res.data.length) {
                  this.TaxExemptApplied = 1;
                  if (this.salesTax && this.salesTax.totalTax > 0) {
                    this.totalOrderAmount = this.totalOrderAmount - this.salesTax.totalTax;
                    this.salesTax.totalTax = 0.00;
                  }
                } else {
                  this.changeRouter('member/tax-exemption?back=payment');
                  this.toastr.error('Please Submit your Tax Exemption Certificate first', 'Error!');
                }
              }, (err) => {

              });

          }

        } else {
          this.CurrentuserData = [];
        }
      }, (error) => {
        this.CurrentuserData = [];
      });
    }
  }

  // save checkout data with cart 
  SaveCheckoutDataCart(): void {
    
    if (this.SessionID) {

        let checkoutdata: any = localStorage.getItem('checkout_data_' + this.SessionID);
        if (checkoutdata) {
            let checkout_data_json = JSON.parse(checkoutdata);
            let data = {
              SessionID: this.SessionID,
              checkout_data: checkoutdata
            }
            
            let dataObj = {
                CID: this.CID,
                SessionID: this.SessionID,
                checkout_data: checkout_data_json
            }
            this.StoreService.SaveCheckoutData(dataObj).subscribe(res => {
                if (res && res.data) {
                    console.log('saved checkout data with cart');
                }
            }, (err) => {

            });
        }
    }
    
  }
  
  // change ups shipping 
  SetOptionValue(code, item): void {
    let data = {
      code: code,
      item: item
    }
    // check data
    if (code && item) {
      this.StoreService.saveUPScode(data).subscribe(res => {
        if (res && res.data) {
          // update ups service code
          this.getCartSalesAndShipping();
        }
      }, (err) => {

      });
    }
  }
}
