import {
  Component,
  NgZone,
  ViewChild,
  EventEmitter,
  Output,
  OnInit,
  Input,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";

import * as _ from "lodash";
import { forkJoin } from "rxjs";
import { Router,ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "../../services/auth/user.service";
import { v1 } from 'uuid';

// Declear jquery
declare var jQuery: any;
declare var stripe: any;
declare var elements: any;

@Component({
  selector: "app-upgrade-subscription",
  templateUrl: "./upgrade-subscription.component.html",
  styleUrls: ["./upgrade-subscription.component.sass"],
})
export class UpgradeSubscriptionComponent implements OnInit {

  @ViewChild("cardInfo") cardInfo: ElementRef;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  cardForm: any;

  @Input() adressType: string;
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  userForm;
  userPaymentForm;
  url: string = environment.config.API_URL;
  CID: Number = environment.config.CID;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean =
    environment.config.GOOGLE_PLACES_SEARCH_API;
  ASK_CATEGORIES_ON_SIGNUP: boolean =
    environment.config.ASK_CATEGORIES_ON_SIGNUP;
  PAID_SIGNUP: boolean = environment.config.PAID_SIGNUP;
  PAID_SIGNUP2: boolean = environment.config.PAID_SIGNUP;
  FREE_SIGNUP: boolean = false;
  CURRENCY: string = environment.config.CURRENCY;
  ASK_ADDRESS: boolean = environment.config.ASK_ADDRESS;
  ASK_PHONE: boolean = environment.config.ASK_PHONE;
  IS_STORE: boolean = environment.config.IS_STORE;
  APP_URL: string = environment.config.APP_URL;
  PackagesList: any;
  CountriesList: any;
  currentUser: any;
  user_package: any;
  statesList: any;
  queryWait: boolean;
  address: Object;
  formattedAddress: string;
  Phone: any;
  localStorage: any;
  HaveCouponCode: boolean;
  CouponCode: string;
  CouponCodeApplied: boolean;
  CouponDiscount: any;
  CouponCodeData: any;
  Discounted_Price: any;
  SelectedPlan: any;
  Is100Discount: boolean = false;
  Total_Amount: any;
  PackageSlug: any;
  Package: any;
  PackageID: any;
  SignupData: any;
  PaymentPage: boolean = false;
  userData: any;
  UserToken: any;

  constructor(
    private UserService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone,
    private cd: ChangeDetectorRef
  ) {
    // Set translate language
    translate.setDefaultLang("en");
  }

  ngOnInit() {
    this.Package = {};
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;

      // get user token
      this.UserToken = localStorage.getItem("token");
    });
    this.CouponCodeApplied = false;
    this.CouponDiscount = 0;
    this.Is100Discount = false;
    this.PaymentPage = false;

    this.route.paramMap.subscribe((params) => {
      this.PackageSlug = params.get("package");
      if (this.PackageSlug) {
        // This service for get membership package details
        //this.getSelectedPlanDetail();
      } else {
        this.changeRouter("member/subscription");
      }
    });
    
    this.userForm = this.formBuilder.group(
      {
        couponcode: [""],
      }
    );

    // This service for get membership packages
    this.getUserData();
  }

  ngAfterViewInit() {
    
    this.card = elements.create("card", {
      hidePostalCode: true,
    });
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener("change", this.cardHandler);
    
  }

  ngOnDestroy() {
    this.card.removeEventListener("change", this.cardHandler);
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

  async getToken(formDt) {
    if (this.PAID_SIGNUP) {
      const { source, error } = await stripe.createSource(this.card);
      if (error) {
        this.toastr.error(error.message, "Error!");
      } else {
        this.onSubmit(source, formDt);
      }
    } else {
        this.onSubmit("", formDt);
    }
  }

  onSubmit(token:any, customerData: any) {
    if (this.PackageID) {
      customerData["CID"] = this.CID;
      customerData['userID'] = this.userData.id;
      customerData["role_id"] = "4";
      customerData["cardToken"] = token ? token.id : "";
      customerData["paid"] = this.PAID_SIGNUP;
      customerData["Currency"] = this.CURRENCY;
      customerData["IS_STORE"] = this.IS_STORE;
      customerData["CouponCodeApplied"] = this.CouponCodeApplied;
      customerData["CouponDiscount"] = this.CouponDiscount;
      customerData["Coupon"] = this.CouponCodeData;
      customerData["Is100Discount"] = this.Is100Discount;
      customerData["PackageID"] = this.PackageID;
      customerData["SellerPackage"] = this.Package.SellerPackage;
      customerData["ProfileLink"] = this.APP_URL+'/member/subscription';

      this.UserService.upgradeSubscription(customerData).subscribe(
        (res2) => {
          this.toastr.success('Subscription Updated', "Success!");
          //this.changeRouter("member/subscription");
          //window.location.href = location.origin + '/member/subscription';
          if (this.userData) {
            let dataObj = {
              cid: this.CID,
              userId: this.userData.id,
            };
            this.UserService.getUserData(dataObj).subscribe(
              (res) => {
                if (res && res.data) {
                  
                  this.currentUser = res.data;
                  this.user_package = res.user_package;
                  
                  localStorage.setItem("user", JSON.stringify(res.data));
                  
                  this.UserService.setUserDataList();

                  if(res2.staccreate){
                    //window.location.href = res2.staclink;
                    window.location.href = location.origin + '/member/subscription';
                  }else{
                    window.location.href = location.origin + '/member/subscription';
                  }
                  
                } else {
                  this.currentUser = [];
                }
              },
              (error) => {
                this.currentUser = [];
              }
            );
          }
          
        },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, "Error!");
          }
        }
      );
    }
  }

  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
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
        userId: this.userData.id,
      };
      this.UserService.getUserData(dataObj).subscribe(
        (res) => {
          if (res && res.data) {
            console.log(res);
            this.currentUser = res.data;
            this.user_package = res.user_package;
            
            if (this.PackageSlug) {
                // This service for get membership package details
                this.getSelectedPlanDetail();
            }
            
            
          } else {
            this.currentUser = [];
          }
        },
        (error) => {
          this.currentUser = [];
        }
      );
    }
  }

  // get plan detail
  getSelectedPlanDetail(): void {
    if (this.userData) {
      let dataObj = {
        CID: this.CID,
        PackageSlug: this.PackageSlug,
      };
      this.UserService.getPackageDetail(dataObj).subscribe(
        (res) => {
          if (res && res.data && res.data.length) {
            
            this.Package = res.data[0];
            this.PackageID = res.data[0].ID;
            if(this.Package && this.Package.DiscountType == ''){
                this.Total_Amount = parseFloat(res.data[0].Package_Price);
            }else{
                this.Total_Amount = res.data[0].Package_Price = parseFloat(res.data[0].Discount_Price);
            }
            this.SelectedPlan = res.data[0];
            
            let TotAmount = 0;
            if(this.user_package && this.user_package.DiscountType == ''){
                TotAmount = parseFloat(this.user_package.Package_Price);
            }else{
                TotAmount = this.user_package.Package_Price = parseFloat(this.user_package.Discount_Price);
            }
            console.log(this.Total_Amount);
            console.log(TotAmount);
            console.log(this.user_package);
            if(this.user_package && this.user_package.Payment_CustomerID != '' && this.user_package.PackageAmount > 0){
                this.PAID_SIGNUP = false;
                this.FREE_SIGNUP = true;
            }else{
                console.log('last package was free');
                if(this.user_package.PackageAmount == 0 && this.user_package.PackageActive == 0 && this.Total_Amount == 0){
                    this.PAID_SIGNUP = false;
                    this.FREE_SIGNUP = true;
                }
            }
            
            
            
          } else {
            this.Package = {};
          }
        },
        (error) => {
          this.Package = {};
        }
      );
    }
  }

  // get membership packages
  get_packages() {
    // Set conditions
    let cond = {
      CID: this.CID,
    };
    this.UserService.getMembershipPackages(cond).subscribe(
      (res: any) => {
        if (!res.error) {
          this.PackagesList = res.data;
        } else {
          this.PackagesList = [];
        }
      },
      (error) => {}
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  getCouponValue(value) {
    if (value != "") {
      this.CouponCode = value;
      this.HaveCouponCode = true;
    } else {
      this.HaveCouponCode = false;
    }
  }

  // apply coupon code
  ApplyCoupon(): void {
    this.Is100Discount = false;
    if (this.CouponCode && this.CouponCode != "") {
      let cond = {
        CouponCode: this.CouponCode,
        CID: this.CID,
        PackageID: this.PackageID,
      };
      this.UserService.getCoupon(cond).subscribe(
        (res1) => {
          if (res1 && res1.data) {
            if (res1.data.CouponDiscountType == "amount") {
              this.CouponDiscount = res1.data.CouponDiscount;
            } else {
              this.CouponDiscount = (this.Package.Discount_Price * res1.data.CouponDiscount) / 100;
            }
            console.log(this.Package.Discount_Price +'-'+ this.CouponDiscount);
            this.Discounted_Price = this.Package.Discount_Price - this.CouponDiscount;

            if (this.Discounted_Price == 0) {
              this.Is100Discount = true;
              if (this.Package.Package_Days == "99999") {
                this.PAID_SIGNUP = false;
              }
            }

            this.CouponCodeData = res1.data;

            // Display message
            this.translate.get("COUPON_APPLIED_SUCCESSFULLY").subscribe((res: string) => {
                this.toastr.success(res, "Success!");
              });
            this.CouponCodeApplied = true;
            
          } else {
            
            this.translate.get("INVALID_COUPON_CODE").subscribe((res: string) => {
                this.toastr.error(res);
            });
            
          }
          
          
        },
        (error) => {
          // Reset value for service
          if (error.error.error) {
            this.toastr.error(error.error.error, "Error!");
          }
        }
      );
    } else {
      this.toastr.error("Please Enter Coupon Code.", "Error!");
    }
  }

  // apply coupon code
  RemoveCoupon(): void {
    if (this.CouponCodeApplied) {
      if (this.Package.Package_Days == "99999") {
        this.PAID_SIGNUP = this.PAID_SIGNUP2;
      }
      this.CouponCodeApplied = false;
      this.CouponCode = "";
      this.CouponDiscount = 0;
      this.Discounted_Price = parseFloat(this.Package.Package_Price);
      this.CouponCodeData = {};
      this.userForm.patchValue({
        couponcode: "",
      });
    }
  }
}
