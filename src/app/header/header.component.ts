import {
  Component,
  OnInit,
  EventEmitter,
  HostListener,
  ViewChild,
} from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import * as qs from "qs";
import * as _ from "lodash";
// Slimscroll
import { ISlimScrollOptions, SlimScrollEvent } from "ngx-slimscroll";

import { CategoryService } from "../services/category/category.service";
import { StoreService } from "../services/store/store.service";
import { UserService } from "../services/auth/user.service";
import { Globals } from "../common/globals";
import { MenuComponent } from "./menu/menu.component";
import { HomeService } from "../services/home/home.service";

// Import environment config file.
import { environment } from "../../environments/environment";

// Declear jquery
declare var jQuery: any;
declare let fbq:Function;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.sass"],
})
export class HeaderComponent implements OnInit {
  slimSOptions: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  classPFlag: boolean;
  private wasInside = false;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  IS_STORE: boolean = environment.config.IS_STORE;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  cartProductList: any;
  productCount: Number;
  subTotal: Number;
  UserToken: string;
  userData: any;
  siteSettings: any;
  checkout_data: any;
  localStorage: any;
  getParams: any;
  OpenSearch: boolean = false;
  Keyword: any;
  CurrentRoute: any;
  DashboardRoute: boolean = false;
  menuList: any;
  ComapnyLogo: any;
  ComapnyRetinaLogo: any;

  // calling child component method in parent compenent
  @ViewChild(MenuComponent) child: MenuComponent;

  constructor(
    private globals: Globals,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private CategoryService: CategoryService,
    private StoreService: StoreService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private UserService: UserService,
    private HomeService: HomeService
  ) {
    router.events.subscribe((val) => {
      if (
        location.path() == "/member" ||
        location.path() == "/member/edit-profile" ||
        location.path() == "/member/categories" ||
        location.path() == "/member/change-password" ||
        location.path() == "/member/profile"
      ) {
        this.DashboardRoute = true;
      } else {
        this.DashboardRoute = false;
      }
    });
  }

  ngOnInit() {
    this.ComapnyLogo = "../assets/images/logo.png";
    this.ComapnyRetinaLogo = "../assets/images/logo.png";

    this.Keyword = "";

    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);

    if (this.getParams && this.getParams.keyword) {
      this.Keyword = this.getParams.keyword;
    }

    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;

      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    // SlimScroll
    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    // this.slimSOptions = Object.assign({}, this.globals.slimSOptions);
    this.slimSOptions = Object.assign({}, this.globals.slimSOptions) as ISlimScrollOptions;
    
    // This service sbucribe cart product list
    this.StoreService.castCartProductList.subscribe((cartProductInfo) => {
      // set data
      this.productCount = cartProductInfo.productCount;
      this.cartProductList = cartProductInfo.data;
      this.subTotal = cartProductInfo.subTotal;
      if (cartProductInfo && cartProductInfo.openCart) {
        this.cartSbar = true;
        // Display message
        this.translate
          .get("PRODUCT_ADDED_SUCCESSFULLY_IN_CART")
          .subscribe((res: string) => {
            this.toastr.success(res, "Success!");
        });
        let proid = 0;
        let prprice = 0;
        
        if (this.cartProductList && this.cartProductList.length) {
          _.map(this.cartProductList, function (p) {
            proid = p.Product_ID;
            prprice = parseFloat(p.Product_Price);
            
          });
        }

        
        // pixel fbq add to cart event
        fbq('track', 'AddToCart', {
          value: prprice,
          currency: 'USD',
          content_ids: proid,
          content_type: 'product'
        });

      }
    });

    this.getUserData();

    // Calling get cart info method
    this.getProductCartList();

    // Calling site settings
    this.getSettings();

    //get menu
    this.getMenuList();

    // Browse Category Show/Hide script
    jQuery(document).ready(function () {
      jQuery(".js-Browse").on("click", function () {
        jQuery(".box-nav-vertical").toggleClass("show");
      });
    });
  }

  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
      };
      this.UserService.getUserData(dataObj).subscribe(
        (res) => {
          if (res && res.data) {
            this.userData = res.data;
            localStorage.setItem("user", JSON.stringify(res.data));
            this.UserService.setUserDataList();
          }
        },
        (error) => {}
      );
    }
  }

  setSearchKeyword(value) {
    if (value != "") {
      this.Keyword = value;
    }
  }

  SearchEnter(event) {
    if (event.keyCode == 13) {
      this.SearchByKeyword();
    }
  }

  SearchByKeyword(): void {
    if (this.Keyword) {
      this.changeRouter("search?keyword=" + this.Keyword);
    } else {
      this.changeRouter("search");
    }
    this.OpenSearchBox();
  }

  // Fetch menus method
  getMenuList(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getMenu(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.menuList = res.data; // Set menu list
          _.map(this.menuList, function (v, index) {
            
            return v;
          });
          setTimeout(() => {
            jQuery(".nonAuth--menu__lists > li:has(ul) a").addClass(
              "has-child"
            );
            jQuery(".header__right--links__lists > li:has(ul) a").addClass(
              "has-child"
            );
          }, 200);
        }
      },
      (err) => {}
    );
  }

  // Fetch menus method
  getSettings(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getSettings(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.siteSettings = res.data[0];

          this.ComapnyLogo =
            res.data[0] && res.data[0].Logo && res.data[0].Logo != ""
              ? this.PORTAL_URL +
                "files/logos/" +
                res.data[0].CID +
                "/" +
                res.data[0].Logo
              : "../assets/images/logo.png";

          this.ComapnyRetinaLogo =
            res.data[0] &&
            res.data[0].RetinaLogo &&
            res.data[0].RetinaLogo != ""
              ? this.PORTAL_URL +
                "files/logos/" +
                res.data[0].CID +
                "/mobile/" +
                res.data[0].RetinaLogo
              : "../assets/images/logo.png";

          this.HomeService.setSiteSettings(this.siteSettings);
        } else {
          this.siteSettings = "";
        }
      },
      (err) => {}
    );
  }

  receiveMessage($event) {
    this.cartSbar = $event;
  }

  // sign out
  signOut(): void {
    this.UserService.signOut();
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.cartSbar = false;
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // Manage class flag true/false;
  togglePMenu() {
    if (!this.classPFlag) {
      this.classPFlag = true;
      this.wasInside = true;
    }
  }

  // redirect to page according to url
  cartSideBar(): void {
    this.cartSbar = false;
  }

  OpenSearchBox(): void {
    if (this.OpenSearch) {
      this.OpenSearch = false;
      jQuery(document.body).removeClass("Search--Enabled");
    } else {
      this.OpenSearch = true;
      jQuery(document.body).addClass("Search--Enabled");
    }
  }

  // Manage host listener
  @HostListener("document:click", ["$event"])
  clickout() {
    if (!this.wasInside) {
      this.classPFlag = false;
    }
    this.wasInside = false;
  }

  // Get cart info
  getProductCartList(): void {
    let checkItem: any = localStorage.getItem("SessionID");
    if (checkItem) {
      let dataObj = {
        cid: this.CID,
        SessionID: checkItem,
      };
      this.StoreService.getProductCartInfo(dataObj).subscribe(
        (res1) => {
          if (res1 && res1.data && res1.data.length) {
            // emit data with broadcast service
            this.StoreService.setCartProductList(res1);
          }
        },
        (error) => {
          // Reset value for service
          this.StoreService.setCartProductList("");
        }
      );
    }
  }

  // remove item from cart
  removeCartItem(ID: Number): void {
    let SessionID: any = localStorage.getItem("SessionID");
    if (ID && SessionID) {
      // define object
      let item = {
        cid: this.CID,
        ID: ID,
        SessionID: SessionID,
      };
      // calling service
      this.StoreService.removeCartItem(item).subscribe(
        (res) => {
          if (res) {
            // refresh cart item
            this.getProductCartList();
            // Display message
            this.translate
              .get("PRODUCT_REMOVED_SUCCESSFULLY_FROM_CART")
              .subscribe((res: string) => {
                this.toastr.success(res, "Success!");
              });
            if (res && res.data == 0) {
              if (
                this.router.url == "/checkout" ||
                this.router.url == "/payment"
              ) {
                this.changeRouter("shop");
                // remove previous session data
                this.translate
                  .get("CART_IS_EMPTY_CONTINUE_SHOPPING")
                  .subscribe((res: string) => {
                    this.toastr.error(res, "Success!");
                  });
                localStorage.removeItem("checkout_data_" + SessionID);
              }
            } else {
              if (this.router.url) {
                if (this.router.url == "/payment") {
                  // refresh calculation on payment page
                  // emit data with broadcast service
                  this.StoreService.setPaymentProductList(
                    "refresh_payment_page"
                  );
                }
              }
            }
          }
        },
        (error) => {
          // Display error
          this.toastr.error(error.statusText, "Error!");
        }
      );
    }
  }

  // for cart side bar
  cartSbar: boolean;
  cartSiderBar(): void {
    if (!this.cartSbar) {
      this.cartSbar = true;
    } else {
      this.cartSbar = false;
    }
  }
}
