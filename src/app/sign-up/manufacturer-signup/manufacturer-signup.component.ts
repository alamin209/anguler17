import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MustMatch } from '../_helpers/must-match.validator';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { HomeService } from '../../services/home/home.service'

/*
 * Import the service
 */
import { UserService } from '../../services/auth/user.service';
import { CountriesService } from '../../services/countries/countries.service';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-manufacturer-signup',
  templateUrl: './manufacturer-signup.component.html',
  styleUrls: ['./manufacturer-signup.component.sass']
})
export class ManufacturerSignupComponent implements OnInit {

  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  public PORTAL_URL: string = environment.config.PORTAL_URL;
  private MANUFACTURER_GROUP_ID: Number = environment.config.MANUFACTURER_GROUP_ID;
  CountriesList: any;
  statesList: any;
  formattedAddress: string;
  Phone:any;

  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private HomeService: HomeService,
    public zone: NgZone
    // private httpHeader: HttpHeaders
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {

    // This service subscribe countries list
    this.get_countries();

    // This service subscribe states list
    this.get_states('US');

    this.userForm = this.formBuilder.group({
      Company_Name: ['', Validators.required],
      First_Name: ['', Validators.required],
      Last_Name: ['', Validators.required],
      Email_Address: ['', [Validators.required, Validators.email]],
      Mobile_Phone: ['', [Validators.required]],
      Address: ['', Validators.required],
      Address2: [''],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZIP: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmpass: ['', [Validators.required]],
      notifyme: [''],
      acceptpolicy: ['', [Validators.required]],
      Latitude: [''],
      Longitude: ['']
    }, {
      validator: MustMatch('password', 'confirmpass')
    });


    // For Capitalization
    jQuery(document).ready(function () {
      jQuery(document).ready(function () {
          jQuery(".form-control:not('.email, .password')").keyup(function () {
            var _val = jQuery(this).val();
            var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
            jQuery(this).val(_txt);
          });
      });
    });

  }
  onSubmit(formData) {
    // remove validation for address2
    this.userForm.controls['Address2'].setErrors(null);
    this.markFormGroupDirtied(this.userForm);
    if (this.userForm.valid) {
      formData['CID'] = this.CID;
      formData['MANUFACTURER_GROUP_ID'] = this.MANUFACTURER_GROUP_ID;
      formData['Country'] = 'US';
      formData['Mobile_Phone'] = this.Phone;
      this.UserService.registerManufacturer(formData)
        .subscribe(
          (res) => {
            this.changeRouter('thank-you?t=manufacturer');
            this.userForm.reset();
            // Display message 
            this.translate.get('SIGNUP_SUCCESSS_MSG').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });
          },
          (error: any) => {
            if (error.error.error) {
              this.toastr.error(error.error.error, 'Error!');
            }
          }
        );
    } else {
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
  // redirect to page according to url
  changeRouter(slug): void {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get countries list from db
  get_countries() {
    this.CountriesService.getCountries().subscribe((res: any) => {
      if (!res.error) {
        this.CountriesList = res.data;
      } else {

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
  
  setPhoneValue(value) {
    if (value != '') {
      this.Phone = value;
    }
  }

  // open global popup
  openModal(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }

  getAddress(place: object) {

    let address1 = '', streetNumber, street, city, state, postCode, Latitude, Longitude;
    //this.address = place['formatted_address'];
    //this.formattedAddress = place['formatted_address'];
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

    Latitude = place['geometry']['location'].lat();
    Longitude = place['geometry']['location'].lng();

    this.zone.run(() => this.formattedAddress = place['formatted_address']);

    jQuery(".address1").val(address1);
    // set value
    this.userForm.patchValue({
      Address: address1,
      Address2: '',
      City: city,
      State: state,
      ZIP: postCode,
      Latitude: Latitude,
      Longitude: Longitude
    });
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
  // set value on change in address
  changeValue(event){
    // set value
    this.userForm.patchValue({
      Address: event
    });
  }

}
