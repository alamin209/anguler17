import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

// import service 
import { UserService } from '../../services/auth/user.service'
import { StoreService } from '../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.sass']
})
export class OrderHistoryComponent implements OnInit {

  reviewForm;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  UserToken: string;
  userData: any;
  OrdersData: Array<any>;
  setTab: string;
  modalRef: BsModalRef;
  max: Number = 5;
  rate: Number = 0;
  isReadonly: boolean = false;
  productReviews: any;
  AverageRatings: any;
  ProductID: Number;

  constructor(
    private router: Router,
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
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    // call fucntion for fetch orders
    this.getUserOrders('all');

    // Define review form
    this.reviewForm = this.formBuilder.group({
      Title: ['', Validators.required],
      Message: ['', Validators.required],
      Rating: ['', Validators.required],
    });

  }

  // save product review
  onSubmit(frmData) {
    this.markFormGroupDirtied(this.reviewForm);
    if (this.reviewForm.valid) {
      frmData['CID'] = this.CID;
      frmData['Product_ID'] = this.ProductID;
      frmData['CustomerID'] = this.userData.id;
      // call service save product review
      this.StoreService.SaveProductReview(frmData).subscribe((res) => {
        // show message
        this.translate.get('PRODUCT_REVIEW_POSTED_SUCCESSFULLY', 'Success!').subscribe((res: string) => {
          this.toastr.success(res);
        });

        // reset from 
        this.reviewForm.reset();

        this.modalRef.hide();

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
  getUserOrders(status): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
        status: status
      }
      this.UserService.getUserOrders(dataObj).subscribe(res => {
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

  // for model 
  openModal(template: TemplateRef<any>, ProductID: any) {
    this.ProductID = ProductID;
    this.modalRef = this.modalService.show(template);
  }

  // this for cancel orders 
  cancelOrder(item) {
    if (item && item.ID) {
      // calling service
      this.StoreService.cancelOrder(item).subscribe((res) => {
        // call fucntion for fetch orders
        this.getUserOrders('all');
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
