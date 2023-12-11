import { Component, OnInit,NgZone, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// import service 
import { UserService } from '../../services/auth/user.service'
import { StoreService } from '../../services/store/store.service';
import { CountriesService } from '../../services/countries/countries.service';
// Import environment config file.
import { environment } from '../../../environments/environment';

declare var stripe: any;
declare var elements: any;

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-edit-payment-option',
  templateUrl: './edit-payment-option.component.html',
  styleUrls: ['./edit-payment-option.component.sass']
})
export class EditPaymentOptionComponent implements OnInit {

  
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  cardForm: any;
  formData: any;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  FINANCING: boolean = environment.config.FINANCING;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  UserToken: string;
  userData: any;
  addressList: any;
  currentUser: any;
  ipAddress:any;
  statesList:any;
  addressId:any;
  currentAddress:any;
  formattedAddress: string;
  address1:string;
  Phone:any;
  CountriesList: any;

  constructor(
    private router: Router,
    private UserService: UserService,
    private StoreService: StoreService,
    private CountriesService: CountriesService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    public zone: NgZone
  ) { }

  ngOnInit() {
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
	  this.currentUser = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    
    // Define user form
    this.cardForm = this.formBuilder.group({
      Company_Name: ['', [Validators.required]],
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      //Email_Address: ['', [Validators.required, Validators.email]],
      Phone_Number: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Address2: [''],
      Latitude: [''],
      Longitude: [''],
      State: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZipCode: [''],
    });
    
    this.cardForm.patchValue({
        Country: this.DEFAULT_COUNTRY
    });
    
    this.ipAddress = '';
    // get ip address
    this.StoreService.getIPAddress().subscribe(res => {
      if (res && res.ip) {
        this.ipAddress = res.ip;
      }
    }, (err) => {
    });

    this.route.paramMap.subscribe(params => {
      
      this.addressId = params.get("id");
      // calling multiple method
      forkJoin([this.get_countries(),this.get_states(this.DEFAULT_COUNTRY), this.getPaymentOption()]);

    });
    
    // For Capitalization
    jQuery(document).ready(function () {
        jQuery(".form-control").keyup(function () {
            var _val = jQuery(this).val();
            var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
            jQuery(this).val(_txt);
        });
    });

  }

  setPhoneValue(value) {
    if (value != '') {
      this.Phone = value;
    }
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  // redirect to page according to url
  changeRouter(slug:any): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
  
  // calling save card api
  SaveCard(formDt:any) {

    this.cardForm.controls['State'].setErrors(null);
    this.cardForm.controls['ZipCode'].setErrors(null);
    this.cardForm.controls['Address2'].setErrors(null);
    this.cardForm.controls['Latitude'].setErrors(null);
    this.cardForm.controls['Longitude'].setErrors(null);
    
    this.markFormGroupDirtied(this.cardForm);
    if (this.cardForm.valid) {
      if (this.userData) {

        formDt['Email_Address'] = this.userData.email;
        formDt['Phone_Number'] = this.Phone;
        if(formDt['Country'] == 'TT'){
            formDt['State'] = '';
            formDt['ZipCode'] = '';
        }
        let cond = {
          CID: this.CID,
          CustomerID: this.userData.id,
          CustomerData: this.userData,
          IP_ADDRESS: this.ipAddress,
          ADDRESS_ID: this.addressId,
          formData: formDt
        };

        // calling service
        this.UserService.UpdatePaymentOption(cond)
          .subscribe(
            (res) => {
              
              this.toastr.success('Updated Successfully', 'Success!');
              this.changeRouter('member/payment-options');
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
  }

  // check validation for whole form 
  private markFormGroupDirtied(formGroup: FormGroup) {
    this.cardForm.controls['Company_Name'].setErrors(null);
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsDirty();

      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
  }


  

  // get current payment option details
  getPaymentOption():void{
    if (this.userData) {
      
      let dataObj = {
        cid: this.CID,
        id: this.addressId,
        userId: this.userData.id
      }

      this.UserService.getPaymentOptionDetails(dataObj).subscribe(res => {
        this.currentAddress = res.data;
        this.cardForm.patchValue({
          Company_Name: (this.currentAddress && this.currentAddress[0] && this.currentAddress[0].Company_Name) ? this.currentAddress[0].Company_Name : '',
          First_Name: this.currentAddress[0].First_Name,
          Last_Name: this.currentAddress[0].Last_Name,
          Email_Address: (this.currentAddress && this.currentAddress[0] && this.currentAddress[0].Email_Address)?this.currentAddress[0].Email_Address : this.userData.email,
          Phone_Number: this.currentAddress[0].Phone_Number,
          Address: this.currentAddress[0].Address,
          Address2: this.currentAddress[0].Address2,
          Latitude: this.currentAddress[0].Latitude,
          Longitude: this.currentAddress[0].Longitude,
          City: this.currentAddress[0].City,
          State: this.currentAddress[0].State,
          ZipCode: this.currentAddress[0].ZipCode
        });
        this.Phone = this.currentAddress[0].Phone_Number;
        let addr = (this.currentAddress[0]) ? this.currentAddress[0].Address : '';
        jQuery("#Address").val(addr);

        jQuery(document).ready(function () {
           
            jQuery(".form-control").keyup(function () {
                var _val = jQuery(this).val();
                var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
                jQuery(this).val(_txt);
            });
        });
        
      }, (error) => {
          this.currentAddress = [];
      });
    }

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
        this.CountriesList = res.data;
      }
    }, (error) => {
    });
  }

  // remove address 
  removeAddress(id:number):void{
    if (id) {
      let dataObj = {
        cid: this.CID,
        id: id
      }
      this.UserService.removeAddress(dataObj).subscribe(res => {
        if (res && res.data) {
          // show message
          this.translate.get('ADDRESS_REMOVED_SUCCESSFULLY', 'Success!').subscribe((res: string) => {
            this.toastr.success(res);
          });
        }
      }, (error) => {
      });
    }
  }
  
  getAddress(place: object, addressName:string) {
    
    let address1 = '', streetNumber, street, city, state,country, postCode, Latitude, Longitude;
    streetNumber = this.getAddrComponent(place, { street_number: 'long_name' });
    street = this.getAddrComponent(place, { route: 'long_name' });
    country = this.getAddrComponent(place, { country: 'short_name' });
    if (streetNumber) {
      address1 = streetNumber;
    }
    if (street) {
      address1 = address1 + ' ' + street;
    }
    
    city = this.getAddrComponent(place, { locality: 'long_name' });
    state = this.getAddrComponent(place, { administrative_area_level_1: 'long_name' });
    postCode = this.getAddrComponent(place, { postal_code: 'long_name' });

    Latitude = place['geometry']['location'].lat();
    Longitude = place['geometry']['location'].lng();
    this.zone.run(() => this.formattedAddress = place['formatted_address']);
    
    this.get_states(country);
    
    
    jQuery("#Address").val(address1);
    this.cardForm.controls['Address'].setValue(address1);
    this.cardForm.controls['Address2'].setValue('');
    this.cardForm.controls['City'].setValue(city);
    this.cardForm.controls['State'].setValue(state);
    this.cardForm.controls['Country'].setValue(country);
    this.cardForm.controls['ZipCode'].setValue(postCode);
    this.cardForm.controls['Latitude'].setValue(Latitude);
    this.cardForm.controls['Longitude'].setValue(Longitude);
    
    if(country == 'TT'){
        this.cardForm.controls.State.setValue('');
        this.cardForm.controls.ZipCode.setValue('');
        
    }else{
        this.cardForm.controls.State.setValue(state);
        this.cardForm.controls.ZipCode.setValue(postCode);
    }
    
    jQuery("#Address").click();
    
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
  
  // change ups shipping 
  SetBillingCountry(value): void {
    this.get_states(value);
  }

}
