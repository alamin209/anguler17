import { Component, OnInit, TemplateRef, ViewChild, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CategoryService } from '../services/category/category.service';
import { HomeService } from '../services/home/home.service'
import { NewsService } from '../services/news/news.service';
import { StoreService } from '../services/store/store.service'
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { UserService } from '../services/auth/user.service'
// Import environment config file.
import { environment } from '../../environments/environment';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.sass']
})

export class FooterComponent implements OnInit {
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  categoryList: any = [];
  footerMList: Array<[]>;
  pageContentData: any = [];
  pageNotFound: any;
  PageContent: any;
  siteSettings: any;
  latestNews: any;
  quickProductData: any;
  productQuantity: any;
  newUUid: string;
  userData: any;
  UserToken: any;
  SelectOptions: any;
  itemsData: any;
  modalRef: BsModalRef;
  localStorage:any;
  
  @ViewChild('openContentModal', {}) openContentModal: ModalDirective;

  @ViewChild('quickViewModel', {}) quickViewModel: ModalDirective;

  constructor(
    private CategoryService: CategoryService,
    private router: Router,
    private HomeService: HomeService,
    private NewsService: NewsService,
    private StoreService: StoreService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private UserService: UserService,
    private modalService: BsModalService,
    @Inject(DOCUMENT) private document: Document
  ) {

    // Set translate language
    translate.setDefaultLang('en');
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
    // get origin path
    const origin = this.document.location.origin;
  }

  ngOnInit() {
    // This service subscribe category list
    this.CategoryService.castCategory.subscribe(categoryList => this.categoryList = categoryList);

    // This service subscribe global page content data
    this.CategoryService.castUniversalModel.subscribe(pageContentData => {
      this.pageContentData = pageContentData;
    });

    // Calling footer menu method
    this.getFooterMenuList();

    // Calling site settings 
    this.getSettings();

    // get latest news 
    this.getLatestNews();

    // This page content model
    this.HomeService.castPageContent.subscribe(data => {
      // open gloabl model
      if (data) {
        this.openModal(data);
      }
    });

    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    // get quick product data
    this.StoreService.castQuickProduct.subscribe(quickProductData => {
      this.quickProductData = quickProductData;
      // check data
      if (this.quickProductData && this.quickProductData.ID) {
        this.productQuantity = 1;
        let cond = {
          ID: this.quickProductData.ID,
          cid: this.CID
        }
        // pulling data
        this.quickProductData.slider = [];
        this.StoreService.getQPImageAttributes(cond).subscribe(res => {
          // check data
          if (res && res.data) {
            // set category
            this.quickProductData.Product_Categories = res.data.Product_Categories;
            // set attributes
            this.quickProductData.attributes = res.data.attributes;
            // set slider
            this.quickProductData.slider = res.data.slider;
            let urlImage = this.awsCloudfrontURL;
            let imageCID = this.quickProductData.CID;
            let pID = this.quickProductData.ID;
            // manage slider images
            if (this.quickProductData && this.quickProductData.slider && this.quickProductData.slider.length) {
              _.map(this.quickProductData.slider, function (v) {
                if (v.type == "image") {
                 if (v.source == "url") {
                    v.imageUrl =
                      v && v.ImageLarge ? v.ImageLarge : "./assets/images/no-image.png";
                    v.thumbimageUrl =
                      v && v.Image ? v.Image : "./assets/images/no-image.png";
                    if (
                      new Date(v.AddedOn).getTime() >=
                      new Date("2019-09-18").getTime()
                    ) {
                      v.mediumUrl =
                        v && v.ImageLarge ? v.ImageLarge : "./assets/images/no-image.png";
                    } else {
                      v.mediumUrl =
                        v && v.ImageLarge
                          ? v.ImageLarge
                          : "./assets/images/no-image.png";
                    }
                  } else {
                    v.imageUrl =
                      v && v.Image
                        ? urlImage +
                          "files/store/products/" +
                          imageCID +
                          "/" +
                          pID +
                          "/" +
                          v.Image
                        : "./assets/images/no-image.png";
                    v.thumbimageUrl =
                      v && v.Image
                        ? urlImage +
                          "files/store/products/" +
                          imageCID +
                          "/" +
                          pID +
                          "/thumb_" +
                          v.Image
                        : "./assets/images/no-image.png";
                    if (
                      new Date(v.AddedOn).getTime() >=
                      new Date("2019-09-18").getTime()
                    ) {
                      v.mediumUrl =
                        v && v.Image
                          ? urlImage +
                            "files/store/products/" +
                            imageCID +
                            "/" +
                            pID +
                            "/medium_" +
                            v.Image
                          : "./assets/images/no-image.png";
                    } else {
                      v.mediumUrl =
                        v && v.Image
                          ? urlImage +
                            "files/store/products/" +
                            imageCID +
                            "/" +
                            pID +
                            "/" +
                            v.Image
                          : "./assets/images/no-image.png";
                    }
                  }
                  
                }
                return v;
              });
            } else {
              this.quickProductData.slider.push({
                imageUrl: origin + "/assets/images/no-image.png",
                thumbimageUrl: origin + "/assets/images/no-image.png",
                mediumUrl: origin + "/assets/images/no-image.png"
              });
            }
            // open model 
            this.quickViewModel.show();
            /*
            jQuery(document).ready(function () {
              // Js product single slider
              jQuery('.js-product-slider').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
                dots: false,
                autoplay: false
              });
              // tigger
              jQuery('.js-product-slider').slick('slickGoTo', 0, false);

            });
            */

            jQuery(document).ready(function () {
              var jQuerypostCarousel = jQuery(".product-images");
              var jQueryslickElement = jQuery(".js-product-slider");
              jQuery(".modal").on("shown.bs.modal", function () {
                jQueryslickElement.slick("setPosition");
                jQuerypostCarousel.addClass("open");
              });

              setTimeout(function () {
                jQueryslickElement.slick({
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: true,
                  dots: false,
                  autoplay: false,
                });
                jQuery(".js-product-slider").slick("slickGoTo", 0, false);
              }, 1000);
            });

          }
        }, (err) => {

        });

      }
    });
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  // Fetch menus method
  getFooterMenuList(): void {
    // Set conditions
    let cond = {
      cid: this.CID
    };
    this.HomeService.getFooterMenu(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          this.footerMList = res.data // Set menu list
        }
      }, (err) => {

      });
  }

  // Fetch menus method
  getSettings(): void {
    // Set conditions
    let cond = {
      cid: this.CID
    };
    this.HomeService.getSettings(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          this.siteSettings = res.data[0];
        } else {
          this.siteSettings = '';
        }
      }, (err) => {

      });
  }

  // this for global model
  // for model 
  openModal(slug: any) {
    // Set conditions
    let cond = {
      cid: this.CID,
      page_name: slug
    };
    this.pageNotFound = false;
    // calling service
    this.HomeService.getFinancingPage(cond).subscribe(res => {
      // get financing page dat
      if (res && res.data && res.data && res.data.pageData) {
        this.PageContent = res.data.pageData // Set page data
      } else {
        this.PageContent = {};
        this.pageNotFound = true;
      }
      // for open model
      this.openContentModal.show();
    }, (err) => {

    });
  }

  // close model 
  hideChildModal(): void {
    this.openContentModal.hide();
  }

  // pull latest news
  getLatestNews() {
    let cond = {
      cid: this.CID
    }
    // get news lists
    this.NewsService.getLatestNews(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.latestNews = res.data;
      } else {
        this.latestNews = [];
      }
    }, (err) => {
    })
  }

  // close quick product model 
  hideQuickProductModal(): void {
    this.quickViewModel.hide();
  }

  // manage prodcut quentity 
  manageProductQuantity(quantity, status): void {
    if (this.productQuantity >= 0) {
      if (status) {
       // (this.productQuantity == quantity) ? quantity : this.productQuantity++;
        this.productQuantity++;
      } else {
        (this.productQuantity > 1) ? this.productQuantity-- : this.productQuantity;
      }
    }
  }


  // Add to cart method
  productAddToCart(item: any, itemCID: any, qty: Number, SelectOpt: false, Shipping_API: any) {
  
    let itemID = item.ID;
    // Set sesson id;
    let checkItem: any = localStorage.getItem('SessionID');
    if (!checkItem) {
      checkItem = this.newUUid;
      localStorage.setItem('SessionID', checkItem);
    }

    
    let addCart = {
      CID: itemCID,
      MemberID: (this.userData && this.userData.id) ? this.userData.id : '',
      SessionID: checkItem,
      Cart_Date: new Date(),
      Product_ID: itemID,
      Product_Count: this.productQuantity,
      Product_Price: item.Product_Price,
      Product_Options: (this.SelectOptions && this.SelectOptions.length) ? this.SelectOptions : '',
      Shipping_API: Shipping_API
    }
    this.StoreService.tmpAddToProduct(addCart).subscribe(res => {
      // Check data 
      if (res && res.data && res.data && res.data.SessionID) {
        // Get product cart info
        let dataObj = {
          cid: res.data.CID,
          SessionID: res.data.SessionID
        }
        this.StoreService.getProductCartInfo(dataObj).subscribe(res1 => {
          if (res1 && res1.data && res1.data.length) {
            res1.openCart = true;
            // emit data with broadcast service
            this.StoreService.setCartProductList(res1);
          }
        }, (error) => {

        });
      }
    }, (err) => {
        if(err.error.error == 'SELECT_REQUIRED_OPTIONS'){
            
            this.hideQuickProductModal();
            let slug = "product/" + item.Product_Slug;
            this.changeRouter(slug);
            
            this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
                this.toastr.error(res);
            });
        }else{
            this.toastr.error(err.error.error);
        }
    });
  }


  // add to wishlist
  AddtoWishlist(ID: Number, Slug: String) {
    // Set sesson id;
    if (!(this.userData)) {
      this.translate.get('LOGIN_FIRST').subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=product&slug=" + Slug;
      this.changeRouter(slug);
    }
    let addWishlist = {
      CID: this.CID,
      userId: (this.userData && this.userData.id) ? this.userData.id : '',
      Product_ID: ID,
      Wishlist_ID: 0
    }
    this.UserService.addToWishlist(addWishlist).subscribe(res => {
      // Check data 
      if (res && res.data) {
        // Display message 
        this.translate.get('PRODUCT_IN_WISHLIST_ADDED_SUCCESSFULLY').subscribe((res: string) => {
          this.toastr.success(res);
        });
        
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
        
      }
    });
  }


  // open global popup
  openModalOne(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }

  // for model 
  openModalPopup(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }


}
