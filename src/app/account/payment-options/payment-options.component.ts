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
  selector: 'app-payment-options',
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.sass']
})
export class PaymentOptionsComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  UserToken: string;
  userData: any;
  addressList: any;
  currentUser: any;
  Cards: any;

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
    forkJoin([ this.getUserData()]);
    this.getPaymentOptions();
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
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
        }else{
          this.currentUser = [];
        }
      }, (error) => {
          this.currentUser = [];
      });
    }
  }
  
  // fetch payment options
  getPaymentOptions(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.fetchCards(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.Cards = res.data;
          console.log(this.Cards);
        }else{
          this.Cards = [];
        }
      }, (error) => {
          this.Cards = [];
      });
    }
  }

  // set default address for shipping 
  setDefaultCard(ids) {
    if(ids){
      let cond= {
        ID :  ids,
        CustomerID : this.userData.id
      }
      this.UserService.updateDefaultCard(cond).subscribe(res => {
        // check data
        if (res && res.data) {
          // calling multiple method
          this.getPaymentOptions();
          // show message
          this.translate.get('CARD_SET_DEFAULT_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }
      }, (error) => {
      });
    }
  }

  // remove address 
  RemoveCard(id:number,Default_Address:any):void{

    if(Default_Address == 1){
      //this.toastr.error("You can't delete default Payment option.");
      //return;
    }
    if (id) {
      let dataObj = {
        cid: this.CID,
        id: id
      }

      this.UserService.DeleteCard(dataObj).subscribe(res => {
        if (res && res.data) {
          // calling multiple method
          this.getPaymentOptions();
          // show message
          this.translate.get('CARD_REMOVED_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }
      }, (error) => {
      });

    }
  }

}
