import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/auth/user.service'
import { CountriesService } from '../../../services/countries/countries.service';
import { MustMatch } from './_helpers/must-match.validator'; 
import { HomeService } from '../../../services/home/home.service'


// Declear jquery 
declare var jQuery: any;
declare let fbq:Function;

let billing_address;
let shipping_address;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.sass']
})
export class CheckoutComponent implements OnInit {

  checkoutForm: any;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  FINANCING: boolean = environment.config.FINANCING;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  cartProductList: any;
  productCount: Number;
  subTotal: any;
  UserToken: string;
  userData: any;
  statesList: any;
  countriesList: any;
  checkout: any;
  ShowShipping: boolean = false;
  ShowPassword: boolean
  addressList: any;
  defaultBillingaddresses: any;
  defaultshippingaddresses: any;
  SessionID: any;
  address: Object;
  formattedAddress: string;
  CurrentuserData:any;
  TaxExemptApplied:any;
  framRadio: any = 'Farm';
  ShippingPhone:any;
  BillingPhone:any;
  CartToken:any;
  localStorage:any;
  Digital_Items_in_Cart: boolean = false;
  Physical_Items_in_Cart: boolean = false;
  
  constructor(private router: Router,
    private StoreService: StoreService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private UserService: UserService,
    private CountriesService: CountriesService,
    private formBuilder: FormBuilder,
    public zone: NgZone,
    private route: ActivatedRoute,
    private HomeService: HomeService) {

    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {

    fbq('track', 'InitiateCheckout');
    this.SessionID = localStorage.getItem('SessionID')
    this.ShowPassword = false;
    this.userData = false;
    
    this.CartToken = '';
    this.route.paramMap.subscribe(params => {
        this.CartToken = params.get("token");
    });
    if(this.CartToken && this.CartToken != ''){
        this.SessionID = this.CartToken;
    }
    
    // brodcast data for login user
    this.userData = '';
    this.TaxExemptApplied = 0;
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      //if (!(this.userData)){
      //let slug = "login?redirect=checkout";
      // this.changeRouter(slug);
      // }else{
      // calling get product info method
      this.getProductCartList();

      // start form
      this.checkoutForm = this.formBuilder.group({
        new_address: [''],
        ShipToDiffAddress: [''],
        billing_company_name: [''],
        billing_first_name: ['', Validators.required],
        billing_last_name: ['', Validators.required],
        billing_email: ['', [Validators.required, Validators.email]],
        billing_phone: ['', Validators.required],
        billing_address1: ['', Validators.required],
        billing_address2: [''],
        billing_city: ['', Validators.required],
        billing_zip: [''],
        billing_state: [''],
        billing_country: ['', Validators.required],
        shipping_company_name: [''],
        shipping_first_name: ['', Validators.required],
        shipping_last_name: ['', Validators.required],
        shipping_email: ['', Validators.required],
        shipping_phone: ['', Validators.required],
        shipping_address1: ['', Validators.required],
        shipping_address2: [''],
        shipping_city: ['', Validators.required],
        shipping_zip: [''],
        shipping_state: [''],
        shipping_country: ['', Validators.required],
        type: ['Farm'],
        Pickup: [''],
        LoadingDock: [''],
        EqpUpload: [''],
        LiftGate: [''],
        CallAhead: [''],
        SemiTrucks: [''],
        Tax_Exempt: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmpass: ['', [Validators.required]],
      }, {
          validator: MustMatch('password', 'confirmpass')
        });
    
      // This service subscribe states list
      this.get_states(this.DEFAULT_COUNTRY);
      this.get_countries();

      this.checkoutForm.patchValue({
        billing_country: this.DEFAULT_COUNTRY,
        shipping_country: this.DEFAULT_COUNTRY,
      });
      if(!this.CartToken){
          let checkout_data: any = localStorage.getItem('checkout_data_' + this.SessionID);
          
          if (checkout_data) {
            checkout_data = JSON.parse(checkout_data);
            // set types 
            this.framRadio = (checkout_data && checkout_data.type) ? checkout_data.type : 'Farm';
            // set address
            this.ShowShipping = (checkout_data) ? checkout_data.ShipToDiffAddress : false;
            this.checkoutForm.patchValue({
              new_address: 'existing',
              ShipToDiffAddress: (checkout_data) ? checkout_data.ShipToDiffAddress : '',
              CallAhead: (checkout_data) ? checkout_data.CallAhead : '',
              EqpUpload: (checkout_data) ? checkout_data.EqpUpload : '',
              SemiTrucks: (checkout_data) ? checkout_data.SemiTrucks : '',
              LiftGate: (checkout_data) ? checkout_data.LiftGate : '',
              LoadingDock: (checkout_data) ? checkout_data.LoadingDock : '',
              Pickup: (checkout_data) ? checkout_data.Pickup : '',
              type: (checkout_data) ? checkout_data.type : '',
              billing_company_name: (checkout_data) ? checkout_data.billing_company_name : '',
              billing_first_name: (checkout_data) ? checkout_data.billing_first_name : '',
              billing_last_name: (checkout_data) ? checkout_data.billing_last_name : '',
              billing_email: (checkout_data) ? checkout_data.billing_email : '',
              billing_phone: (checkout_data) ? checkout_data.billing_phone : '',
              billing_address1: (checkout_data) ? checkout_data.billing_address1 : '',
              billing_address2: (checkout_data) ? checkout_data.billing_address2 : '',
              billing_city: (checkout_data) ? checkout_data.billing_city : '',
              billing_state: (checkout_data) ? checkout_data.billing_state : '',
              billing_country: (checkout_data) ? checkout_data.billing_country : '',
              billing_zip: (checkout_data) ? checkout_data.billing_zip : '',
              shipping_company_name: (checkout_data) ? checkout_data.shipping_company_name : '',
              shipping_first_name: (checkout_data) ? checkout_data.shipping_first_name : '',
              shipping_last_name: (checkout_data) ? checkout_data.shipping_last_name : '',
              shipping_email: (checkout_data) ? checkout_data.shipping_email : '',
              shipping_phone: (checkout_data) ? checkout_data.shipping_phone : '',
              shipping_address1: (checkout_data) ? checkout_data.shipping_address1 : '',
              shipping_address2: (checkout_data) ? checkout_data.shipping_address2 : '',
              shipping_city: (checkout_data) ? checkout_data.shipping_city : '',
              shipping_country: (checkout_data) ? checkout_data.shipping_country : '',
              shipping_state: (checkout_data) ? checkout_data.shipping_state : '',
              shipping_zip: (checkout_data) ? checkout_data.shipping_zip : '',
            });
            this.BillingPhone = (checkout_data) ? checkout_data.billing_phone : '';
            this.ShippingPhone = (checkout_data) ? checkout_data.shipping_phone : '';

            billing_address = (checkout_data) ? checkout_data.billing_address1 : '';
            setTimeout(() => {    
              jQuery("#billing_address .address1").val(billing_address);
              shipping_address = (checkout_data) ? checkout_data.shipping_address1 : '';
              jQuery("#shipping_address .address1").val(shipping_address);
            }, 300);
            
            this.get_states(checkout_data.billing_country);

            
          } else {
            
            // get default billing and shipping address
            this.get_default_addressess();
            
          }
      }

      // get user token
      this.UserToken = localStorage.getItem('token');

    });

    

    // This service will fetch user address
    this.get_user_address();

    
    // For Capitalization
    jQuery(document).ready(function () {
      jQuery(".form-control:not('.email')").keyup(function () {
        var _val = jQuery(this).val();
        var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
        jQuery(this).val(_txt);
      });
    });
  }

  

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  onSubmit(formData) {
    
    if (this.Physical_Items_in_Cart && this.subTotal && (this.subTotal < 30)) {
      
      this.changeRouter('checkout');
      this.translate.get('MIN_AMOUNT_ORDER_ERROR').subscribe((res: string) => {
          this.toastr.error(res,'Error!');
      });
      return;
    }


    this.checkoutForm.controls['billing_state'].setErrors(null);
    this.checkoutForm.controls['shipping_state'].setErrors(null);
    
    this.checkoutForm.controls['billing_zip'].setErrors(null);
    this.checkoutForm.controls['shipping_zip'].setErrors(null);
    this.checkoutForm.controls['billing_address2'].setErrors(null);
    this.checkoutForm.controls['billing_company_name'].setErrors(null);
    this.checkoutForm.controls['shipping_address2'].setErrors(null);
    this.checkoutForm.controls['shipping_company_name'].setErrors(null);
    // mange guest user password if not found in user data then we will create new user
    if ((this.userData && this.userData.id) || (this.ShowPassword == false)) {
      this.checkoutForm.controls['password'].setErrors(null);
      this.checkoutForm.controls['confirmpass'].setErrors(null);
    }
    this.markFormGroupDirtied(this.checkoutForm);
       
    // check validation
    if (this.checkoutForm.valid) {
      // set country
      if(formData['billing_country'] == 'TT'){
        formData['billing_state'] = '';
        formData['billing_zip'] = '';
      }
      if(formData['shipping_country'] == 'TT'){
        formData['shipping_state'] = '';
        formData['shipping_zip'] = '';
      }
      
      formData['shipping_phone'] = this.ShippingPhone;
      formData['billing_phone'] = this.BillingPhone;
      //console.log(formData);
      // check user address valid or not according to tax API
      this.UserService.validateUserAddress(formData).subscribe((res) => {
        // user data not found then need to create new user
        if (!this.userData) {
          // check status
          if (this.ShowPassword) {
            // call method for create new users
            this.createNewUsers(formData);
          } else {
            // call method for create new guest user
            this.guestNewUsers(formData);
          }
        } else {
        
            if (this.userData && this.userData.guest_user == 1) {
              // check status
              if (this.ShowPassword) {
                // call method for create new users
                this.createNewUsers(formData);
              } else {
                // call method for create new guest user
                this.guestNewUsers(formData);
              }
            }else{
                // this method review order and redirect on payment page.
                this.reviewCartOrder(formData);
            }
          
        }
      }, (error: any) => {
        if (error.error.error) {
          this.toastr.error(error.error.error, 'Error!');
        }
      });
    } else {
      this.toastr.error('Something is Wrong.!');
    }
  }

  // create new users 
  createNewUsers(formData): void {
    // check user data 
    if (formData) {
      // create new user data object
      let newUserObject = {
        company_name: (formData.billing_company_name) ? formData.billing_company_name : '',
        firstname: (formData.billing_first_name) ? formData.billing_first_name : '',
        lastname: (formData.billing_last_name) ? formData.billing_last_name : '',
        email: (formData.billing_email) ? formData.billing_email : '',
        address1: (formData.billing_address1) ? formData.billing_address1 : '',
        phone: (formData.billing_phone) ? formData.billing_phone : '',
        address2: (formData.billing_address2) ? formData.billing_address2 : '',
        state: (formData.billing_state) ? formData.billing_state : '',
        country: (formData.billing_country) ? formData.billing_country : '',
        city: (formData.billing_city) ? formData.billing_city : '',
        zip: (formData.billing_zip) ? formData.billing_zip : '',
        password: (formData.password) ? formData.password : '',
        confirmpass: (formData.confirmpass) ? formData.confirmpass : '',
        notifyme: '1',
        acceptpolicy: '',
        CID: this.CID,
        id: 0,
        foramData: formData
      }
      // create new user through the user service
      this.UserService.registerUser(newUserObject).subscribe((res) => {
        if (res) {
          // create login object
          let userLoginData = {
            email: formData.billing_email,
            password: formData.password,
          }
          // calling login API
          this.UserService.loginUser(userLoginData).subscribe(resp => {
            if (resp && resp.token && resp.data) {
              // set data in localstorage
              localStorage.setItem('token', resp.token);
              localStorage.setItem('user', JSON.stringify(resp.data));
              // set user data using service
              this.UserService.setUserDataList();

              // update member id against added product in cart
              if (this.SessionID) {
                let dataObj = {
                  CID: this.CID,
                  SessionID: this.SessionID,
                  MemberID: resp.data.id
                }
                // update member ids again added product in cart
                this.StoreService.updateMemberId(dataObj).subscribe(res1 => { }, (error) => { });

                // redirect   
                setTimeout(() => {
                  // this method review order and redirect on payment page.
                  this.reviewCartOrder(formData);
                }, 100);
              }
            } else {

            }
          }, (error: any) => {
            if (error.error.error) {
              this.toastr.error(error.error.error, 'Error!');
            }
          });
        }
      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        }
      );
    }
  }

  // create new users 
  guestNewUsers(formData): void {
    // check user data 
    if (formData) {
      // create new user data object
      let newUserObject = {
        company_name: (formData.billing_company_name) ? formData.billing_company_name : '',
        firstname: (formData.billing_first_name) ? formData.billing_first_name : '',
        lastname: (formData.billing_last_name) ? formData.billing_last_name : '',
        email: (formData.billing_email) ? formData.billing_email : '',
        address1: (formData.billing_address1) ? formData.billing_address1 : '',
        phone: (formData.billing_phone) ? formData.billing_phone : '',
        address2: (formData.billing_address2) ? formData.billing_address2 : '',
        state: (formData.billing_state) ? formData.billing_state : '',
        country: (formData.billing_country) ? formData.billing_country : '',
        city: (formData.billing_city) ? formData.billing_city : '',
        zip: (formData.billing_zip) ? formData.billing_zip : '',
        password: '',
        confirmpass: '',
        notifyme: '1',
        acceptpolicy: '',
        CID: this.CID,
        id: 0,
        foramData: formData
      }
      // create new user through the user service
      this.UserService.guestRegisterUser(newUserObject).subscribe((res) => {
        if (res) {
          // create login object
          let userLoginData = {
            email: formData.billing_email,
            CID: this.CID
          }
          // calling guest user login API
          this.UserService.guestLoginUser(userLoginData).subscribe(resp => {
            if (resp && resp.token && resp.data) {
              // set data in localstorage
              localStorage.setItem('token', resp.token);
              localStorage.setItem('user', JSON.stringify(resp.data));
              // set user data using service
              this.UserService.setUserDataList();

              // update member id against added product in cart
              if (this.SessionID) {
                let dataObj = {
                  CID: this.CID,
                  SessionID: this.SessionID,
                  MemberID: resp.data.id
                }
                // update member ids again added product in cart
                this.StoreService.updateMemberId(dataObj).subscribe(res1 => { }, (error) => { });

                // redirect   
                setTimeout(() => {
                  // this method review order and redirect on payment page.
                  this.reviewCartOrder(formData);
                }, 100);
              }
            } else {

            }
          }, (error: any) => {
            if (error.error.error) {
              this.toastr.error(error.error.error, 'Error!');
            }
          });
        }
      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        }
      );
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


  // review cart order 
  reviewCartOrder(formData): void {
    // mange user data
    formData['CID'] = this.CID;
    formData['CustomerID'] = (this.userData && this.userData.id) ? this.userData.id : '';
    this.StoreService.ReviewOrder(formData).subscribe((res) => {
      // set data in localstorage
      localStorage.setItem('checkout_data_' + this.SessionID, JSON.stringify(formData));
      if(this.CartToken && this.CartToken != ''){
        this.router.navigateByUrl('payment/'+this.CartToken);
      }else{
        this.router.navigateByUrl('payment');
      }
      //this.checkoutForm.reset();
      /*this.translate.get('ADDRESS_SAVED_SUCCESS').subscribe((res: string) => {
        this.toastr.success(res, 'Success!');
      });*/
    },
      (error: any) => {
        if (error.error.error) {
          this.toastr.error(error.error.error, 'Error!');
        }
      });
  }

  // Get store list
  get_user_address(): void {

    let dataObj = {
      cid: this.CID,
      userId: (this.userData && this.userData.id) ? this.userData.id : ''
    }
    this.UserService.getCurrentUserAddress(dataObj).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.addressList = res.data;
      }
    }, (error) => {
      this.addressList = [];
    });

  }

  // get current user
  getCurrentUser(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getCurrentUser(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.CurrentuserData = res.data[0];
          
        }else{
          this.CurrentuserData = [];
        }
      }, (error) => {
          this.CurrentuserData = [];
      });
    }
  }

  
  // get default user addresses
  get_default_addressess(): void {

    let dataObj = {
      cid: this.CID,
      userId: (this.userData && this.userData.id) ? this.userData.id : ''
    }
    this.UserService.getUserDefaultAddress(dataObj).subscribe(res => {
      if (res && res.data && res.data.length) {

        let defaultBillingaddresses = '';
        let defaultshippingaddresses = '';
        if (res.data && res.data.length) {
          _.map(res.data, function (v) {
            if (v.AddressType == 'billing') {
              defaultBillingaddresses = v;
            }
            if (v.AddressType == 'shipping') {
              defaultshippingaddresses = v;
            }
          })
        }
        
        this.defaultBillingaddresses = defaultBillingaddresses;
        this.defaultshippingaddresses = defaultshippingaddresses;
        
        if (this.defaultBillingaddresses && this.defaultBillingaddresses.ID) {
          this.checkoutForm.patchValue({
            new_address: 'existing',
            billing_company_name: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Company_Name : '',
            billing_first_name: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.First_Name : '',
            billing_last_name: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Last_Name : '',
            billing_email: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Email_Address : '',
            billing_phone: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Phone_Number : '',
            billing_address1: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Address : '',
            billing_address2: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Address2 : '',
            billing_city: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.City : '',
            billing_state: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.State : '',
            billing_country: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Country : '',
            billing_zip: (this.defaultBillingaddresses) ? this.defaultBillingaddresses.ZipCode : '',
          });
          this.BillingPhone = (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Phone_Number : '';
          this.ShippingPhone = (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Phone_Number : '';
          billing_address = (this.defaultBillingaddresses) ? this.defaultBillingaddresses.Address : '';
          jQuery(".address1").val(billing_address);

        } else {
          this.checkoutForm.patchValue({
            new_address: 'existing',
            billing_company_name: (this.userData && this.userData.company_name) ? this.userData.company_name : '',
            billing_first_name: (this.userData && this.userData.first_name) ? this.userData.first_name : '',
            billing_last_name: (this.userData && this.userData.last_name) ? this.userData.last_name : '',
            billing_email: (this.userData && this.userData.email) ? this.userData.email : '',
            billing_phone: (this.userData && this.userData.phone) ? this.userData.phone : '',
            billing_address1: (this.userData && this.userData.address) ? this.userData.address : '',
            billing_address2: (this.userData && this.userData.address2) ? this.userData.address2 : '',
            billing_city: (this.userData && this.userData.city) ? this.userData.city : '',
            billing_state: (this.userData && this.userData.state) ? this.userData.state : '',
            billing_country: (this.userData && this.userData.country) ? this.userData.country : '',
            billing_zip: (this.userData && this.userData.zip) ? this.userData.zip : '',
          });
          this.BillingPhone = (this.userData) ? this.userData.phone : '';
          this.ShippingPhone = (this.userData) ? this.userData.phone : '';
          billing_address = (this.userData) ? this.userData.address : '';
          jQuery(".address1").val(billing_address);

        }

        if (this.defaultshippingaddresses && this.defaultshippingaddresses.ID) {
          this.checkoutForm.patchValue({
            new_address: 'existing',
            shipping_company_name: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Company_Name : '',
            shipping_first_name: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.First_Name : '',
            shipping_last_name: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Last_Name : '',
            shipping_email: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Email_Address : '',
            shipping_phone: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Phone_Number : '',
            shipping_address1: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Address : '',
            shipping_address2: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Address2 : '',
            shipping_city: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.City : '',
            shipping_state: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.State : '',
            shipping_country: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Country : '',
            shipping_zip: (this.defaultshippingaddresses) ? this.defaultshippingaddresses.ZipCode : '',
          });
          this.BillingPhone = (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Phone_Number : '';
          this.ShippingPhone = (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Phone_Number : '';
          shipping_address = (this.defaultshippingaddresses) ? this.defaultshippingaddresses.Address : '';
          jQuery("#shipping_address .address1").val(shipping_address);

        } else {
          this.checkoutForm.patchValue({
            new_address: 'existing',
            shipping_company_name: (this.userData) ? this.userData.company_name : '',
            shipping_first_name: (this.userData) ? this.userData.first_name : '',
            shipping_last_name: (this.userData) ? this.userData.last_name : '',
            shipping_email: (this.userData) ? this.userData.email : '',
            shipping_phone: (this.userData) ? this.userData.phone : '',
            shipping_address1: (this.userData) ? this.userData.address : '',
            shipping_address2: (this.userData) ? this.userData.address2 : '',
            shipping_city: (this.userData) ? this.userData.city : '',
            shipping_state: (this.userData) ? this.userData.state : '',
            shipping_country: (this.userData) ? this.userData.country : '',
            shipping_zip: (this.userData) ? this.userData.zip : '',
          });
          this.BillingPhone = (this.userData) ? this.userData.phone : '';
          this.ShippingPhone = (this.userData) ? this.userData.phone : '';
          shipping_address = (this.userData) ? this.userData.address : '';
          jQuery("#shipping_address .address1").val(shipping_address);

        }

      } else {
        this.checkoutForm.patchValue({
          new_address: 'existing',
          billing_company_name: (this.userData) ? this.userData.company_name : '',
          billing_first_name: (this.userData) ? this.userData.first_name : '',
          billing_last_name: (this.userData) ? this.userData.last_name : '',
          billing_email: (this.userData) ? this.userData.email : '',
          billing_phone: (this.userData) ? this.userData.phone : '',
          billing_address1: (this.userData) ? this.userData.address : '',
          billing_address2: (this.userData) ? this.userData.address2 : '',
          billing_city: (this.userData) ? this.userData.city : '',
          billing_state: (this.userData) ? this.userData.state : '',
          billing_country: (this.userData) ? this.userData.country : '',
          billing_zip: (this.userData) ? this.userData.zip : '',
          shipping_company_name: (this.userData) ? this.userData.company_name : '',
          shipping_first_name: (this.userData) ? this.userData.first_name : '',
          shipping_last_name: (this.userData) ? this.userData.last_name : '',
          shipping_email: (this.userData) ? this.userData.email : '',
          shipping_phone: (this.userData) ? this.userData.phone : '',
          shipping_address1: (this.userData) ? this.userData.address : '',
          shipping_address2: (this.userData) ? this.userData.address2 : '',
          shipping_city: (this.userData) ? this.userData.city : '',
          shipping_state: (this.userData) ? this.userData.state : '',
          shipping_country: (this.userData) ? this.userData.country : '',
          shipping_zip: (this.userData) ? this.userData.zip : '',
        });
        billing_address = (this.userData) ? this.userData.address : '';
        this.BillingPhone = (this.userData) ? this.userData.phone : '';
        this.ShippingPhone = (this.userData) ? this.userData.phone : '';
        jQuery(".address1").val(billing_address);

      }
      
      this.get_states(this.checkoutForm.controls.billing_country.value);
      
    }, (error) => {

    });

  }

  // get states list from db
  get_states(country) {
  
    // Set conditions
    let cond = {
      country: country
    };
    this.CountriesService.getStates(cond).subscribe((res: any) => {
      if (!res.error) {
        this.statesList = res.data;
      } else {

      }
    }, (error) => {

    });
  }
  
  // get countries list from db
  get_countries() {
    this.CountriesService.getCountries().subscribe((res: any) => {
      if (!res.error) {
        this.countriesList = res.data;
      } else {

      }
    }, (error) => {

    });
  }


  // Choose Shipping Address
  DeliverToAddress(address) {

    this.checkoutForm.patchValue({
      new_address: 'existing',
      shipping_company_name: (address && address.Company_Name) ? address.Company_Name : '',
      shipping_first_name: (address && address.First_Name) ? address.First_Name : '',
      shipping_last_name: (address && address.Last_Name) ? address.Last_Name : '',
      shipping_email: (address && address.Email_Address) ? address.Email_Address : '',
      shipping_phone: (address && address.Phone_Number) ? address.Phone_Number : '',
      shipping_address1: (address && address.Address) ? address.Address : '',
      shipping_address2: (address && address.Address2) ? address.Address2 : '',
      shipping_city: (address && address.City) ? address.City : '',
      shipping_state: (address && address.State) ? address.State : '',
      shipping_country: (address && address.Country) ? address.Country : '',
      shipping_zip: (address && address.ZipCode) ? address.ZipCode : ''
    });
    this.ShippingPhone = (address && address.Phone_Number) ? address.Phone_Number : '';
        
    jQuery("#shipping_address .address1").val(address.Address);
  }

  // Add New Address
  AddNewAddress() {

    this.checkoutForm.patchValue({
      new_address: 'new',
      shipping_company_name: '',
      shipping_first_name: '',
      shipping_last_name: '',
      shipping_email: '',
      shipping_phone: '',
      shipping_address1: '',
      shipping_address2: '',
      shipping_city: '',
      shipping_state: '',
      shipping_country: '',
      shipping_zip: '',
    });
    jQuery("#shipping_address .address1").val('');
  }

  // Ship to different address 
  ShipToDiffAddress(event) {
    if (event.target.checked) {
      this.ShowShipping = true;
      this.unsetData();
      this.checkoutForm.patchValue({
         new_address: 'new',
      });
    } else {
      this.ShowShipping = false;
      this.SameAsBillingAddress();
      this.checkoutForm.patchValue({
         new_address: 'existing',
      });
    }

  }

  // unset shipping data
  unsetData():void{
    this.checkoutForm.patchValue({
      shipping_company_name: '',
      shipping_first_name: '',
      shipping_last_name: '',
      shipping_email: '',
      shipping_phone: '',
      shipping_address1: '',
      shipping_address2: '',
      shipping_city: '',
      shipping_state: '',
      shipping_country: '',
      shipping_zip: '',
    });
    jQuery("#shipping_address .address1").val('');
  }

  // Ship to different address 
  newUserPassword(event) {
    if (event.target.checked) {
      this.ShowPassword = true;
    } else {
      this.ShowPassword = false;
    }

  }

  SameAsBillingAddress() {
    this.checkoutForm.patchValue({
      shipping_company_name: this.checkoutForm.controls.billing_company_name.value,
      shipping_first_name: this.checkoutForm.controls.billing_first_name.value,
      shipping_last_name: this.checkoutForm.controls.billing_last_name.value,
      shipping_email: this.checkoutForm.controls.billing_email.value,
      shipping_phone: this.checkoutForm.controls.billing_phone.value,
      shipping_address1: this.checkoutForm.controls.billing_address1.value,
      shipping_address2: this.checkoutForm.controls.billing_address2.value,
      shipping_city: this.checkoutForm.controls.billing_city.value,
      shipping_state: this.checkoutForm.controls.billing_state.value,
      shipping_country: this.checkoutForm.controls.billing_country.value,
      shipping_zip: this.checkoutForm.controls.billing_zip.value,
    });
    jQuery("#shipping_address .address1").val(this.checkoutForm.controls.billing_address1.value);
  }


  // Get cart info 
  getProductCartList(): void {

    if(this.CartToken && this.CartToken != ''){
        if (this.CartToken) {
          let dataObj = {
            cid: this.CID,
            SessionID: this.CartToken
          }
          this.StoreService.getProductCartInfo(dataObj).subscribe(res1 => {
            if (res1 && res1.data && res1.data.length) {
                // emit data with broadcast service
                this.StoreService.setCartProductList(res1);
                this.productCount = res1.productCount;
                this.cartProductList = res1.data;
                this.subTotal = res1.subTotal;

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

                if(this.CartToken && this.CartToken != ''){
                  let checkout_data: any = res1.checkout_data;
                  //console.log(checkout_data);
                  if (checkout_data && checkout_data != '') {
                    // set types 
                    this.framRadio = (checkout_data && checkout_data.type) ? checkout_data.type : 'Farm';
                    // set address
                    this.ShowShipping = (checkout_data) ? checkout_data.ShipToDiffAddress : false;
                    this.checkoutForm.patchValue({
                      new_address: 'existing',
                      ShipToDiffAddress: (checkout_data) ? checkout_data.ShipToDiffAddress : '',
                      CallAhead: (checkout_data) ? checkout_data.CallAhead : '',
                      EqpUpload: (checkout_data) ? checkout_data.EqpUpload : '',
                      SemiTrucks: (checkout_data) ? checkout_data.SemiTrucks : '',
                      LiftGate: (checkout_data) ? checkout_data.LiftGate : '',
                      LoadingDock: (checkout_data) ? checkout_data.LoadingDock : '',
                      Pickup: (checkout_data) ? checkout_data.Pickup : '',
                      type: (checkout_data) ? checkout_data.type : '',
                      billing_company_name: (checkout_data) ? checkout_data.billing_company_name : '',
                      billing_first_name: (checkout_data) ? checkout_data.billing_first_name : '',
                      billing_last_name: (checkout_data) ? checkout_data.billing_last_name : '',
                      billing_email: (checkout_data) ? checkout_data.billing_email : '',
                      billing_phone: (checkout_data) ? checkout_data.billing_phone : '',
                      billing_address1: (checkout_data) ? checkout_data.billing_address1 : '',
                      billing_address2: (checkout_data) ? checkout_data.billing_address2 : '',
                      billing_city: (checkout_data) ? checkout_data.billing_city : '',
                      billing_state: (checkout_data) ? checkout_data.billing_state : '',
                      billing_country: (checkout_data) ? checkout_data.billing_country : '',
                      billing_zip: (checkout_data) ? checkout_data.billing_zip : '',
                      shipping_company_name: (checkout_data) ? checkout_data.shipping_company_name : '',
                      shipping_first_name: (checkout_data) ? checkout_data.shipping_first_name : '',
                      shipping_last_name: (checkout_data) ? checkout_data.shipping_last_name : '',
                      shipping_email: (checkout_data) ? checkout_data.shipping_email : '',
                      shipping_phone: (checkout_data) ? checkout_data.shipping_phone : '',
                      shipping_address1: (checkout_data) ? checkout_data.shipping_address1 : '',
                      shipping_address2: (checkout_data) ? checkout_data.shipping_address2 : '',
                      shipping_city: (checkout_data) ? checkout_data.shipping_city : '',
                      shipping_state: (checkout_data) ? checkout_data.shipping_state : '',
                      shipping_country: (checkout_data) ? checkout_data.shipping_country : '',
                      shipping_zip: (checkout_data) ? checkout_data.shipping_zip : '',
                    });
                    this.BillingPhone = (checkout_data) ? checkout_data.billing_phone : '';
                    this.ShippingPhone = (checkout_data) ? checkout_data.shipping_phone : '';
                    


                    billing_address = (checkout_data) ? checkout_data.billing_address1 : '';
                    jQuery("#billing_address .address1").val(billing_address);
                    shipping_address = (checkout_data) ? checkout_data.shipping_address1 : '';
                    jQuery("#shipping_address .address1").val(shipping_address);
                    
                    this.get_states(checkout_data.billing_country);
                    
                  }
                }

            }
          }, (error) => {
            // Reset value for service
            this.StoreService.setCartProductList('');
          });
        }
    }else{
        // This service sbucribe cart product list
        this.StoreService.castCartProductList.subscribe(cartProductInfo => {
          // set data
          if (!cartProductInfo.productCount) {
            //this.changeRouter('shop');
          }
          //console.log(cartProductInfo.productCount);
          this.productCount = cartProductInfo.productCount;
          this.cartProductList = cartProductInfo.data;
          this.subTotal = cartProductInfo.subTotal;

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
          
        });
    }
    
    
  }

  getAddress(place: object) {
    //console.log(place);
    let address1 = '', streetNumber, street, city, state,country, postCode, Latitude, Longitude;
    streetNumber = this.getAddrComponent(place, { street_number: 'long_name' });
    street = this.getAddrComponent(place, { route: 'long_name' });
    if (streetNumber) {
      address1 = streetNumber;
    }
    if (street) {
      address1 = address1 + ' ' + street;
    }
    
    city = this.getAddrComponent(place, { locality: 'long_name' });
    state = this.getAddrComponent(place, { administrative_area_level_1: 'long_name' });
    postCode = this.getAddrComponent(place, { postal_code: 'long_name' });
    country = this.getAddrComponent(place, { country: 'short_name' });
    this.zone.run(() => this.formattedAddress = place['formatted_address']);

    jQuery("#billing_address .address1").val(address1);

    this.checkoutForm.controls.billing_address1.setValue(address1);
    this.checkoutForm.controls.billing_address2.setValue('');

    this.checkoutForm.controls.billing_city.setValue(city);
    this.checkoutForm.controls.billing_country.setValue(country);
    if(country == 'TT'){
        this.checkoutForm.controls.billing_state.setValue('');
        this.checkoutForm.controls.billing_zip.setValue('');
        
    }else{
        this.checkoutForm.controls.billing_state.setValue(state);
        this.checkoutForm.controls.billing_zip.setValue(postCode);
    }
    this.get_states(country);
    
    // shipping address
    this.setShippingAddress();
    
    jQuery("#billing_address2").click();
    
  }

  getAddress2(place: object) {
  
    let address1 = '', streetNumber, street, city, state,country, postCode, Latitude, Longitude;
    streetNumber = this.getAddrComponent(place, { street_number: 'long_name' });
    street = this.getAddrComponent(place, { route: 'long_name' });
    if (streetNumber) {
      address1 = streetNumber;
    }
    if (street) {
      address1 = address1 + ' ' + street;
    }
    
    city = this.getAddrComponent(place, { locality: 'long_name' });
    state = this.getAddrComponent(place, { administrative_area_level_1: 'long_name' });
    country = this.getAddrComponent(place, { country: 'short_name' });
    postCode = this.getAddrComponent(place, { postal_code: 'long_name' });
    this.zone.run(() => this.formattedAddress = place['formatted_address']);

    jQuery("#shipping_address .address1").val(address1);

    this.checkoutForm.controls.shipping_address1.setValue(address1);
    this.checkoutForm.controls.shipping_address2.setValue('');
    this.checkoutForm.controls.shipping_city.setValue(city);
    this.checkoutForm.controls.shipping_state.setValue(state);
    this.checkoutForm.controls.shipping_country.setValue(country);
    this.checkoutForm.controls.shipping_zip.setValue(postCode);

    this.get_states(country);
    
  }


  getAddrComponent(place, componentTemplate) {
    let result;
    if(place.address_components && place.address_components.length){
        for (let i = 0; i < place.address_components.length; i++) {
          const addressType = place.address_components[i].types[0];
          if (componentTemplate[addressType]) {
            result = place.address_components[i][componentTemplate[addressType]];
            return result;
          }
        }
    }
    return;
  }

  // open global popup
  openModal(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }
  
  // apply tax exemption
  ApplyExempt(){
    
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getCurrentUser(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.CurrentuserData = res.data[0];
          if(this.CurrentuserData && this.CurrentuserData.CertCaptureUser == 0){
            this.changeRouter('account/tax-exemption?back=checkout');
            this.toastr.error('Please Submit your Tax Exemption Certificate first', 'Error!');
          }else{
            
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
                }else{
                    this.changeRouter('account/tax-exemption?back=checkout');
                    this.toastr.error('Please Submit your Tax Exemption Certificate first', 'Error!');
                }
              }, (err) => {

              });
                
          }
          
        }else{
          this.CurrentuserData = [];
        }
      }, (error) => {
          this.CurrentuserData = [];
      });
    }
  }
  setShippingAddress():void{
    // if user will not select shipping then assign billing informationn to shipping 
    if (this.ShowShipping == false) {
      this.SameAsBillingAddress();
    }   
  }
  
  setBillingPhoneValue(value) {
    if (value != '') {
      this.BillingPhone = value;
      this.ShippingPhone = value;
    }
    this.setShippingAddress();
  }
  
  setShippingPhoneValue(value) {
    if (value != '') {
      this.ShippingPhone = value;
    }
    
  }
  
  // change ups shipping 
  SetBillingCountry(value): void {
    this.get_states(value);
    this.setShippingAddress();
  }
  
}
