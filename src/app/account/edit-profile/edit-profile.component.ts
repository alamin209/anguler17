import {
  Component,
  OnInit,
  EventEmitter,
  NgZone,
  Input,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";

// import service
import { UserService } from "../../services/auth/user.service";
import { CountriesService } from "../../services/countries/countries.service";
declare let google: any;

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.sass"],
})
export class EditProfileComponent implements OnInit {
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean =
    environment.config.GOOGLE_PLACES_SEARCH_API;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  CountriesList: any;
  statesList: any;
  userData: any;
  currentUser: any;
  UserToken: any;
  Phone: any;
  ImageData: any;
  imageFile: any;
  imageURL: any;
  PictureExist: any;
  BannerData: any;
  BannerFile: any;
  BannerURL: any;
  BannerExist: any;
  
  formattedAddress: string;

  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone
  ) {}

  ngOnInit() {
    this.PictureExist = false;
    this.BannerExist = false;
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    // Define user form
    this.userForm = this.formBuilder.group({
      company_name: [""],
      profile_picture: [""],
      screen_name: ["", Validators.required],
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      occupation: [""],
      about: [""],
      address: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      address2: [""],
      Latitude: [""],
      Longitude: [""],
      state: [""],
      country: ["", [Validators.required]],
      city: ["", [Validators.required]],
      zip: [""],
    });

    // calling multiple method
    forkJoin([this.get_countries(), this.get_states("US"), this.getUserData()]);

    jQuery(document).ready(function () {
      jQuery(".form-control:not('.email')").keyup(function () {
        var _val = jQuery(this).val();
        var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
        jQuery(this).val(_txt);
      });
    });
  }

  setPhoneValue(value) {
    if (value != "") {
      this.Phone = value;
    }
  }

  processFile(files: any) {
    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error("Only images are supported.", "Error!");
      return;
    }
    var reader = new FileReader();
    this.imageFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageURL = reader.result;
      this.ImageData = {
        filename: this.imageFile.name,
        filesize: this.imageFile.size,
        filetype: this.imageFile.type,
        value: reader.result,
      };
    };
  }

  processBanner(files: any) {
    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error("Only images are supported.", "Error!");
      return;
    }
    var reader = new FileReader();
    this.BannerFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.BannerURL = reader.result;
      this.BannerData = {
        filename: this.BannerFile.name,
        filesize: this.BannerFile.size,
        filetype: this.BannerFile.type,
        value: reader.result,
      };
    };
  }

  // save user data
  onSubmit(customerData) {
    this.userForm.controls["state"].setErrors(null);
    this.userForm.controls["zip"].setErrors(null);
    this.userForm.controls["address2"].setErrors(null);
    this.userForm.controls["company_name"].setErrors(null);
    this.userForm.controls["occupation"].setErrors(null);
    this.userForm.controls["about"].setErrors(null);
    this.userForm.controls["profile_picture"].setErrors(null);

    this.markFormGroupDirtied(this.userForm);
    if (this.userForm.valid) {
      customerData["CID"] = this.CID;
      //customerData['country'] = 'US';
      customerData["id"] = this.userData.id;
      customerData["phone"] = this.Phone;
      customerData["ImageData"] = this.ImageData;
      customerData["PProfilePic"] = this.PictureExist;
      
      customerData["BannerData"] = this.BannerData;
      customerData["PProfileBanner"] = this.BannerExist;
      
      if (customerData["country"] == "TT") {
        customerData["state"] = "";
        customerData["zip"] = "";
      }
      customerData["ContactID"] = this.userData.ContactID;
      // call service for edit user
      this.UserService.editUserProfile(customerData).subscribe(
        (res) => {
          // set defalt address
          this.setDefaultAddress(customerData);
          // show message
          this.translate
            .get("USER_PROFILE_UPDATED_SUCCESSFULLY")
            .subscribe((res: string) => {
              this.toastr.success(res, "Success!");
            });

          // reset from
          this.userForm.reset();

          // rest set user data in localstorag
          localStorage.setItem("user", JSON.stringify(res.data));
          // set user data using service
          this.UserService.setUserDataList();

          // redirect
          this.changeRouter("member/profile");
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

  // update default address
  setDefaultAddress(customerData): void {
    this.UserService.updateUserDefaultAddress(customerData).subscribe(
      (res) => {},
      (error: any) => {
        if (error.error.error) {
          this.toastr.error(error.error.error, "Error!");
        }
      }
    );
  }
  // check validation for whole form
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

  // get countries list from db
  get_countries() {
    this.CountriesService.getCountries().subscribe(
      (res: any) => {
        if (!res.error) {
          this.CountriesList = res.data;
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
            this.currentUser = res.data;

            this.UserService.setAccountDataList(res);

            if (
              this.currentUser.profile_picture &&
              this.currentUser.profile_picture != ""
            ) {
              this.imageURL = this.AWSBUCKETURL+"files/avatar/"+this.CID+"/"+this.currentUser.profile_picture;
              this.PictureExist = this.currentUser.profile_picture;
            }

            if (
              this.currentUser.profile_banner &&
              this.currentUser.profile_banner != ""
            ) {
              this.BannerURL
 = this.AWSBUCKETURL+"files/avatar/"+this.CID+"/"+this.currentUser.profile_banner;
              this.BannerExist = this.currentUser.profile_banner;
            }

            this.userForm.patchValue({
              company_name: this.currentUser.company_name,
              screen_name: this.currentUser.screen_name,
              first_name: this.currentUser.first_name,
              last_name: this.currentUser.last_name,
              email: this.currentUser.email,
              occupation: this.currentUser.occupation,
              about: this.currentUser.about,
              phone: this.currentUser.phone,
              address: this.currentUser.address,
              address2: this.currentUser.address2,
              city: this.currentUser.city,
              state: this.currentUser.state,
              country: this.currentUser.country,
              zip: this.currentUser.zip,
              Latitude: this.currentUser.Latitude,
              Longitude: this.currentUser.Longitude,
            });
            setTimeout(() => {
              jQuery(".address1").val(this.currentUser.address);
            },1000);
            this.Phone = this.currentUser.phone;
            this.get_states(this.currentUser.country);
          }
        },
        (error) => {}
      );
    }
  }

  // change ups shipping
  SetBillingCountry(value): void {
    this.get_states(value);
  }

  RemovePic(): void {
    this.imageURL = "";
    this.PictureExist = "";
    this.ImageData = "";
  }

  RemoveBanner(): void {
    this.BannerURL = "";
    this.BannerExist = "";
    this.BannerData = "";
  }

  getAddress(place: object, addressName: string) {
    //console.log(place);
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
    this.userForm.controls["address"].setValue(address1);
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
}
