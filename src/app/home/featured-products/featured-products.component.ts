import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { StoreService } from "../../services/store/store.service";
import * as uuid from "uuid";
import { UserService } from "../../services/auth/user.service";
// Handle the global property
import { Globals } from "../../common/globals";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

// Import environment config file.
import { environment } from "../../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-featured-products",
  templateUrl: "./featured-products.component.html",
  styleUrls: ["./featured-products.component.sass"],
})
export class FeaturedProductsComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  storeList: Array<any>;
  newUUid: string;
  UserToken: string;
  userData: any;
  featuredSliderOptions: any;

  constructor(
    private StoreService: StoreService,
    private router: Router,
    private UserService: UserService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private globals: Globals
  ) {
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
  }

  ngOnInit() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    // Calling store list method
    this.get_store_list();

    // Call method
    //jQuery('#FeaturedProducts .owl-carousel').owlCarousel();

    // Copy objects
    this.featuredSliderOptions = Object.assign(
      {},
      this.globals.featuredASOptions
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // Get store list
  get_store_list(): void {
    let cond: object = {
      cid: this.CID,
      limit: 1000,
    };

    // Calling service
    this.StoreService.getStorelist(cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.storeList = res.data.length ? res.data : [];
          let urlImage = this.AWSBUCKETURL;
          let companyCID = this.CID;
          if (this.storeList && this.storeList.length) {
            _.map(this.storeList, function (v) {
              if (v.Image_type == "image") {
                if (v.Image_Source == "url") {
                  v.imageUrl =
                    v && v.ImageLarge
                      ? v.ImageLarge
                      : "./assets/images/no-image.png";
                  v.mediumUrl =
                    v && v.ImageLarge
                      ? v.ImageLarge
                      : "./assets/images/no-image.png";
                  v.thumbimageUrl =
                    v && v.Image ? v.Image : "./assets/images/no-image.png";
                } else {
                  v.imageUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.mediumUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/medium_" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.thumbimageUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/thumb_" +
                        v.Image
                      : "./assets/images/no-image.png";
                }
              } else {
                v.imageUrl =
                  v && v.Image
                    ? urlImage +
                      "files/store/products/" +
                      v.CID +
                      "/" +
                      v.ID +
                      "/thumb/" +
                      v.Image
                    : "./assets/images/no-image.png";
                v.thumbimageUrl =
                  v && v.Image
                    ? urlImage +
                      "files/store/products/" +
                      v.CID +
                      "/" +
                      v.ID +
                      "/thumb/" +
                      v.Image
                    : "./assets/images/no-image.png";
              }
              return v;
            });
          }

          jQuery(document).ready(function () {
            // Js product slider
            jQuery(".js-product-slider").slick({
              slidesToShow: 5,
              slidesToScroll: 1,
              arrows: true,
              infinite: false,
              autoplay: true,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true,
                  },
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  },
                },
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
              ],
            });
          });
        }
      },
      (err) => {}
    );
  }

  // Add to cart method
  productAddToCart(item: any, qty: Number) {
    // Set sesson id;
    let checkItem: any = localStorage.getItem("SessionID");
    if (!checkItem) {
      checkItem = this.newUUid;
      localStorage.setItem("SessionID", checkItem);
    }
    let addCart = {
      CID: item.CID,
      MemberID: this.userData && this.userData.id ? this.userData.id : "",
      SessionID: checkItem,
      Cart_Date: new Date(),
      Product_ID: item.ID,
      Product_Price: item.Product_Price,
      Product_Count: qty,
      Shipping_API: item.Shipping_API,
    };
    this.StoreService.tmpAddToProduct(addCart).subscribe(
      (res) => {
        // Check data
        if (res && res.data && res.data && res.data.SessionID) {
          // Get product cart info
          let dataObj = {
            cid: res.data.CID,
            SessionID: res.data.SessionID,
          };
          this.StoreService.getProductCartInfo(dataObj).subscribe(
            (res1) => {
              if (res1 && res1.data && res1.data.length) {
                res1.openCart = true;
                // emit data with broadcast service
                this.StoreService.setCartProductList(res1);
              }
            },
            (error) => {
              this.toastr.error(error.error.error);
            }
          );
        }
      },
      (err) => {
        if (err.error.error == "SELECT_REQUIRED_OPTIONS") {
          let slug = "product/" + item.Product_Slug;
          this.changeRouter(slug);

          this.translate
            .get("PLEASE_SELECT_OPTIONS")
            .subscribe((res: string) => {
              this.toastr.error(res);
            });
        } else {
          this.toastr.error(err.error.error);
        }
      }
    );
  }

  // add to wishlist
  AddtoWishlist(ID: Number, Slug: String, WishlistModal) {
    // Set sesson id;
    if (!this.userData) {
      let slug = "login?redirect=product&slug=" + Slug;
      this.changeRouter(slug);
    }
    let addWishlist = {
      CID: this.CID,
      userId: this.userData && this.userData.id ? this.userData.id : "",
      Product_ID: ID,
      Wishlist_ID: 0,
    };
    this.UserService.addToWishlist(addWishlist).subscribe(
      (res) => {
        // Check data
        if (res && res.data) {
          // Display message
          this.translate
            .get("PRODUCT_IN_WISHLIST_ADDED_SUCCESSFULLY")
            .subscribe((res: string) => {
              this.toastr.success(res);
            });
        }
      },
      (err) => {
        if (err.error.error) {
          this.toastr.error(err.error.error);
        }
      }
    );
  }

  // set quick product data for quick popup
  setQuickProductData(item): void {
    this.StoreService.setQuickProductItem(item);
  }
}
