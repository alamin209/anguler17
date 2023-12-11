import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Router,ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { forkJoin } from 'rxjs';
import * as _ from 'lodash';
import * as qs from "qs";

// import service 
import { UserService } from '../../services/auth/user.service'
import { StoreService } from '../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-sales',
  templateUrl: './my-sales.component.html',
  styleUrls: ['./my-sales.component.sass']
})
export class MySalesComponent implements OnInit {

  changeStatusForm;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  APP_URL: string = environment.config.APP_URL;
  UserToken: string;
  userData: any;
  OrdersData: Array<any>;
  currentUser: any;
  userPackage: any;
  setTab: string;
  modalRef: BsModalRef;
  max: Number = 5;
  rate: Number = 0;
  isReadonly: boolean = false;
  productReviews: any;
  AverageRatings: any;
  OrderID: Number;
  ProductID: Number;
  OProductID: Number;
  OPStatus: Number;
  OPNewStatus: Number;
  ChangingStatus: boolean = false;
  getParams:any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UserService: UserService,
    private StoreService: StoreService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
  ) {
    // Set translate language
    translate.setDefaultLang('en');

    // set product detail tabs
    this.setTab = 'All_Orders';
  }

  ngOnInit() {
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      
      this.getParams = this.route.snapshot.queryParamMap;
      this.getParams = qs.parse(this.getParams.params);
      
      if (this.getParams && this.getParams.sacc) {
        if(this.getParams.sacc){
            let dataObj = {
                cid: this.CID,
                userId: this.userData.id
            }
            this.UserService.st_account_status_update(dataObj).subscribe(
            (res) => {
              // account updated
            },
            (error: any) => {
              
            }
          );
        }
      }

      this.getUserData();
      // get user token
      this.UserToken = localStorage.getItem('token');


    });

    this.OPStatus = 1;
    this.OPNewStatus = 1;

    
    
    

    // Define review form
    this.changeStatusForm = this.formBuilder.group({
      Status: ['', Validators.required],
      Message: ['', Validators.required],
      CarrierName: [''],
      TrackingLink: [''],
    });

  }

  ConnectStripe(){
    
    let dataObj = {
      CID: this.CID,
      userId: this.userData.id
    }

    dataObj['stripe_acc_id'] = this.currentUser.stripe_acc_id;
    dataObj['stripe_acc_active'] = this.currentUser.stripe_acc_active;
    dataObj['ProfileLink'] = this.APP_URL+'/member/profile';
    dataObj['BackLink'] = this.APP_URL+'/member/sales?sacc=1';


    this.UserService.GenerateStripeLink(dataObj).subscribe((res) => {
      
      if(res.staccreate){
        window.location.href = res.staclink;
      }else{
        this.toastr.error('Something went wrong! Please try again later', 'Error!');
      }

    },
    (error: any) => {
      if (error.error.error) {
        this.toastr.error(error.error.error, 'Error!');
      }
    });
    
    //window.location.href = link;

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
          this.userPackage = res.user_package;
          
          this.UserService.setAccountDataList(res);

          // call fucntion for fetch orders
          this.getSellerOrders('all');


        }
      });
    }
  }


  // save new status
  onSubmitStatus(frmData) {
    this.markFormGroupDirtied(this.changeStatusForm);
    if (this.changeStatusForm.valid) {

      this.ChangingStatus = true;
      frmData['CID'] = this.CID;
      frmData['OrderID'] = this.OrderID;
      frmData['OProductID'] = this.OProductID;
      frmData['Product_ID'] = this.ProductID;
      frmData['OPStatus'] = this.OPStatus;
      frmData['CustomerID'] = this.userData.id;
      // call service save product review
      this.StoreService.ChangeOrderStatus(frmData).subscribe((res) => {
        // show message
        this.translate.get('ORDER_STATUS_SAVED_SUCCESSFULLY', 'Success!').subscribe((res: string) => {
          this.toastr.success(res);
        });

        // reset from 
        this.changeStatusForm.reset();

        this.modalRef.hide();
        this.ChangingStatus = false;
        this.OPStatus = 1;
        this.OPNewStatus = 1;

        this.getSellerOrders('all');
        setTimeout(() => {  
          //window.location.reload();
        },1000);

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
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get current user address
  getSellerOrders(status): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
        status: status
      }
      this.UserService.getSellerOrders(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.OrdersData = res.data;
        } else {
          this.OrdersData = [];
        }
      }, (error) => {
        this.OrdersData = [];
      });
    }
  }

  SetNewStatus(OPNewStatus:any){
    this.OPNewStatus = OPNewStatus;
  }

  // for model 
  openModal(template: TemplateRef<any>, OrderID: any,ProductID: any,OProductID: any,OPStatus: any) {
    this.OrderID = OrderID;
    this.ProductID = ProductID;
    this.OProductID = OProductID;
    this.OPStatus = OPStatus;
    
    this.modalRef = this.modalService.show(template);
  }

  // this for cancel orders 
  cancelOrder(item) {
    if (item && item.ID) {
      // calling service
      this.StoreService.cancelOrder(item).subscribe((res) => {
        // call fucntion for fetch orders
        this.getSellerOrders('all');
        // show message
        this.translate.get('ORDER_ITEM_CANCELLED_SUCCESSFULLY', 'Success!').subscribe((res: string) => {
          this.toastr.success(res);
        });
      }, (error: any) => {
        if (error.error) {
           this.toastr.error(error.error.message, 'Error!');
        }
      });
    } else {

    }
  }
}
