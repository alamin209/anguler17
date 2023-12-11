import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';

// import service 
import { UserService } from '../../services/auth/user.service'
import { StoreService } from '../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-track-my-order',
  templateUrl: './track-my-order.component.html',
  styleUrls: ['./track-my-order.component.sass']
})
export class TrackMyOrderComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  UserToken: string;
  userData: any;
  orderId: any;
  productId: any;
  trackingData: any;
  productImage: any;
  productData: any
  trackingDetailData: any;
  shippingData: any;
  upsShippingData: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UserService: UserService,
    private StoreService: StoreService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    // brodcast data for login user
    this.userData = '';
    
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    // get url params
    this.orderId = this.route.snapshot.params.orderId;
    this.productId = this.route.snapshot.params.id;

    // get order info
    this.getOrderInfo();
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get order info
  getOrderInfo() {
    // check conditions
    if (this.orderId && this.productId) {
      // create condition object
      let cond = {
        orderId: this.orderId,
        productId: this.productId
      };
      // get product tracking data
      this.StoreService.getOrderInfo(cond).subscribe((res1) => {
        // get shipping info
        if (res1 && res1.orderData) {
          this.shippingData = res1.orderData;
          this.shippingData.Order_Date = moment(this.shippingData.Order_Date).format("dddd, DD MMMM");
          // call tracking method
          if (this.shippingData && this.shippingData.ShippingType) {
            this.trackingProduct(this.shippingData.ShippingType);
          }
        }
        // check response
        let urlImage = this.PORTAL_URL;
        // set image data
        if (res1 && res1.productImage) {
          this.productImage = res1.productImage;
          this.productImage.ImageUrl = (res1.productImage.CID && res1.productImage.ID && res1.productImage.Image) ? urlImage + 'files/store/products/' + res1.productImage.CID + '/' + res1.productImage.Product_ID + '/' + res1.productImage.Image : "./assets/images/no-image.png";
        }
        // set product data
        if (res1 && res1.productData) {
          this.productData = (res1.productData) ? res1.productData : '';
        }
      }, (error: any) => {

      });
    }
  }

  // tracking product 
  trackingProduct(ShippingType) {
    // check conditions
    if (this.orderId && this.productId) {
      // create condition object
      let cond = {
        orderId: this.orderId,
        productId: this.productId
      };
      // for ltl shipping
      if (ShippingType == 'LTL') {
        // calling service
        this.StoreService.LTLTrackingProduct(cond).subscribe((res) => {
          if (res) {
            this.getTrackingData();
          }
        }, (error: any) => {

        });
      } else if (ShippingType == 'UPS') {
        // calling service
        this.StoreService.UPStrackingProduct(cond).subscribe((res) => {
          if (res) {
            this.getTrackingData();
          }
        }, (error: any) => {

        });
      }

    }
  }

  // get tracking data 
  getTrackingData() {
    // check conditions
    if (this.orderId && this.productId) {
      // create condition object
      let cond = {
        orderId: this.orderId,
        productId: this.productId
      };
      // get product tracking data
      this.StoreService.getProductTrackingData(cond).subscribe((res1) => {
        // check response
        if (res1 && res1.orderData) {
          this.trackingData = res1.orderData;
          this.trackingData.TrackingResponse = JSON.parse(this.trackingData.TrackingResponse);
          this.trackingData.Order_Date = moment(this.trackingData.Order_Date).format("dddd, DD MMMM");
          // this section for LTL
          if (this.shippingData && this.shippingData.ShippingType && this.shippingData.ShippingType == "LTL") {
            // get tracking detail data
            this.trackingData.TrackingResponse = (this.trackingData.TrackingResponse && this.trackingData.TrackingResponse.length) ? this.trackingData.TrackingResponse[0] : {};
            if (this.trackingData && this.trackingData.TrackingResponse && this.trackingData.TrackingResponse.responses && this.trackingData.TrackingResponse.responses.response && this.trackingData.TrackingResponse.responses.response.shipments && this.trackingData.TrackingResponse.responses.response.shipments.shipment && this.trackingData.TrackingResponse.responses.response.shipments.shipment.statuses && this.trackingData.TrackingResponse.responses.response.shipments.shipment.statuses.status && this.trackingData.TrackingResponse.responses.response.shipments.shipment.statuses.status && this.trackingData.TrackingResponse.responses.response.shipments.shipment.statuses.status.length) {
              this.trackingDetailData = this.trackingData.TrackingResponse.responses.response.shipments.shipment.statuses.status;
              // check array length
              if (this.trackingDetailData && this.trackingDetailData.length) {
                // set date format
                _.map(this.trackingDetailData, function (v) {
                  v.date = moment(v.date).format("hh:mm A dddd, DD MMMM");
                  return v;
                })
              }
            } else {
              this.trackingDetailData = [];
            }
          } else if (this.shippingData && this.shippingData.ShippingType && this.shippingData.ShippingType == "UPS") {
            // check data conditions
            if (this.trackingData && this.trackingData.TrackingResponse && this.trackingData.TrackingResponse.TrackResponse && this.trackingData.TrackingResponse.TrackResponse.Shipment.Package){
              this.upsShippingData = this.trackingData.TrackingResponse.TrackResponse.Shipment.Package;
            } else { 
              this.upsShippingData = {};
            }
            // set date
            this.upsShippingData.Activity.Date = moment(this.upsShippingData.Activity.Date).format("hh:mm A dddd, DD MMMM YYYY")
            // set time
            this.upsShippingData.Activity.Time = moment(this.upsShippingData.Activity.Time).format("hh:mm A dddd, DD MMMM YYYY")
          }
        } else {
          this.trackingData = [];
        }
      }, (error: any) => {

      });
    }
  }
}
