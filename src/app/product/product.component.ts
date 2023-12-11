import { Component, Input, Output, OnInit, HostListener, ViewChild, ElementRef, EventEmitter, TemplateRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title,Meta  } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { StoreService } from '../services/store/store.service';
import { UserService } from '../services/auth/user.service'
import { CategoryService } from "../services/category/category.service";
import { DailyActivitiesService } from "../services/daily-activities/daily-activities.service"

import * as uuid from 'uuid';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// Declear jquery 
declare var jQuery: any;
declare var PhotoSwipe: any;
declare var PhotoSwipeUI_Default: any;
declare let fbq:Function;

// Import environment config file.
import { environment } from 'src/environments/environment';
import { HomeService } from '../services/home/home.service'

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass']
})
export class ProductComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  
  awsCloudfrontURL: string = environment.config.AWSBUCKETURL;
  productID: Number;
  productSlug: string;
  productImage: any;
  productInfo: any;
  Product_Accessories: any;
  Product_Categories: any;
  Product_Attributes: any;
  Sub_Products: any;
  setTab: string;
  productQuantity: any;
  newUUid: string;
  UserToken: string;
  userData: any;
  modalRef: BsModalRef;
  Wishlists: any;
  AverageRating: any;
  safeSrc: SafeResourceUrl;
  itemsData: any;
  SelectOptions: any;
  SelectedColor: any;
  scrollToOffset: any;
  categoryList: any;
  findSelectedCategories: any;
  CategoriesBreadcumbs: any;
  cond: any;
  sellerData: any;
  Orig_Product_Price: any;
  Orig_Discount_Price: any;
  BracketPrices: any;
  breadCumbs: any;
  ProductLink:any;
  
  constructor(
    private StoreService: StoreService,
    private router: Router, private translate: TranslateService,
    private route: ActivatedRoute,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private HomeService: HomeService,
    private activatedRoute: ActivatedRoute,
    private dailyActivitiesService: DailyActivitiesService,
    private metaTagService: Meta,
    private titleService: Title
  ) {
    // Set translate language
    translate.setDefaultLang('en');

    // set product detail tabs
    this.setTab = 'description';

    // Generate new uuid for product cart
    this.newUUid = uuid.v4();

    this.AverageRating = 0;

    this.SelectOptions = [];
    this.SelectedColor = '';

    this.BracketPrices = [];
    this.Orig_Product_Price = '0.00';
    this.Orig_Discount_Price = '0.00';

    // get activated route  
    this.activatedRoute.url.subscribe(url => {
      // manage all serach filter
      this.loadData();
      // load javascript
      this.loadScript('https://www.elevateweb.co.uk/wp-content/themes/radial/jquery.elevatezoom.min.js');
      // remove previous zoom
      jQuery('.zoomContainer').remove()
    });
  }

  ngOnInit() {
    this.ProductLink  = '';
    



  }

  loadData() {
    this.route.paramMap.subscribe(params => {
      this.productSlug = params.get("slug");
      // Calling get product details method
      this.get_product_details(this.productSlug);
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

    this.Wishlists = [];

    // check if category attached in URL
    if (this.route.snapshot.queryParamMap.get("category")) {
      let category_slug = this.route.snapshot.queryParamMap.get("category");
      if (category_slug) {
        this.CategoryService.castCategory.subscribe(categoryList => {
          this.categoryList = categoryList;
          if (this.categoryList && this.categoryList.length) {
            this.categoryList.forEach(element => {
              if ((!element.childrenMenu || !element.childrenMenu.length) && (element.Category_Slug == category_slug)) {
                this.findSelectedCategories = element
              } else {
                if (element.Category_Slug == category_slug) {
                  this.findSelectedCategories = element
                } else {
                  element.childrenMenu.forEach(element => {
                    if (element.Category_Slug == category_slug) {
                      this.findSelectedCategories = element
                    } else {
                      element.childrenMenu.forEach(element => {
                        if (element.Category_Slug == category_slug) {
                          this.findSelectedCategories = element
                        } else {
                          element.childrenMenu.forEach(element => {
                            if (element.Category_Slug == category_slug) {
                              this.findSelectedCategories = element
                            } else {
                              element.childrenMenu.forEach(element => {
                                if (element.Category_Slug == category_slug) {
                                  this.findSelectedCategories = element
                                } else {
                                  element.childrenMenu.forEach(element => {
                                    if (element.Category_Slug == category_slug) {
                                      this.findSelectedCategories = element
                                    } else {
                                      element.childrenMenu.forEach(element => {
                                        if (element.Category_Slug == category_slug) {
                                          this.findSelectedCategories = element
                                        } else {
                                          element.childrenMenu.forEach(element => {
                                            if (element.Category_Slug == category_slug) {
                                              this.findSelectedCategories = element
                                            } else {
                                              element.childrenMenu.forEach(element => {
                                                if (element.Category_Slug == category_slug) {
                                                  this.findSelectedCategories = element
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
            // fetch parent categories
            this.getCategoryParents(catIdx);

          }
        });
      }
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // Get product details 
  get_product_details(slug: string): void {
    if (slug) {
      let cond: object = {
        cid: this.CID,
        Product_Slug: slug
      };
      // get shop breadcrumbs and print breadcrumbs on product details page.
      let getBreadCumbs = JSON.parse(localStorage.getItem('breadCumbs'));
      if (getBreadCumbs && getBreadCumbs.length) {
        this.breadCumbs = getBreadCumbs
      }
      this.productInfo = { slider: '' };
      // remove previous zoom
      jQuery('.zoomContainer').remove()
      // Calling service
      this.StoreService.getProductDetails(cond).subscribe(res => {
        if (res && res.data && res.data.ID) {
          this.productInfo = res.data;
          this.ProductLink = location.origin+'/shop/product/p/'+this.productSlug;
          // check category list in products
          /*if (this.productInfo && this.productInfo.Product_Categories && this.productInfo.Product_Categories.length) {
            // get unique category according to category name
            this.productInfo.Product_Categories = _.uniqBy(this.productInfo.Product_Categories, 'Category_Name');
          }*/
          this.productID = res.data.ID;
          //this.Product_Accessories = res.data.Product_Accessories;
          this.Product_Categories = res.data.Product_Categories;
          
          this.Orig_Product_Price = this.productInfo.Product_Price;
          this.Orig_Discount_Price = this.productInfo.Discount_Price;
          this.BracketPrices = [];
          // for youtube video
          let videID = '';
          if (this.productInfo && this.productInfo.Product_Video) {
            this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.getId(this.productInfo.Product_Video) + '?autoplay=1&mute=1&rel=0');
            //videID = "https://i3.ytimg.com/vi/" + this.getId(this.productInfo.Product_Video) + "/maxresdefault.jpg";
            videID = "https://i3.ytimg.com/vi/" + this.getId(this.productInfo.Product_Video) + "/sddefault.jpg";
          }

          let urlImage = this.awsCloudfrontURL;


          if (this.productInfo && this.productInfo.Image_type == 'image') {
            if (this.productInfo.Image_Source == "url") {
                this.productImage = (this.productInfo && this.productInfo.ImageLarge) ? this.productInfo.ImageLarge : "https://s3.agfolks.com/ng/assets/images/no-image.png";
            }else{
                this.productImage = (this.productInfo && this.productInfo.Image) ? urlImage + 'files/store/products/' + this.productInfo.CID + '/' + this.productInfo.ID + '/' + this.productInfo.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
            }
          } else {
            this.productImage = (this.productInfo && this.productInfo.Image) ? urlImage + 'files/store/products/' + this.productInfo.CID + '/' + this.productInfo.ID + '/' + this.productInfo.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
          }

          

            // change meta title values according to product details
            let title = this.productInfo.Product_Name; 
            title = title.replace('&quot;', '"'); 
            title = title.replace('&#039;', "'"); 
            title = title.replace('&rsquo;', "'"); 
            title = title.replace('&quot;', '"'); 
            title = title.replace('&#039;', "'"); 
            title = title.replace('&rsquo;', "'"); 
            title = title.replace('&quot;', '"'); 
            title = title.replace('&#039;', "'"); 
            title = title.replace('&rsquo;', "'"); 
            
            
            
            let Product_Short_Description = this.productInfo.Product_Short_Description; 
            Product_Short_Description = Product_Short_Description.replace('&quot;', '"'); 
            Product_Short_Description = Product_Short_Description.replace('&#039;', "'"); 
            Product_Short_Description = Product_Short_Description.replace('&rsquo;', "'"); 
            Product_Short_Description = Product_Short_Description.replace('&quot;', '"'); 
            Product_Short_Description = Product_Short_Description.replace('&#039;', "'"); 
            Product_Short_Description = Product_Short_Description.replace('&rsquo;', "'"); 
            Product_Short_Description = Product_Short_Description.replace('&quot;', '"'); 
            Product_Short_Description = Product_Short_Description.replace('&#039;', "'"); 
            Product_Short_Description = Product_Short_Description.replace('&rsquo;', "'"); 
            
            //this.sanitizer.bypassSecurityTrustHtml(this.productInfo.Product_Name);
            this.titleService.setTitle(title);

            this.metaTagService.updateTag({ name: 'keywords', content: title});
            this.metaTagService.updateTag({ name: 'description', content: Product_Short_Description});

            let ogtitle = title;
            let ogdescription = Product_Short_Description;
            let ogurl = location.origin+'/shop/product/p/'+this.productInfo.Product_Slug;
      
            let ogimage = this.productImage;

            
            this.HomeService.createCanonicalURL(ogurl);
            this.metaTagService.updateTag({ property: 'og:title', content: ogtitle });
            this.metaTagService.updateTag({ property: 'og:description', content: ogdescription });
            this.metaTagService.updateTag({ property: 'og:url', content:ogurl });
            this.metaTagService.updateTag({ property: 'og:link', content:ogurl });
            this.metaTagService.updateTag({ property: 'og:image', content: ogimage, itemprop: 'image' });
            this.metaTagService.updateTag({ name: 'twitter:title', content: ogtitle });
            this.metaTagService.updateTag({ name: 'twitter:description', content:ogdescription });
            this.metaTagService.updateTag({ name: 'twitter:card', content: ogimage });
            this.metaTagService.updateTag({ name: 'twitter:image', content: ogimage, itemprop: 'image' });

            this.metaTagService.updateTag({ property: 'og:id', content: this.productInfo.ID });
            this.metaTagService.updateTag({ property: 'product:retailer_item_id', content: this.productInfo.ID });
            this.metaTagService.updateTag({ property: 'product:price:amount', content: this.productInfo.Product_Price });
            
            let cats = [];
            if (this.productInfo && this.productInfo.Product_Categories && this.productInfo.Product_Categories.length) {
              _.map(this.productInfo.Product_Categories, function (cat) {

                cats.push(cat.Category_Name);

              });
            }
            let _cats = cats.join(',')
            this.metaTagService.updateTag({ property: 'product:fb_product_category', content: _cats });
            this.metaTagService.updateTag({ property: 'product:google_product_category', content: _cats });
            this.metaTagService.updateTag({ property: 'product:brand', content: _cats });
            this.metaTagService.updateTag({ property: 'product:category', content: _cats });
                        
            fbq('track', 'ViewContent');
            
            window['__sharethis__'].initialize();
            window['__sharethis__'].load('inline-share-buttons', {
                url: location.origin+'/shop/product/p/'+this.productInfo.Product_Slug
            });
            

          let imageCID = this.productInfo.CID;
          let pID = this.productInfo.ID;
          let itemsDataArray = [];
          // add youtube video;
          if (this.productInfo && this.productInfo.Product_Video) {
            let sliderData = _.cloneDeep(this.productInfo.slider);
            let ytData = {
              CID: imageCID,
              ID: '',
              Image: videID,
              Product_ID: pID,
              Title: "",
              VID: '',
              imageUrl: videID,
              mediumUrl: videID,
              thumbimageUrl: videID,
              ordering: '',
              size: null,
              type: "video",
              video: videID,
              video_id: null,
              video_source: "youtube",
              video_thumb: videID
            };
            sliderData.splice(this.productInfo.slider.length, 0, ytData);
            this.productInfo.slider = sliderData;
            
          }

          // manage slider images
          if (this.productInfo && this.productInfo.slider && this.productInfo.slider.length) {
            _.map(this.productInfo.slider, function (v) {
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
                // push data for image full width slider
                itemsDataArray.push({
                  src: v.imageUrl,
                  w: 1200,
                  h: 1200
                });
              }
              return v;
            });

          } else {
            this.productInfo.slider.push({ imageUrl: "https://s3.agfolks.com/ng/assets/images/no-image.png", thumbimageUrl: "https://s3.agfolks.com/ng/assets/images/no-image.png" });
            // item length
            if (itemsDataArray && itemsDataArray.length == 0) {
              itemsDataArray.push({
                src: "https://s3.agfolks.com/ng/assets/images/no-image.png",
                w: 1200,
                h: 1200
              });
            }
          }
          if (this.productInfo && this.productInfo.Product_Video) {
            // push data for video full width slider
            itemsDataArray.push({
              src: videID,
              w: 1200,
              h: 1200
            });
          }
          this.itemsData = itemsDataArray;
          // set product quantity 
          this.productQuantity = 1;
          // Manage product slider start here
          jQuery(document).ready(function () {
            // Js product single slider
            jQuery('.js-click-product').slick({
              slidesToShow: 4,
              slidesToScroll: 1,
              asNavFor: '.js-product-slider',
              dots: false,
              focusOnSelect: true,
              infinite: true,
              arrows: true,
              vertical: true,
              autoplay: false,
              responsive: [{
                breakpoint: 1367,
                settings: {
                  vertical: false
                }
              }]
            });
            jQuery('.js-product-slider').slick({
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: true,
              asNavFor: '.js-click-product'
            });
          })
          // Manage product slider end here 
          
          // get Product Documents 
          if (this.productInfo.CID) {
            this.StoreService.getProductDocuments({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resultdocs => {
              if (resultdocs.data && resultdocs.data.length) {
                 let urlImage = this.awsCloudfrontURL;
                 this.productInfo.documents = resultdocs.data;
                 if (this.productInfo.documents && this.productInfo.documents.length) {
                    _.map(this.productInfo.documents, function (v) {
                      v.DocUrl = (v && v.file_name) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Product_ID + '/documents/' + v.file_name : "https://s3.agfolks.com/ng/assets/images/no-image.png";

                      return v;
                    })
                  }
              }
            }, (error) => { });
          }
          
          // get Product Documents 
          if (this.productInfo.CID) {
            this.StoreService.getProductNextPrevProducts({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resultnppros => {
              if (resultnppros) {
                 this.productInfo.nextProduct = resultnppros.nextProduct;
                 this.productInfo.previousProduct = resultnppros.previousProduct;
                 let urlImage = this.awsCloudfrontURL;
                 if (this.productInfo.nextProduct && this.productInfo.nextProduct.length) {
                    _.map(this.productInfo.nextProduct, function (v) {

                      if (v.Image_type == 'image') {
                        v.Image = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      } else {
                        v.Image = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      }
                      return v;

                    })
                  }

                  if (this.productInfo.previousProduct && this.productInfo.previousProduct.length) {
                    _.map(this.productInfo.previousProduct, function (v) {

                      if (v.Image_type == 'image') {
                        v.Image = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";


                      } else {
                        v.Image = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";

                      }
                      return v;

                    })
                 }
              }
            }, (error) => { });
          }
          
          // get Product Accessories 
          if (this.productInfo.CID) {
            this.StoreService.getProductAccessories({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resultAccessories => {
              if (resultAccessories.data && resultAccessories.data.length) {
                  this.Product_Accessories = resultAccessories.data;
                  let urlImage = this.awsCloudfrontURL;
                  if (this.Product_Accessories && this.Product_Accessories.length) {
                    _.map(this.Product_Accessories, function (v) {
                      if (v.Image_type == 'image') {
                        v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                        v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/thumb_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                        v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";

                      } else {
                        v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                        v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                        v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.Accessory_ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      }


                      return v;
                    })
                  }
                  //console.log(this.Product_Accessories);
              }
            }, (error) => { });
          }
          
          // get Product Parts 
          if (this.productInfo.CID) {
            this.StoreService.getProductParts({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resultparts => {
              if (resultparts.data && resultparts.data.length) {
                 this.productInfo.Product_Parts = resultparts.data;
                 
              }
            }, (error) => { });
          }
          
          // get Product Attributes 
          if (this.productInfo.CID) {
            this.StoreService.getProductAttributes({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resattr => {
              if (resattr) {
                this.Product_Attributes = resattr;
                let opts = [];
                if (this.Product_Attributes.all_attributes && this.Product_Attributes.all_attributes.length) {
                  _.map(this.Product_Attributes.all_attributes, function (v) {
                    opts.push({
                      ID: v.ID,
                      AttrID: v.Attribute_ID,
                      Required: v.Required,
                      Have_Dimensions: v.Have_Dimensions,
                      Field: v.Field_Name,
                      Price: 0.00,
                      OptionID: '',
                      value: '',
                      Selected: '',
                      bracket: ''
                    });
                    return v;
                  })
                }
                
                this.SelectOptions = opts;
              }
            }, (error) => { });
          }

          // get Sub Products 
          if (this.productInfo.CID) {
            this.StoreService.getSubProducts({ CID: this.productInfo.CID, ID: this.productInfo.ID }).subscribe(resattr => {
              if (resattr) {
                this.Sub_Products = resattr.data;
                if (this.Sub_Products && this.Sub_Products.length) {
                  _.map(this.Sub_Products, function (v) {
                    if (v.Image_type == 'image') {
                      v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/thumb_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";

                    } else {
                      v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.R_Product_ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                    }
                    v.Quantity = 1;
                    return v;
                  });
                }
              }
            }, (error) => { });
          }

          // get seller details 
          if (this.productInfo.CID) {
            this.StoreService.getSellerdetails({ CID: this.productInfo.CID }).subscribe(res1 => {
              if (res1 && res1.data) {
                this.sellerData = res1.data;
              }
            }, (error) => { });
          }

          // this section for related products 
          if (this.productInfo.CategoryID) {
            this.StoreService.getRelatedProducts({ category_id: this.productInfo.CategoryID }).subscribe(res1 => {
              if (res1 && res1.data) {
                // set related products
                this.productInfo.Related_Products = res1.data;
                // check length
                if (this.productInfo.Related_Products && this.productInfo.Related_Products.length) {
                  _.map(this.productInfo.Related_Products, function (v) {
                    if (v.Image_type == 'image') {
                      v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/thumb_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";

                    } else {
                      v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.thumbimageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                      v.mediumUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.CID + '/' + v.ID + '/medium_' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
                    }
                    return v;
                  })
                }
              } else {
                this.productInfo.Related_Products = [];
              }
            }, (error) => { });
          }


          // get total trating 
          if (this.productInfo.ID) {
            this.StoreService.getTotalRating({ ID: this.productInfo.ID }).subscribe(res1 => {
              if (res1 && res1.data) {
                // set product total ratings data
                this.productInfo.Product_Ratings = res1.data;
                // set ratings stare
                if (this.productInfo.Product_Ratings && this.productInfo.Product_Ratings.numberOfReviews > 0) {
                  this.AverageRating = Math.round(this.productInfo.Product_Ratings.TotalRatings / this.productInfo.Product_Ratings.numberOfReviews);
                }
              } else {
                this.productInfo.Product_Ratings = '';
              }
            }, (error) => { });
          }

          

          // created con object
          let condT: object = {
            cid: this.CID,
            Product_Slug: slug
          };
          // calling topviewed service
          this.dailyActivitiesService.saveUserDailyActivities(condT).subscribe(resT => {
            // check data
            if (resT && resT.data) {
            } else {

            }
          }, (error) => { });
        }
      }, (err) => {

      });
    }
  }
  
  

  // update Cart Product Quantity
  UpdateQty(ProductID: number, Stock: number, status): void {
    _.map(this.Sub_Products, function (v) {
      if (v.R_Product_ID == ProductID) {
        if (Stock > 0) {
          if (status) {
            (v.Quantity == Stock) ? Stock : v.Quantity++;
          } else {
            (v.Quantity > 1) ? v.Quantity-- : v.Quantity;
          }
        }
        return v;
      }
    });
  }

  // get youtube link 
  getId(url) {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);

    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return 'error';
    }
  }


  // Add Main product to cart method
  productAddToCart(storeItem: any, itemCID: any, qty: Number, SelectOpt: boolean, Shipping_API: any) {
    let itemID = storeItem.ID;
    // Set sesson id;
    let checkItem: any = localStorage.getItem('SessionID');
    if (!checkItem) {
      checkItem = this.newUUid;
      localStorage.setItem('SessionID', checkItem);
    }

    let validateopt = false;
    _.map(this.SelectOptions, function (v) {
      if (v.Required == 1 && v.value == '') {
        validateopt = true;
      }
      return v;
    })
    if (validateopt && SelectOpt) {

      this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
        this.toastr.error(res);
      });
      return;

    }
    let addCart = {
      CID: itemCID,
      MemberID: (this.userData && this.userData.id) ? this.userData.id : '',
      SessionID: checkItem,
      Cart_Date: new Date(),
      Product_ID: itemID,
      Product_Count: qty,
      Product_Price: storeItem.Product_Price,
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
      if (err.error.error == 'SELECT_REQUIRED_OPTIONS') {
        let slug = "shop/product/p/" + storeItem.Product_Slug;
        this.changeRouter(slug);

        this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
          this.toastr.error(res);
        });
      } else {
        this.toastr.error(err.error.error);
      }
    });
  }

  // Add Main product to cart method
  productAddToCart2(storeItem: any, itemCID: any, qty: Number, SelectOpt: false, Shipping_API: any) {
    let itemID = storeItem.ID;
    // Set sesson id;
    let checkItem: any = localStorage.getItem('SessionID');
    if (!checkItem) {
      checkItem = this.newUUid;
      localStorage.setItem('SessionID', checkItem);
    }

    let validateopt = false;
    _.map(this.SelectOptions, function (v) {
      if (v.Required == 1 && v.value == '') {
        validateopt = true;
      }
      return v;
    })
    if (validateopt && SelectOpt) {

      this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
        this.toastr.error(res);
      });
      return;

    }
    let addCart = {
      CID: itemCID,
      MemberID: (this.userData && this.userData.id) ? this.userData.id : '',
      SessionID: checkItem,
      Cart_Date: new Date(),
      Product_ID: itemID,
      Product_Count: qty,
      Product_Price: storeItem.Product_Price,
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
      if (err.error.error == 'SELECT_REQUIRED_OPTIONS') {
        let slug = "shop/product/p/" + storeItem.Product_Slug;
        this.changeRouter(slug);

        this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
          this.toastr.error(res);
        });
      } else {
        this.toastr.error(err.error.error);
      }
    });
  }

  // Add sub product to cart method
  subproductAddToCart(storeItem: any, itemCID: any, qty: Number, SelectOpt: false, Shipping_API: any) {
    let itemID = storeItem.ID;

    _.map(this.Sub_Products, function (v) {
      if (v.R_Product_ID == itemID) {
        qty = v.Quantity;
      }
    });

    // Set sesson id;
    let checkItem: any = localStorage.getItem('SessionID');
    if (!checkItem) {
      checkItem = this.newUUid;
      localStorage.setItem('SessionID', checkItem);
    }

    let validateopt = false;
    _.map(this.SelectOptions, function (v) {
      if (v.value == '') {
        validateopt = true;
      }
      return v;
    })
    if (validateopt && SelectOpt) {
      /*
      this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
        this.toastr.error(res);
      });
      return;
      */
    }
    let addCart = {
      CID: itemCID,
      MemberID: (this.userData && this.userData.id) ? this.userData.id : '',
      SessionID: checkItem,
      Cart_Date: new Date(),
      Product_ID: itemID,
      Product_Count: qty,
      Product_Price: storeItem.Product_Price,
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
      if (err.error.error == 'SELECT_REQUIRED_OPTIONS') {
        let slug = "shop/product/p/" + storeItem.Product_Slug;
        this.changeRouter(slug);

        this.translate.get('PLEASE_SELECT_OPTIONS').subscribe((res: string) => {
          this.toastr.error(res);
        });
      } else {
        this.toastr.error(err.error.error);
      }
    });
  }

  // manage prodcut quentity 
  manageProductQuantity(quantity, status): void {
    if (this.productQuantity >= 0) {
      if (status) {
        //(this.productQuantity == quantity) ? quantity : this.productQuantity++;
        this.productQuantity++;
      } else {
        (this.productQuantity > 1) ? this.productQuantity-- : this.productQuantity;
      }
    }
  }

  // for model 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  // add to wishlist
  AddtoWishlist(ID: Number, Slug: String, WishlistModal) {
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
        /*
        this.Wishlists = res.data;
        let urlImage = this.PORTAL_URL;
        if (this.Wishlists && this.Wishlists.length) {
          _.map(this.Wishlists, function (v) {
            if (v.Image_type == 'image') {
              v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.Product_CID + '/' + v.Product_ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
            } else {
              v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.Product_CID + '/' + v.Product_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
            }
            return v;
          })
        }
        this.openModal(WishlistModal);
        */
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
        //this.getWishlists();
        //this.openModal(WishlistModal);
      }
    });
  }

  // get current user address
  getWishlists(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getWishlist_Products(dataObj).subscribe(res => {
        if (res && res.data && res.data.length) {
          this.Wishlists = res.data;
          let urlImage = this.PORTAL_URL;
          if (this.Wishlists && this.Wishlists.length) {
            _.map(this.Wishlists, function (v) {
              if (v.Image_type == 'image') {
                v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.Product_CID + '/' + v.Product_ID + '/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
              } else {
                v.imageUrl = (v && v.Image) ? urlImage + 'files/store/products/' + v.Product_CID + '/' + v.Product_ID + '/thumb/' + v.Image : "https://s3.agfolks.com/ng/assets/images/no-image.png";
              }
              return v;
            })
          }
        }
      }, (error) => {
        this.Wishlists = [];
      });
    }
  }

  openPhotoSwipe(ind): void {

    var pswpElement = document.querySelectorAll('.pswp')[0];
    // define options (if needed)
    var options = {
      // history & focus options are disabled on CodePen     
      index: ind,
      history: false,
      focus: false,
      showAnimationDuration: 0,
      hideAnimationDuration: 0
    };

    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, this.itemsData, options);
    gallery.init();
  }

  SetOptionValue(field: any, value: any): void {

   
    if (field && field.ShowFrontendAs == 'Color') {
      this.SelectedColor = value;
    }
    let bracket = '';
    if (field.OptsData && field.OptsData.length) {
      
      _.map(field.OptsData, function (v) {
        if (v.ID == value) {
          bracket = v;
        }
      });

      let eBracketPrices = this.BracketPrices;
      if (this.BracketPrices && this.BracketPrices.length) {
        _.map(this.BracketPrices, function (v, index) {

          if (v && field && v.Attribute_ID == field.Attribute_ID) {
            eBracketPrices.splice(index, 1);
          }
        });
      }
      if (bracket) {
        eBracketPrices.push(bracket);
      }
      
      //console.log('Orig_Product_Price: '+this.Orig_Product_Price);
      //console.log(this.BracketPrices);
      
      this.BracketPrices = eBracketPrices;
      let new_p_price: any = parseFloat(this.Orig_Product_Price);
      let new_d_price: any = parseFloat(this.Orig_Discount_Price);
      if (this.BracketPrices && this.BracketPrices.length) {
        _.map(this.BracketPrices, function (v, index) {
          if (v && v.Option_Price != '' && v.Option_Price > 0) {
            new_p_price = Number(parseFloat(new_p_price) + parseFloat(v.Option_Price));
            new_d_price = Number(parseFloat(new_d_price) + parseFloat(v.Option_Price));
          }
        });
      }
      //console.log('Product_Price: '+this.productInfo.Product_Price);
      //console.log(new_p_price);
      this.productInfo.Product_Price = new_p_price.toFixed(2);
      this.productInfo.Discount_Price = this.calculateDiscount(this.productInfo.Product_Price, this.productInfo.Discount, this.productInfo.DiscountType);
    }

    _.map(this.SelectOptions, function (v) {
      if (v.AttrID == field.Attribute_ID) {
        _.map(field.OptsData, function (v2) {
          if (v2.ID == value) {
            v.value = v2.Option;
            v.Price = v2.Option_Price;
            v.OptionID = value;
            v.Selected = value;
            v.bracket = bracket;
          }

          if (value == '') {
            v.value = '';
            v.Price = '0.00';
            v.OptionID = '';
            v.Selected = '';
            v.bracket = '';
          }
        });
      }
      return v;
    });

    
    if (this.Product_Attributes && this.Product_Attributes.all_attributes && this.Product_Attributes.all_attributes.length) {
      _.map(this.Product_Attributes.all_attributes, function (v) {
        if (v.Attribute_ID == field.Attribute_ID && value != '') {
          v.Selected = value;
          return v;
        }
        if (v.Attribute_ID == field.Attribute_ID && value == '') {
          v.Selected = '';
          return v;
        }
        return v;
      });
    }
    
  }

  ReSetOptionValue(ID: any): void {
    jQuery('#Sel_' + ID).val('');
  }

  SetColorValue(field: any, value: any): void {
    this.SelectedColor = value;
    _.map(this.SelectOptions, function (v) {
      if (v.AttrID == field.Attribute_ID) {
        v.value = value;
      }

      return v;
    })
  }

  calculateDiscount(Product_Price, Discount, DiscountType) {
    let Discount_Price = 0;
    if (DiscountType == "amount") {
      Discount_Price = (Product_Price - Discount);
    } else if (DiscountType == "percent") {
      Discount_Price = (Product_Price - ((Product_Price * Discount) / 100));
    }
    return Discount_Price.toFixed(2);
  }

  // set top scroll value
  @ViewChild('ReviewSection') reviewsElement: ElementRef;
  ngAfterViewInit() {
    setTimeout(() => {
        if(this.reviewsElement){
            this.scrollToOffset = (this.reviewsElement.nativeElement.offsetTop + 100);
        }
    }, 1000);
  }
  // for zoom in 
  zoomIn(event, id, url) {
    let pre = document.getElementById(id + 'p');
    pre.style.visibility = "visible";
    if (jQuery('#' + id).is(':hover')) {
      let img = document.getElementById(id);
      pre.style.backgroundImage = "url('" + url + "')";
    }
    let posX = event.offsetX;
    let posY = event.offsetY;
    // pre.style.backgroundPosition = (-posX * 2.5) + "px " + (-posY * 3.33) + "px";
    /*if (posY >= 400) {
      pre.style.backgroundPosition = (-(posX + 305)) + "px " + (-(posY + 305)) + "px";
    } else {*/
    pre.style.backgroundPosition = (-posX) + "px " + (-posY) + "px";
    //}
  }
  // for zoom
  zoomOut(id) {
    let pre = document.getElementById(id + 'p');
    pre.style.visibility = "hidden";
  }

  // for zoom in 
  partsZoomIn(event, id, url) {
    let pre = document.getElementById(id + 'p');
    pre.style.visibility = "visible";
    if (jQuery('#' + id).is(':hover')) {
      let img = document.getElementById(id);
      pre.style.backgroundImage = "url('" + url + "')";
    }
    let posX = event.offsetX;
    let posY = event.offsetY;
    pre.style.backgroundPosition = (-posX) + "px " + (-posY) + "px";
  }
  // for zoom
  partsZoomOut(id) {
    let pre = document.getElementById(id + 'p');
    pre.style.visibility = "hidden";
  }

  // open global popup
  openModalOne(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }

  // Get store list
  getCategoryParents(category_id?: any) {

    this.cond = {
      cid: this.CID,
      category_id: category_id,
    }
    // get product list 
    this.CategoryService.getCategoryParents(this.cond).subscribe(res => {
      if (res && res.data) {
        this.CategoriesBreadcumbs = res.data;
      } else {
        this.CategoriesBreadcumbs = [];
      }
    }, (err) => {
      this.CategoriesBreadcumbs = [];
    })
  }

  // set quick product data for quick popup 
  setQuickProductData(item): void {
    this.StoreService.setQuickProductItem(item);
  }
  // load zoom js
  loadScript(url) {
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  // this for product zoom
  jqueryProductZoom(id, url): void {
    // remove previous container 
    /*
    setTimeout(() => {
      jQuery('.zoomContainer').remove()
      jQuery("#product" + id).data('zoom-image', url).elevateZoom({
        zoomType: "inner",
        cursor: "crosshair"
      });
    }, 0);
    */
  }

}


