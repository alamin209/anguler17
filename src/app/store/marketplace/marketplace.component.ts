import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { StoreService } from "../../services/store/store.service";
import { SliderService } from "../../services/slider/slider.service";
import { UserService } from "../../services/auth/user.service";
import { ToastrService } from "ngx-toastr";
import { Title, Meta } from "@angular/platform-browser";

// Import environment config file.
import { environment } from "../../../environments/environment";
import { CategoryService } from "../../services/category/category.service";
import { HomeService } from "../../services/home/home.service";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-marketplace",
  templateUrl: "./marketplace.component.html",
  styleUrls: ["./marketplace.component.sass"],
})
export class MarketplaceComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  productsList: Array<any>;
  newUUid: string;
  sliderData: Array<[]>;
  UserToken: string;
  userData: any;
  categorySlug: string;
  categoryList: any;
  findSelectedCategories: any;
  limit: number = 20;
  cond: any;
  totalItems: number = 0;
  currentPage: number = 0;
  page: number = 1;
  ProductPerRow: any = 4;
  qQueryString: any;
  priceQueryString: any;
  getParams: any;
  typeQueryString: any;
  manufacturerQueryString: any;
  sorFilter: number;
  productNFound: boolean = false;
  CategoriesBreadcumbs: any;
  manufacturers: any;
  categorySelected: any;
  aAttachmentList: any;
  aAttachmentSlug: any;
  aAttachmentTypes: any;
  aATypesbreadcrumbs: any;
  localStorage: any;
  AllProductsNotFound: boolean = false;
  AllProductsLoaded: boolean = false;
  LoadingMore: boolean = false;
  Keyword: any;
  storeList: Array<any>;
  MobileCategory: any = [];
  SiteSetttings: any;
  Fpage: string = 'marketplace';
  FMpage: string = 'marketplace';
  
  

  constructor(
    private StoreService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private SliderService: SliderService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private HomeService: HomeService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title
  ) {
    // Set translate language
    translate.setDefaultLang("en");
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();

    // get activated route
    this.activatedRoute.url.subscribe((url) => {

      

      // manage all serach filter
      this.checkKeyParam();


    });
  }

  ngOnInit() {
    // manage all serach filter
    this.checkKeyParam();

    this.get_featured_products();

    // Mobile Category Accordian script
    jQuery(document).ready(function () {
      jQuery(".mobile-category").on('click', function () {
        if (jQuery(this).hasClass("is--opened")) {
          jQuery(".mobile-category").removeClass("is--opened");
        } else {
          jQuery(".mobile-category").removeClass("is--opened");
          jQuery(this).addClass("is--opened");
        }
        jQuery(this)
          .next()
          .slideToggle(500)
          .siblings(".mobile-category-body")
          .slideUp();
      });
    });


    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe((data) => {
      if (data) {

        this.SiteSetttings = data;
        // set meta tags values
        let title = data.meta_title;
        let Description = data.meta_tag_desc;
        let keywords = data.meta_tag;
        this.titleService.setTitle(title);

        this.metaTagService.updateTag({ name: "keywords", content: keywords });
        this.metaTagService.updateTag({
          name: "description",
          content: Description,
        });

        let ogtitle = title;
        let ogdescription = Description;
        let ogurl = location.origin + "/shop";
        let ogimage =
          location.origin +
          "/assets/Facebook-Auto-populated-Image-1200x630.jpg";

        this.metaTagService.updateTag({
          property: "og:title",
          content: ogtitle,
        });
        this.metaTagService.updateTag({
          property: "og:description",
          content: ogdescription,
        });
        this.metaTagService.updateTag({ property: "og:url", content: ogurl });
        this.metaTagService.updateTag({
          property: "og:image",
          content: ogimage,
          itemprop: "image",
        });

        this.metaTagService.updateTag({
          name: "twitter:title",
          content: ogtitle,
        });
        this.metaTagService.updateTag({
          name: "twitter:description",
          content: ogdescription,
        });
        this.metaTagService.updateTag({
          name: "twitter:card",
          content: ogimage,
        });
        this.metaTagService.updateTag({
          name: "twitter:image",
          content: ogimage,
          itemprop: "image",
        });
      }
    });
  }

  checkKeyParam() {

    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    // check qeury price
    if (this.getParams && this.getParams.q) {
        // set price params
        this.Keyword = this.getParams.q;
        
    }

    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    this.ProductPerRow = 4;

    // set categories breadcumbs bydefault empty
    this.CategoriesBreadcumbs = [];

    // This service subscribe category list
    this.CategoryService.castaAttachmentList.subscribe((aAttachmentList) => {
      if (aAttachmentList && aAttachmentList.length) {
        this.aAttachmentList = aAttachmentList;
      }
    });

    // get url params
    this.categorySlug = this.route.snapshot.params.category;
    // get query string
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);

    // when searching with keyword from mobile view
    if (this.Keyword) {
      this.qQueryString = this.Keyword;
    }

    // check qeury price
    this.priceQueryString = "";
    if (this.getParams && this.getParams.price) {
      // set price params
      this.priceQueryString = this.getParams.price;
    }
    // check qeury type
    if (this.getParams && this.getParams.type) {
      // set type params
      this.typeQueryString = this.getParams.type;
    }
    // check qeury manufacturer
    this.manufacturerQueryString = "";
    this.manufacturers = [];
    if (this.getParams && this.getParams.manufacturer) {
      // set type params
      this.manufacturerQueryString = this.getParams.manufacturer;
    }

    // this for attachments accessories
    if (this.getParams && this.getParams.accessories) {
      this.aAttachmentSlug = true;
    } else {
      this.aAttachmentSlug = false;
    }

    // this for attachments accessories types
    this.aAttachmentTypes = "";
    this.aATypesbreadcrumbs = [];
    if (this.getParams && this.getParams.types) {
      // split url slug
      this.aAttachmentTypes = this.getParams.types.split("/");
      // this for breadcrumbs
      if (this.aAttachmentTypes && this.aAttachmentTypes.length >= 0) {
        setTimeout(() => {
          let aAttachmentList = this.aAttachmentList;
          let aATypesbreadcrumbs = [];
          if (this.aAttachmentList && this.aAttachmentList.length) {
            _.map(this.aAttachmentTypes, function (v) {
              // find data according to slug
              let getObject = _.find(aAttachmentList, function (t) {
                return String(t.Slug) == String(v);
              });
              // check data
              if (getObject) {
                // push data in variable
                aATypesbreadcrumbs.push(getObject);
              }
            });
          }
          // set attachment tyeps
          this.aATypesbreadcrumbs = aATypesbreadcrumbs;
        }, 0);
      }
    }

    if (this.categorySlug) {
      this.CategoryService.castCategory.subscribe((categoryList) => {
        this.categoryList = categoryList;
        if (this.categoryList && this.categoryList.length) {
          this.categoryList.forEach((element) => {
            if (
              (!element.childrenMenu || !element.childrenMenu.length) &&
              element.Category_Slug == this.categorySlug
            ) {
              this.findSelectedCategories = element;
            } else {
              if (element.Category_Slug == this.categorySlug) {
                this.findSelectedCategories = element;
              } else {
                element.childrenMenu.forEach((element) => {
                  if (element.Category_Slug == this.categorySlug) {
                    this.findSelectedCategories = element;
                  } else {
                    element.childrenMenu.forEach((element) => {
                      if (element.Category_Slug == this.categorySlug) {
                        this.findSelectedCategories = element;
                      } else {
                        element.childrenMenu.forEach((element) => {
                          if (element.Category_Slug == this.categorySlug) {
                            this.findSelectedCategories = element;
                          } else {
                            element.childrenMenu.forEach((element) => {
                              if (element.Category_Slug == this.categorySlug) {
                                this.findSelectedCategories = element;
                              } else {
                                element.childrenMenu.forEach((element) => {
                                  if (
                                    element.Category_Slug == this.categorySlug
                                  ) {
                                    this.findSelectedCategories = element;
                                  } else {
                                    element.childrenMenu.forEach((element) => {
                                      if (
                                        element.Category_Slug ==
                                        this.categorySlug
                                      ) {
                                        this.findSelectedCategories = element;
                                      } else {
                                        element.childrenMenu.forEach(
                                          (element) => {
                                            if (
                                              element.Category_Slug ==
                                              this.categorySlug
                                            ) {
                                              this.findSelectedCategories =
                                                element;
                                            } else {
                                              element.childrenMenu.forEach(
                                                (element) => {
                                                  if (
                                                    element.Category_Slug ==
                                                    this.categorySlug
                                                  ) {
                                                    this.findSelectedCategories =
                                                      element;
                                                  }
                                                }
                                              );
                                            }
                                          }
                                        );
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });

          let catIdx = -1;

          if (this.findSelectedCategories) {
            catIdx = this.findSelectedCategories.ID;
          }
          this.cond = {
            cid: this.CID,
            categorySlug: this.categorySlug,
            id: catIdx,
          };

          this.LoadingMore = false;
          this.get_products_list();

          // fetch parent categories
          this.getCategoryParents(catIdx);
        }
      });
    } else {
      this.cond = {
        cid: this.CID,
      };
      this.get_products_list();

      // check key and move kay form localStorage
      let breadCumbs = JSON.parse(localStorage.getItem("breadCumbs"));
      if (breadCumbs) {
        localStorage.removeItem("breadCumbs");
      }
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
      this.changeRouter("shop?q=" + this.Keyword);
    } else {
      this.changeRouter("shop");
    }
    this.get_products_list();
  }

  onLoadMore() {
    console.log("AllProductsNotFound: " + this.AllProductsNotFound);
    console.log("LoadingMore: " + this.LoadingMore);
    if (!this.AllProductsLoaded) {
      console.log("load more!!");

      this.page = this.page + 1;
      console.log("LoadingMore: " + this.LoadingMore);
      this.get_products_list(this.page, this.limit, true);
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug);
  }

  // redirect to page according to url
  changeRouterProduct(slug): void {
    if (this.categorySlug) {
      slug = slug + "?category=" + this.categorySlug;
    }
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // category filter
  productFilter(type, index): void {
    let redirectURL = "shop/marketplace";
    let urlQueryString: any = {};

    // this section for category
    if (type == "category") {
      redirectURL += "";
    } else {
      // previous category slug
      redirectURL += this.categorySlug ? this.categorySlug : "";
    }

    // this for attachment accessories
    if (type == "aAttachment") {
      urlQueryString = {};
    } else {
      if (this.aAttachmentSlug) {
        urlQueryString = {
          accessories: "yes",
        };
      }
    }
    // this for attachment &  accessories types
    if (type == "attachmentTypes") {
      // remove items from array
      this.aATypesbreadcrumbs.splice(index, 1);
      this.aAttachmentTypes.splice(index, 1);
      // set url for attachment & accessores types
      if (this.aAttachmentTypes && this.aAttachmentTypes.length) {
        urlQueryString.types = this.aAttachmentTypes.join("/");
      }
    } else {
      // set url for attachment & accessores types
      if (this.aAttachmentTypes && this.aAttachmentTypes.length) {
        urlQueryString.types = this.aAttachmentTypes.join("/");
      }
    }

    // this section for price
    if (this.priceQueryString) {
      if (!(type == "min")) {
        //this.priceQueryString.maxValue = '';
        this.priceQueryString = [];
      }
      if (!(type == "max")) {
        //this.priceQueryString.minValue = '';
        this.priceQueryString = [];
      }
    }

    // this section for all type
    if (this.typeQueryString) {
      if (!(type == "type")) {
        urlQueryString.type = this.typeQueryString;
      } else {
        if (this.typeQueryString.length >= 1) {
          // remove item according to index
          this.typeQueryString.splice(index, 1);
          urlQueryString.type = this.typeQueryString;
        }
      }
    }

    // this section for all type
    if (this.manufacturerQueryString) {
      if (!(type == "manufacturer")) {
        urlQueryString.manufacturer = this.manufacturerQueryString;
      } else {
        if (this.manufacturerQueryString.length >= 1) {
          let getIndex = _.findIndex(
            this.manufacturerQueryString,
            function (o) {
              return String(o) == String(index);
            }
          );
          if (getIndex >= 0) {
            // remove item according to index
            this.manufacturerQueryString.splice(getIndex, 1);
            urlQueryString.manufacturer = this.manufacturerQueryString;
          }
        }
      }
    }
    // creating URL
    if (urlQueryString) {
      redirectURL += "?" + qs.stringify(urlQueryString);
    }
    // change url
    this.changeRouter(redirectURL);
  }

  // Get store list
  getCategoryParents(category_id?: any) {
    this.cond = {
      cid: this.CID,
      category_id: category_id,
    };
    // get product list
    this.CategoryService.getCategoryParents(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.CategoriesBreadcumbs = res.data;
          localStorage.setItem(
            "breadCumbs",
            JSON.stringify(this.CategoriesBreadcumbs)
          );
          // this category assing for category cound component
          this.categorySelected = this.CategoriesBreadcumbs;
        } else {
          this.CategoriesBreadcumbs = [];
          // check key and move kay form localStorage
          let breadCumbs = JSON.parse(localStorage.getItem("breadCumbs"));
          if (breadCumbs) {
            localStorage.removeItem("breadCumbs");
          }
        }
      },
      (err) => {
        this.CategoriesBreadcumbs = [];
        // check key and move kay form localStorage
        let breadCumbs = JSON.parse(localStorage.getItem("breadCumbs"));
        if (breadCumbs) {
          localStorage.removeItem("breadCumbs");
        }
      }
    );
  }

  // Get store list
  get_products_list(page?: any, limitChanged?: any, LoadMore?: any) {
    if (this.LoadingMore == true) {
      return;
    }

    this.LoadingMore = true;
    // set status
    this.productNFound = false;

    // Calling service
    if (limitChanged) {
      this.totalItems = 0;
      this.currentPage = 0;
    }
    if (this.limit != 1000) {
      this.cond.limit = this.limit;
    }
    if (page) {
      this.cond.page = page;
    } else {
      this.cond.page = 1;
    }
    this.cond.marketplace = this.MARKETPLACE;
    // if price filter
    if (this.priceQueryString) {
      this.cond.price = this.priceQueryString;
    }
    // if type filter
    if (this.typeQueryString && this.typeQueryString.length) {
      this.cond.type = this.typeQueryString;
    }

    // if search by keyword
    if (this.Keyword) {
      this.cond.q = this.Keyword;
    }

    // check qeury manufacturer
    if (this.manufacturerQueryString && this.manufacturerQueryString.length) {
      // set type params
      this.cond.manufacturer = this.manufacturerQueryString;
    }
    // this for types
    if (this.aAttachmentSlug) {
      // set type params
      this.cond.attachment = this.aAttachmentSlug;
    }
    // this attachment types
    if (this.aAttachmentTypes && this.aAttachmentTypes.length) {
      this.cond.attachmentTypes = this.aAttachmentTypes;
    }
    // sorting filters ASC/DESC
    this.cond.sorting = this.sorFilter ? this.sorFilter : 0;
    // get product list

    this.productNFound = false;

    if (!LoadMore) {
      this.productsList = [];
    }

    this.StoreService.getProductsList(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.LoadingMore = false;
          this.totalItems = res.total;

          let productsList = this.productsList;
          if (res.data && res.data.length) {
            _.map(res.data, function (v) {
              productsList.push(v);
            });
          }
          this.productsList = productsList;

          if (res.total == 0) {
            this.productNFound = true;
          }
          let urlImage = this.AWSBUCKETURL;
          let companyCID = this.CID;
          if (this.productsList && this.productsList.length) {
            _.map(this.productsList, function (v) {
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
                if (v && v.Product_Video) {
                  let regExp =
                    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  let match = v.Product_Video.match(regExp);
                  if (match && match[2].length == 11) {
                    v.imageUrl =
                      "https://i3.ytimg.com/vi/" + match[2] + "/sddefault.jpg";
                  } else {
                    v.imageUrl =
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
                        "/thumb_" +
                        v.Image
                      : "./assets/images/no-image.png";
                }
              }
              return v;
            });
          }
        } else {
          this.LoadingMore = false;
          this.productNFound = true;
          this.productsList = [];
          if (!LoadMore) {
            this.productNFound = true;
          } else {
            this.AllProductsLoaded = true;
          }
        }
      },
      (err) => {
        this.productNFound = true;
      }
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
          let slug = "shop/product/p/" + item.Product_Slug;
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

  // Get store list
  ChangeGrid(count_per_product) {
    this.ProductPerRow = count_per_product;
  }
  // shop filters this method calling by child component(product-filter.component)
  shopFilters(data) {
    let mData = [];
    // url prams
    if (this.manufacturerQueryString && this.manufacturerQueryString.length) {
      _.map(this.manufacturerQueryString, function (id) {
        // get data according to id
        let getObject = _.find(data, function (v) {
          return v.ID == id;
        });
        if (getObject) {
          mData.push(getObject);
        }
      });
      this.manufacturers = mData;
    }
  }

  // for sorting filter ASC/DESC
  sortingFilter(event): void {
    this.sorFilter = event.target.value;
    // calling product list method
    this.get_products_list();
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

  // change page display list
  changePagination(event): void {
    this.limit = event;
    // call product method
    //this.get_products_list('null', 'true');
    // check product.
    this.checkKeyParam();
  }

  // set quick product data for quick popup
  setQuickProductData(item): void {
    this.StoreService.setQuickProductItem(item);
  }

  // Get store list
  get_featured_products(): void {
    let cond: object = {
      cid: this.CID,
      limit: 1000,
      channelSlug:''
    };
    // Calling service
    this.StoreService.getStorelist(cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.storeList = res.data.length ? res.data : [];
          let urlImage = this.PORTAL_URL;
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
              slidesToShow: 4,
              slidesToScroll: 1,
              arrows: true,
              infinite: false,
              autoplay: true,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                  },
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
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

  
}
