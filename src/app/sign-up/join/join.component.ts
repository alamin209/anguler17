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
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.sass']
})
export class JoinComponent implements OnInit {

  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  public PORTAL_URL: string = environment.config.PORTAL_URL;
  private MANUFACTURER_GROUP_ID: Number = environment.config.MANUFACTURER_GROUP_ID;
  CountriesList: any;
  statesList: any;
  PackagesList: any;
  formattedAddress: string;
  Phone:any;
  userData: any;
  UserToken: any;
  currentUser: any;
  cond: any = [];

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

    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      
      // get user token
      this.UserToken = localStorage.getItem('token');
      
      if(this.userData && this.userData.id){
        this.changeRouter('member/profile');
      }
      
    });
    
    // This service for get membership packages
    this.get_packages();
      
  }
  
  // get membership packages
  get_packages() {
  
    // Set conditions
    let cond = {
        CID:this.CID
    }
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
  

}
