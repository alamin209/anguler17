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
import { environment } from "../../environments/environment";
import { MustMatch } from "./_helpers/must-match.validator";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { CountriesService } from "../services/countries/countries.service";
import { HomeService } from "../services/home/home.service";
import { StoreService } from "../services/store/store.service";
import { UserService } from "../services/auth/user.service";
import { v1 } from 'uuid';



declare let google: any;
declare let fbq:Function;


// Declear jquery
declare var jQuery: any;

declare var stripe: any;
declare var elements: any;

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.sass"],
})
export class SignUpComponent implements OnInit {
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
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  ASK_CATEGORIES_ON_SIGNUP: boolean = environment.config.ASK_CATEGORIES_ON_SIGNUP;
  PAID_SIGNUP: boolean = environment.config.PAID_SIGNUP;
  PAID_SIGNUP2: boolean = environment.config.PAID_SIGNUP;
  APP_URL: string = environment.config.APP_URL;
  FREE_SIGNUP: boolean = false;
  CURRENCY: string = environment.config.CURRENCY;
  ASK_ADDRESS: boolean = environment.config.ASK_ADDRESS;
  ASK_PHONE: boolean = environment.config.ASK_PHONE;
  IS_STORE: boolean = environment.config.IS_STORE;
  PackagesList: any;
  CountriesList: any;
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
  Total_Amount:any;
  PackageSlug:any;
  Package:any;
  PackageID:any;
  SignupData:any;
  PaymentPage: boolean = false;
  userData:any;
  UserToken:any;
  
  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone,
    private HomeService: HomeService,
    private StoreService: StoreService,
    private cd: ChangeDetectorRef
  ) {
    // Set translate language
    translate.setDefaultLang("en");
  }

  ngOnInit() {
  
    // brodcast data for login user
    this.userData = '';
    
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      if(this.userData){
        this.changeRouter('member/profile');
      }
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    
    this.CouponCodeApplied = false;
    this.CouponDiscount = 0;
    this.Is100Discount = false;
    this.PaymentPage = false;
    
    if (this.ASK_ADDRESS) {
      // This service subscribe countries list
      this.get_countries();

      // This service subscribe states list
      this.get_states(this.DEFAULT_COUNTRY);
    }

    this.route.paramMap.subscribe(params => {
        this.PackageSlug = params.get("package");
        if(this.PackageSlug){
            // This service for get membership package details
            this.get_package();
        }else{
            this.changeRouter('join-now');
        }
        
        
    });
    
    
    this.Phone = "";
    this.userForm = this.formBuilder.group(
      {
        company_name: [""],
        screen_name: ["", Validators.required],
        firstname: ["", Validators.required],
        lastname: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", [Validators.required]],
        occupation: [""],
        about: [""],
        address1: [""],
        address2: [""],
        state: [""],
        country: [""],
        city: [""],
        zip: [""],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmpass: ["", [Validators.required]],
        notifyme: [""],
        Longitude: [""],
        Latitude: [""],
        categories: [""],
        couponcode: [""],
        acceptpolicy: ["", [Validators.required]],
        saction: [""],
      },
      {
        validator: MustMatch("password", "confirmpass"),
      }
    );

    this.userForm.patchValue({
      country: this.DEFAULT_COUNTRY,
      saction:'signup'
    });

    jQuery(document).ready(function () {
      jQuery(".form-control:not('.email, .password')").keyup(function () {
        var _val = jQuery(this).val();
        var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
        jQuery(this).val(_txt);
      });
    });
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

  setPhoneValue(value) {
    if (value != "") {
      this.Phone = value.target.value;
    }
  }

  async getToken(formDt) {
    this.userForm.controls["phone"].setErrors(null);
    this.userForm.controls["address1"].setErrors(null);
    this.userForm.controls["address2"].setErrors(null);
    this.userForm.controls["city"].setErrors(null);
    this.userForm.controls["state"].setErrors(null);
    this.userForm.controls["zip"].setErrors(null);
    this.userForm.controls["country"].setErrors(null);
    this.userForm.controls["company_name"].setErrors(null);
    this.userForm.controls["occupation"].setErrors(null);
    this.userForm.controls["about"].setErrors(null);
    this.userForm.controls["saction"].setErrors(null);
    
    this.markFormGroupDirtied(this.userForm);
    if (this.userForm.valid) {

        if(parseFloat(this.Package?.Discount_Price) > 0){
          this.userForm.patchValue({
            saction:'pay'
          });
          this.PaymentPage = true;
          if(formDt.saction == 'pay'){
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
        }else{
          this.onSubmit("", formDt);
        }
        
    }
  }
  
  ChoosePlan(plan){
    this.SelectedPlan = plan;
    if(this.CouponCodeApplied){
        
        if(this.CouponCodeData.CouponDiscountType == 'amount'){
            this.CouponDiscount = this.CouponCodeData.CouponDiscount;
        }else{
            this.CouponDiscount = this.SelectedPlan.Package_Price*this.CouponCodeData.CouponDiscount/100;
        }
        this.Discounted_Price = this.SelectedPlan.Package_Price-this.CouponDiscount;
    }
  }
  
  getCouponValue(value) {
    if (value != '') {
      this.CouponCode = value.target.value;
      this.HaveCouponCode = true;
    } else {
      this.HaveCouponCode = false;
    }
  }
  
  // apply coupon code
  ApplyCoupon(): void {
    
    this.Is100Discount = false;
    if(this.CouponCode && this.CouponCode != ''){
      let cond = {
        CouponCode:this.CouponCode,
        CID:this.CID,
        PackageID:this.PackageID
      }
      this.UserService.getCoupon(cond).subscribe(res1 => {
        if (res1 && res1.data) {
        
          if(res1.data.CouponDiscountType == 'amount'){
            this.CouponDiscount = res1.data.CouponDiscount;
          }else{
            this.CouponDiscount = this.SelectedPlan.Package_Price*res1.data.CouponDiscount/100;
            
          }
          this.Discounted_Price = this.SelectedPlan.Package_Price-this.CouponDiscount;
          
          if(this.Discounted_Price == 0){
            this.Is100Discount = true;
            if(this.SelectedPlan.Package_Days == '99999'){
                this.PAID_SIGNUP = false;
            }
          }
          
          
          this.CouponCodeData = res1.data;
          
          
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
    }else{
        this.toastr.error('Please Enter Coupon Code.', 'Error!');
    }
    

  }

  // apply coupon code
  RemoveCoupon(): void {

    if (this.CouponCodeApplied) {
      if(this.SelectedPlan.Package_Days == '99999'){
        this.PAID_SIGNUP = this.PAID_SIGNUP2;
      }
      this.CouponCodeApplied = false;
      this.CouponCode = '';
      this.CouponDiscount = 0;
      this.Discounted_Price = parseFloat(this.SelectedPlan.Package_Price);
      this.CouponCodeData = {};
      this.userForm.patchValue({
        couponcode: '',
      });
      
    }
  }
  
  
  onSubmit(token, customerData: any) {
    //console.log(customerData);

    if (this.userForm.valid) {
      
      customerData["CID"] = this.CID;
      customerData["role_id"] = "1";
      customerData["country"] = "US";
      customerData["phone"] = this.Phone;
      customerData["cardToken"] = token ? token.id : "";
      customerData["paid"] = this.PAID_SIGNUP;
      customerData["Currency"] = this.CURRENCY;
      customerData["IS_STORE"] = this.IS_STORE;
      customerData["CouponCodeApplied"] = this.CouponCodeApplied;
      customerData["CouponDiscount"] = this.CouponDiscount;
      customerData["Coupon"] = this.CouponCodeData;
      customerData["Is100Discount"] = this.Is100Discount;
      customerData["PackageID"] = this.PackageID;
      customerData["ProfileLink"] = this.APP_URL+'/member/profile';
      customerData["CatLink"] = this.APP_URL+'/member/categories?sacc=1';
      
      this.UserService.registerUser(customerData).subscribe(
        (res) => {
          this.userForm.reset();
          this.translate
            .get("SIGNUP_SUCCESSS_MSG_MEMBER")
            .subscribe((res: string) => {
              this.toastr.success(res, "Success!");
            });
          
          fbq('track', 'CompleteRegistration');


          // redirect on custome thank you page
          this.changeRouter('thank-you/customer');
          
          // create login object
          let userLoginData = {
            CID: customerData.CID,
            email: customerData.email,
            password: customerData.password,
          };
          // calling login API
          this.UserService.loginUser(userLoginData).subscribe(
            (resp) => {
              if (resp && resp.token && resp.data) {
                // set data in localstorage
                localStorage.setItem("token", resp.token);
                localStorage.setItem("user", JSON.stringify(resp.data));
                // set user data using service
                this.UserService.setUserDataList();

                // update member id against added product in cart
                let checkItem: any = localStorage.getItem("SessionID");
                if (checkItem) {
                  let dataObj = {
                    CID: this.CID,
                    SessionID: checkItem,
                    MemberID: resp.data.id,
                  };
                  // update member ids again added product in cart
                  this.StoreService.updateMemberId(dataObj).subscribe(
                    (res1) => {},
                    (error) => {}
                  );
                }
                if(resp.data.stripe_acc_link){

                  window.location.href = location.origin +'/member/categories';

                  setTimeout(() => {
                    //window.location.href = resp.data.stripe_acc_link;
                  },1000);
                  
                }else{
                  window.location.href = location.origin +'/member/categories';
                }
              } else {
              }
            },
            (error: any) => {
              if (error.error.error) {
                this.toastr.error(error.error.error, "Error!");
              }
            }
          );
          
        },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, "Error!");
          }
        }
      );
    } else {
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
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get membership packages
  get_package() {
  
    // Set conditions
    let cond = {
        CID:this.CID,
        PackageSlug:this.PackageSlug
    }
    this.UserService.getMembershipPackage(cond).subscribe(
      (res: any) => {
        if (!res.error) {
          this.PackagesList = res.data;
          if (res.data && res.data.length) {
            
            this.Package = res.data[0];
            this.PackageID = res.data[0].ID;
            if(this.Package && this.Package.DiscountType == ''){
                this.Total_Amount = parseFloat(res.data[0].Package_Price);
            }else{
                this.Total_Amount = res.data[0].Package_Price = parseFloat(res.data[0].Discount_Price);
            }
            this.SelectedPlan = res.data[0];
            
            if(this.Total_Amount <= 0){
                this.PAID_SIGNUP = false;
                this.FREE_SIGNUP = true;
            }
            
            
            
          }
        } else {
          this.PackagesList = [];
        }
      },
      (error) => {}
    );
  }

  // get countries list from db
  get_countries() {
    this.CountriesService.getCountries().subscribe(
      (res: any) => {
        if (!res.error) {
          this.CountriesList = res.data;
        } else {
        }
      },
      (error) => {}
    );
  }

  // get states list from db
  get_states(country) {
    // Set conditions
    let cond = {
      country: country,
    };
    this.CountriesService.getStates(cond).subscribe(
      (res: any) => {
        if (!res.error) {
          this.statesList = res.data;
        } else {
        }
      },
      (error) => {}
    );
  }

  getAddress(place: object) {
    console.log(place);
    let address1 = "",
      streetNumber,
      street,
      city,
      state,
      country,
      postCode,
      Latitude,
      Longitude;
    streetNumber = this.getAddrComponent(place, { street_number: "long_name" });
    street = this.getAddrComponent(place, { route: "long_name" });
    country = this.getAddrComponent(place, { country: "short_name" });
    if (streetNumber) {
      address1 = streetNumber;
    }
    if (street) {
      address1 = address1 + " " + street;
    }

    city = this.getAddrComponent(place, { locality: "long_name" });
    state = this.getAddrComponent(place, {
      administrative_area_level_1: "long_name",
    });
    postCode = this.getAddrComponent(place, { postal_code: "long_name" });

    Latitude = place["geometry"]["location"].lat();
    Longitude = place["geometry"]["location"].lng();
    this.zone.run(() => (this.formattedAddress = place["formatted_address"]));

    jQuery(".address1").val(address1);
    this.userForm.controls["address1"].setValue(address1);
    this.userForm.controls["address2"].setValue("");
    this.userForm.controls["city"].setValue(city);
    this.userForm.controls["state"].setValue(state);
    this.userForm.controls["zip"].setValue(postCode);
    this.userForm.controls["country"].setValue(country);
    this.userForm.controls["Latitude"].setValue(Latitude);
    this.userForm.controls["Longitude"].setValue(Longitude);

    this.get_states(country);

    if (country == "TT") {
      this.userForm.controls.state.setValue("");
      this.userForm.controls.zip.setValue("");
    } else {
      this.userForm.controls.state.setValue(state);
      this.userForm.controls.zip.setValue(postCode);
    }

    jQuery(".address1").click();
  }

  getAddrComponent(place, componentTemplate) {
    let result;

    for (let i = 0; i < place.address_components.length; i++) {
      const addressType = place.address_components[i].types[0];
      if (componentTemplate[addressType]) {
        result = place.address_components[i][componentTemplate[addressType]];
        return result;
      }
    }
    return;
  }

  // open global popup
  openModal(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }
  // set value on change in address
  changeValue(event) {
    // set value
    this.userForm.patchValue({
      address1: event.target.value,
    });
  }

  // change ups shipping
  SetBillingCountry(value): void {
    this.get_states(value.target.value);
  }
  
  BackToSignup():void{
    this.userForm.patchValue({
      saction:'signup'
    });
    this.PaymentPage = false;
  }
  
}
