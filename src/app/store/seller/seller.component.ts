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
import { ResourcesService } from "../../services/resources/resources.service";
import { VideoService } from "../../services/video/video.service";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-seller",
  templateUrl: "./seller.component.html",
  styleUrls: ["./seller.component.sass","../../../assets/css/memberpage.css"],
})
export class SellerComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  productsList: Array<any>;
  resourcesList: Array<any>;
  videosList: Array<any>;
  newUUid: string;
  sliderData: Array<[]>;
  UserToken: string;
  userData: any;
  categorySlug: string;
  categoryList: any;
  findSelectedCategories: any;
  limit: number = 200;
  cond: any;
  totalItems: number = 0;
  currentPage: number = 0;
  ProductPerRow: any = 4;
  qQueryString: any;
  priceQueryString: any;
  getParams: any;
  typeQueryString: any;
  manufacturerQueryString: any;
  sorFilter: number;
  productNFound: boolean = false;
  resourceNFound: boolean = false;
  videoNFound: boolean = false;
  CategoriesBreadcumbs: any;
  manufacturers: any;
  categorySelected: any;
  aAttachmentList: any;
  aAttachmentSlug: any;
  aAttachmentTypes: any;
  aATypesbreadcrumbs: any;
  localStorage: any;
  sliderImage: string;
  setTab: string;
  sellerID: string;
  sameUserView: string;

  constructor(
    private StoreService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private SliderService: SliderService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private ResourcesService: ResourcesService,
    private VideoService: VideoService,
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
    /*this.activatedRoute.url.subscribe((url) => {
      // manage all serach filter
      this.checkKeyParam();
    });*/

    // set product detail tabs
    this.setTab = "Shop";
    this.route.queryParams.subscribe(params => {
      let tabselected = params['tabselected'];
      if(typeof tabselected != "undefined" && tabselected != '')
        this.setTab = tabselected;
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      let slug = params.get("sellername");
      var lastSlash = slug.lastIndexOf("-");
      let UID = slug.substring(lastSlash + 1);
      this.sellerID = UID;

      // manage all serach filter
      this.checkKeyParam();
      this.getResourcesList();
      this.getVideosList();

      // for get site settings from service
      this.HomeService.castSiteSettings.subscribe((data) => {
        //console.log(data);
        if (data) {
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
    });
  }

  checkKeyParam() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      
      if(this.userData && this.userData.SellerPackage && this.userData.SellerPackage != 'Yes'){
        this.setTab = 'Resources';
        //alert(this.setTab);
      }
      // get user token
      this.UserToken = localStorage.getItem("token");
    });
    if(this.userData && this.userData != null){
      if(typeof this.userData.id != "undefined" && this.userData.id != "" && this.userData.id == this.sellerID){
        this.sameUserView = '1';
      }
    }

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
    if (this.getParams && this.getParams.q) {
      this.qQueryString = this.getParams.q;
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

  // Resource list
  getResourcesList(){
    this.resourceNFound = false;
    this.cond = {
      cid: this.CID,
      sellerID: this.sellerID,
      memberView: '1'
    };

    // get resource list
    this.ResourcesService.getAllResources(this.cond).subscribe(
      (res) => {        
        if (res && res.data) {
          this.resourcesList = res.data;
          this.resourceNFound = res.total ? false : true;
        } else {
          this.resourcesList = [];
          this.resourceNFound = true;
        }
      },
      (err) => {
        this.resourcesList = [];
        this.resourceNFound = true;
      }
    );
  }

  // Videos list
  getVideosList(){
    this.videoNFound = false;
    this.cond = {
      cid: this.CID,
      sellerID: this.sellerID,
      memberView: '1',
      limit: 1000,
      page: 1
    };

    // get resource list
    this.VideoService.getVideos(this.cond).subscribe(
      (res) => {        
        if (res && res.data) {
          this.videosList = res.data;
          this.videoNFound = res.total ? false : true;
        } else {
          this.videosList = [];
          this.videoNFound = true;
        }
      },
      (err) => {
        this.videosList = [];
        this.videoNFound = true;
      }
    );
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
    let redirectURL = "shop";
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
  get_products_list(event?: any, limitChanged?: any) {
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
    if (event && event.page) {
      this.cond.page = event.page;
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
    if (this.qQueryString && this.qQueryString.length) {
      this.cond.q = this.qQueryString;
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
    this.productsList = [];
    this.productNFound = false;
    
    this.cond.sellerID = this.sellerID;
    //delete this.cond.cid;

    this.StoreService.getProductsList(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.productsList = res.data.length ? res.data : [];
          this.totalItems = res.total;
          let urlImage = this.AWSBUCKETURL;
          let companyCID = this.CID;
          this.productNFound = res.total ? false : true;
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
          this.productNFound = true;
          this.productsList = [];
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

  splitString(str){
    var spl = str.split(",");
    var template = '';
    for(var tmp=0;tmp<spl.length;tmp++){
      template += '<div class=""><span class="text">'+spl[tmp]+'</span>';
      if(tmp+1 < spl.length)
        template += ' <span class="ml-2 mr-2"> → </span></div>';
    }
    return template;
  }

  editResource(id){
    this.changeRouter("shop/seller/resource/"+id);
  }

  deleteResource(id){
    if(confirm("Are you sure you want to delete this resource")) {
      this.cond = {
        id: id,
        CID: this.CID
      };
      // delete resource list
      this.ResourcesService.DeleteResourcePostMember(this.cond).subscribe(
        (res) => {
          if(!res.error){
            this.toastr.success('Resource deleted successfully', "Success!");
            this.getResourcesList();
          } else {
            this.toastr.error('Error in deleting resource', "Error!");
          }
        },
        (err) => {
          this.toastr.error('Error in deleting resource', "Error!");
        }
      );
    }
  }
  editProduct(id){
    this.changeRouter("shop/seller/product/"+id);
  }

  deleteProduct(id){
    if(confirm("Are you sure you want to delete this product")) {
      this.cond = {
        id: id,
        CID: this.CID
      };
      // delete product list
      this.StoreService.DeleteProductSeller(this.cond).subscribe(
        (res) => {
          if(!res.error){
            this.toastr.success('Product deleted successfully', "Success!");
            this.get_products_list();
          } else {
            this.toastr.error('Error in deleting product', "Error!");
          }
        },
        (err) => {
          this.toastr.error('Error in deleting product', "Error!");
        }
      );
    }
  }
}
