import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// import service 
import { UserService } from '../../services/auth/user.service'
// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.sass']
})
export class LeadsComponent implements OnInit {
  
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  UserToken: string;
  userData: any;
  LeadsList: any;
  currentUser: any;

  constructor(
    private router: Router,
    private UserService: UserService,
    private translate: TranslateService,
    private toastr: ToastrService,
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

    // calling multiple method
    forkJoin([this.getMyLeads(), this.getUserData()]);
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get current user address
  getMyLeads(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getLeads(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.LeadsList = res.data;
        }
      }, (error) => {
          this.LeadsList = [];
      });
    }
  }

  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          this.currentUser = res.data;
		  this.UserService.setAccountDataList(res);
        }
      }, (error) => {
      });
    }
  }

  // remove address 
  removeLead(id:number,Default_Address:any):void{

    if(Default_Address == 1){
      this.toastr.error("You can't delete default shipping address.", 'Error!');
      return;
    }
    if (id) {
      let dataObj = {
        cid: this.CID,
        id: id
      }
      this.UserService.removeLead(dataObj).subscribe(res => {
        if (res && res.data) {
          // calling multiple method
          forkJoin([this.getMyLeads(), this.getUserData()]);
          // show message
          this.translate.get('LEAD_REMOVE_SUCCESS').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }
      }, (error) => {
      });
    }
  }
  

}
