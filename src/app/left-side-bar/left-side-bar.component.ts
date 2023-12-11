import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../services/auth/user.service'

// Import environment config file.
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.sass']
})
export class LeftSideBarComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  IS_STORE: boolean = environment.config.IS_STORE;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  FINANCING: boolean = environment.config.FINANCING;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  userData: any;
  UserToken: any;
  ActivePage: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private UserService: UserService,
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



  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

}
