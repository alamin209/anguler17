import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { StoreService } from '../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../header/header.component';
import { HomeService } from '../../services/home/home.service'
import { UserService } from '../../services/auth/user.service'

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.sass']
})
export class CartComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  cartProductList: any;
  productCount: Number;
  subTotal: Number;
  CartProducts: any;
  UpdateCartAct:boolean;
  userData:any;
  
  constructor(private StoreService: StoreService,
    private router: Router, 
    private translate: TranslateService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private HomeService:HomeService,
    private UserService:UserService
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
      
    });
    
    this.UpdateCartAct = false;
    this.cartProductList = [];
    
    setTimeout(() => {
      // This service sbucribe cart product list
      this.StoreService.castCartProductList.subscribe(cartProductInfo => {
        // set data
        if (!cartProductInfo.data) {
          //this.changeRouter('shop');
        }

        this.productCount = cartProductInfo.productCount;
        this.cartProductList = cartProductInfo.data;
        this.subTotal = cartProductInfo.subTotal;
        
        let CartProducts = [];
        if (this.cartProductList && this.cartProductList.length) {
          _.map(this.cartProductList, function (v) {
            CartProducts.push({
              ProductID: v.Product_ID,
              Quantity: v.Product_Count,
            });
          })
        }
        this.CartProducts = CartProducts;
      });
    }, 1000);
  }

  // update Cart Product Quantity
  UpdateQty(ProductID:number,Stock:number,status):void{
    this.UpdateCartAct = true;
    _.map(this.CartProducts, function (v) {
      if(v.ProductID == ProductID){
          if (status) {
           //(v.Quantity == Stock) ? Stock : v.Quantity++;
            v.Quantity++;
          } else {
            (v.Quantity > 1) ? v.Quantity-- : v.Quantity;
          }
        return v;
      }
      
    });
  }

  // update cart now
  UpdateCart():void{
    let SessionID: any = localStorage.getItem('SessionID');
    if (SessionID) {
      let dataObj = {
        CID: this.CID,
        SessionID: SessionID,
        CartProducts:this.CartProducts
      }
      this.StoreService.updateCart(dataObj).subscribe(res1 => {
        if (res1 && res1.data && res1.data.length) {
          // refresh cart item
          this.getProductCartList();
          // Display message 
          this.translate.get('CART_UPDATE_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
          this.UpdateCartAct = false;
        }
      }, (error) => {
        // Reset value for service
          this.toastr.error(error.error, 'Error!');
      });
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // Get cart info 
  getProductCartList(): void {
    let checkItem: any = localStorage.getItem('SessionID');
    if (checkItem) {
      let dataObj = {
        cid: this.CID,
        SessionID: checkItem
      }
      this.StoreService.getProductCartInfo(dataObj).subscribe(res1 => {
        if (res1 && res1.data && res1.data.length) {
          // emit data with broadcast service
          this.StoreService.setCartProductList(res1);
        }
      }, (error) => {
        // Reset value for service
        this.StoreService.setCartProductList('');
        this.changeRouter('shop');
      });
    }
  }
  
  // open global popup
  openModalOne(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }

  // remove item from cart 
  removeCartItem(ID: Number): void {
    let SessionID: any = localStorage.getItem('SessionID');
    if (ID && SessionID) {
      // define object
      let item = {
        cid: this.CID,
        ID: ID,
        SessionID: SessionID
      }
      // calling service
      this.StoreService.removeCartItem(item).subscribe(res => {
        if (res) {
          // refresh cart item
          this.getProductCartList();
          // Display message 
          this.translate.get('PRODUCT_REMOVED_SUCCESSFULLY_FROM_CART').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }
        if(res && res.data == 0){
            this.changeRouter('shop');
            this.translate.get('CART_IS_EMPTY_CONTINUE_SHOPPING').subscribe((res: string) => {
                this.toastr.error(res, 'Success!');
            });
        }
      }, (error) => {
        // Display error 
          this.toastr.error(error.statusText, 'Error!');
      });
    }
  }

}
