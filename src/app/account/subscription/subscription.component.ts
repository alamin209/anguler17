import {
  Component,
  NgZone,
  ViewChild,
  EventEmitter,
  Output,
  OnInit,
  Input,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { HomeService } from "../../services/home/home.service";
import * as _ from "lodash";
/*
 * Import the service
 */
import { CountriesService } from "../../services/countries/countries.service";
import { UserService } from "../../services/auth/user.service";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-subscription",
  templateUrl: "./subscription.component.html",
  styleUrls: ["./subscription.component.sass"],
})
export class SubscriptionComponent implements OnInit {
  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  public PORTAL_URL: string = environment.config.PORTAL_URL;
  private MANUFACTURER_GROUP_ID: Number = environment.config.MANUFACTURER_GROUP_ID;
  CountriesList: any;
  statesList: any;
  PackagesList: any;
  formattedAddress: string;
  Phone: any;
  userData: any;
  UserToken: any;
  currentUser: any;
  cond: any = [];
  user_package: any;
  upgradeAction: any;
  
  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private HomeService: HomeService,
    public zone: NgZone // private httpHeader: HttpHeaders
  ) {
    // Set translate language
    translate.setDefaultLang("en");
  }

  ngOnInit() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    this.route.queryParams.subscribe(params => {
        this.upgradeAction = params.upgrade;
    });

    // This service for get membership packages
    this.getUserData();
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
            this.user_package = res.user_package;
            this.get_packages();
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
          
          if(this.user_package && this.user_package.ID){
            let user_packageID = this.user_package.ID;
            _.map(this.PackagesList, function (v2) {
                v2.selected = false;
                if(v2.ID == user_packageID){
                    v2.selected = true;
                }
                return v2;
            });
          }else{
            _.map(this.PackagesList, function (v2) {
                v2.selected = false;
                return v2;
            });
          }
          
          //console.log(this.PackagesList);
          
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

  upgradeSubscription(packageObj) {
    this.changeRouter(
      `/member/upgrade-subscription/${packageObj.Package_Slug}`
    );
  }

  CancelSubscription(): void {
    if (this.userData) {
      let dataObj = {
        CID: this.CID,
        user_id: this.userData.id,
      };
      this.UserService.cancelSubscription(dataObj).subscribe(
        (res) => {
          if (res && res.data) {
            this.toastr.success(res.data, "Success!");
            window.location.reload();
            
            //this.getUserData();
          } else {
            this.toastr.error(res.error, "Error!");
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

}
