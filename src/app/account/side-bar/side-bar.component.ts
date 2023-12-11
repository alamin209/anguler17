import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../services/auth/user.service'

// Import environment config file.
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass']
})
export class SideBarComponent implements OnInit {
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



    let pathname = window.location.pathname;
    pathname = pathname.replace("/member/", "");
    
    let pathname1 = pathname.substr(0, pathname.lastIndexOf("/"));
    if (pathname1 != '') {
      let setActiveLink = pathname1.split('/');
      if (setActiveLink && setActiveLink.length && setActiveLink[0] == "track-my-order") {
        this.ActivePage = 'order-history';
      } else {
        this.ActivePage = pathname1;
      }
    } else {
      this.ActivePage = pathname;
    }


  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }


  // sign out
  signOut(): void {
    this.UserService.signOut();
  }
}
