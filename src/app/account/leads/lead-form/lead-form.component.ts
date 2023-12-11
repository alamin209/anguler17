import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

// import service 
import { UserService } from '../../../services/auth/user.service'
import { CountriesService } from '../../../services/countries/countries.service';
declare let google: any;

// Declear jquery 
declare var jQuery: any;


@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.sass']
})
export class LeadFormComponent implements OnInit {

  @Input() adressType: string;
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  FINANCING: boolean = environment.config.FINANCING;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  CountriesList: any;
  statesList: any;
  userData: any;
  _Lead: any;
  UserToken: any;
  addressId: any;
  address: Object;
  formattedAddress: string;
  address1:string;
  Phone:any;

  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone
  ) { }

  ngOnInit() {

    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    // Define user form
    this.userForm = this.formBuilder.group({
      Company_Name: ['', [Validators.required]],
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      Email_Address: ['', [Validators.required, Validators.email]],
      Phone_Number: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Address2: [''],
      Latitude: [''],
      Longitude: [''],
      State: [''],
      Country: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZipCode: [''],
      AreaOfInterest: [''],
      LeadStatus: [''],
      LeadStage: [''],
      LeadSource: [''],
      
    });

    this.route.paramMap.subscribe(params => {
      this.addressId = params.get("id");
      // calling multiple method
      forkJoin([this.get_countries(), this.get_states(this.DEFAULT_COUNTRY), this.getLead()]);
    });
    
    this.userForm.patchValue({
        Country: this.DEFAULT_COUNTRY
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

  // save user data
  onSubmit(customerData) {
    this.userForm.controls['State'].setErrors(null);
    this.userForm.controls['ZipCode'].setErrors(null);
    this.userForm.controls['Address2'].setErrors(null);
    this.userForm.controls['Latitude'].setErrors(null);
    this.userForm.controls['Longitude'].setErrors(null);
    this.userForm.controls['Company_Name'].setErrors(null);
    this.markFormGroupDirtied(this.userForm);
    if (this.userForm.valid) {
      // check edit address id
      customerData['CID'] = this.CID;
      //customerData['country'] = 'US';
      customerData['userId'] = this.userData.id;
      customerData['userMemberID'] = this.userData.MemberID;
      
      customerData['userName'] = this.userData.first_name+' '+this.userData.last_name;
      customerData['userEmail'] = this.userData.email
      
      customerData['id'] = (this.addressId) ? this.addressId : '';
      customerData['Phone_Number'] = this.Phone;
      if(customerData['Country'] == 'TT'){
        customerData['State'] = '';
        customerData['ZipCode'] = '';
      }
      // call service for update user address
      this.UserService.saveLead(customerData).subscribe((res) => {
        // show message
        if (this.addressId) {
          this.translate.get('LEAD_SAVED_SUCCESS').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        } else {
          this.translate.get('LEAD_SAVED_SUCCESS').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }

        // reset from 
        this.userForm.reset();
        // redirect
        this.changeRouter('member/leads');
      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        });
    } else {
    }
  }
  
  // check validation for whole form 
  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
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

  // get countries list from db
  get_countries() {
    this.CountriesService.getCountries().subscribe((res: any) => {
      if (!res.error) {
        this.CountriesList = res.data;
      }
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

  // get user address
  getLead(): void {
    if (this.userData && this.userData.id && this.addressId) {
      let dataObj = {
        cid: this.CID,
        id: this.addressId,
        userId: this.userData.id
      }
      this.UserService.getLead(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this._Lead = res.data;
          this.userForm.patchValue({
            First_Name: this._Lead[0].First_Name,
            Last_Name: this._Lead[0].Last_Name,
            Email_Address: (this._Lead && this._Lead[0] && this._Lead[0].Email_Address)?this._Lead[0].Email_Address : this.userData.email,
            Phone_Number: this._Lead[0].Mobile_Phone,
            Address: this._Lead[0].Address,
            Address2: this._Lead[0].Street,
            City: this._Lead[0].City,
            Country: this._Lead[0].Country,
            State: this._Lead[0].State,
            ZipCode: this._Lead[0].ZIP,
            LeadStatus: this._Lead[0].LeadStatus,
            LeadStage: this._Lead[0].LeadStage,
            LeadSource: this._Lead[0].LeadSource,
            AreaOfInterest: this._Lead[0].AreaOfInterest,
            
          });
          this.Phone = this._Lead[0].Mobile_Phone;
          jQuery("#Address").val(this._Lead[0].Address);
          this.get_states(this._Lead[0].Country)
        }
      }, (error) => {
      });
    }else{
      this.userForm.patchValue({
        Company_Name: '',
        First_Name:  '',
        Last_Name: '',
        Email_Address: '',
        Phone_Number: '',
        Address: '',
        Street: '',
        Latitude: '',
        Longitude: '',
        City: '',
        State: '',
        Country:'',
        ZipCode:  '',
        AreaOfInterest:''
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
    this.userForm.controls['Address'].setValue(address1);
    this.userForm.controls['Address2'].setValue('');
    this.userForm.controls['City'].setValue(city);
    
    this.userForm.controls['State'].setValue(state);
    this.userForm.controls['Country'].setValue(country);
    this.userForm.controls['ZipCode'].setValue(postCode);
    this.userForm.controls['Latitude'].setValue(Latitude);
    this.userForm.controls['Longitude'].setValue(Longitude);
    
    if(country == 'TT'){
        this.userForm.controls.State.setValue('');
        this.userForm.controls.ZipCode.setValue('');
        
    }else{
        this.userForm.controls.State.setValue(state);
        this.userForm.controls.ZipCode.setValue(postCode);
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
