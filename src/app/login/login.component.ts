import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute} from '@angular/router';
import { UserService } from '../services/auth/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';

import { StoreService } from '../services/store/store.service'
// Import environment config file.
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  loginForm;
  keyParms: any;
  keySlug: any;
  CID: Number = environment.config.CID;
  previousUrl: any;
  localStorage:any;
  userData:any;
  UserToken:any;
  
  constructor(
    private UserService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private StoreService: StoreService,
    private location: Location
  ) {

  }

  ngOnInit() {
  
    // brodcast data for login user
    this.userData = '';
    
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      if(this.userData){
        //this.changeRouter('member/profile');
      }
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    // define login form 
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // get url params for params
    this.keySlug = '';
    this.keyParms = '';
    this.route.queryParamMap.subscribe(queryParams => {
      this.keyParms = queryParams.get("redirect");
      this.keySlug = queryParams.get("slug");
    });

    // remove guest user data
    let SessionID: any = localStorage.getItem('SessionID');
    if (SessionID) {
      localStorage.removeItem('checkout_data_' + SessionID);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  
  onSubmit(customerData) {
    this.markFormGroupDirtied(this.loginForm);
    if (this.loginForm.valid) {
    
      customerData['CID'] = this.CID;
      this.UserService.loginUser(customerData).subscribe(resp => {
        if (resp && resp.token && resp.data) {
          // displaying message 
          this.translate.get('LOGIN_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
          // reset form
          this.loginForm.reset();
          // set data in localstorage
          localStorage.setItem('token', resp.token);
          localStorage.setItem('user', JSON.stringify(resp.data));
          // set user data using service
          this.UserService.setUserDataList();

          // update member id against added product in cart
          let checkItem: any = localStorage.getItem('SessionID');
          if (checkItem) {
            let dataObj = {
              CID: this.CID,
              SessionID: checkItem,
              MemberID: resp.data.id
            }
            // update member 
            this.StoreService.updateMemberId(dataObj).subscribe(res1 => {
            }, (error) => {
            });
          }
          // redirect   
          setTimeout(() => {
            // redirect according to query string 
            if (this.keyParms) {
              if (this.keyParms == 'product') {
                if (this.keyParms) {
                  this.changeRouter('product/' + this.keySlug);
                } else {
                  this.changeRouter('member');
                }
              } else {
                this.changeRouter(this.keyParms);
              }
            } else {
              // redirect on fix url
              // get previous url
              this.previousUrl = this.UserService.getPreviousUrl();
              if (this.previousUrl == "undefined" || this.previousUrl == null || this.previousUrl == "" || this.previousUrl == "/login" || this.previousUrl == "/join-now" || this.previousUrl == "/sign-up" || this.previousUrl == "/forget" || this.previousUrl == "/active-account" || this.previousUrl == "/thank-you" || this.previousUrl =="/thank-you/customer") {
                window.location.href='/member/profile';
              } else {
                let getSlug = this.previousUrl.split('/');
                if (getSlug && getSlug.length && (getSlug[0] == 'active-account' || getSlug[1] == 'active-account')){
                  window.location.href='/member/profile';
                } else{
                  // return previous url
                  //this.location.back();
                  //this.changeRouter('/member/profile');
                  window.location.href='/member/profile';
                }
              }
            }
          }, 100);
        } else {

        }
      }, (error: any) => {
        if (error.error.error) {
          this.toastr.error(error.error.error, 'Error!');
        }
      });
    } else {
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsDirty();

      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
  }

}
