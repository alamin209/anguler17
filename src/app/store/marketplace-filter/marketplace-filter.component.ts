import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { Options, ChangeContext, PointerType } from "ng5-slider";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { forkJoin } from "rxjs";
import * as qs from "qs";

// added animations
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from "@angular/animations";

import { CategoryService } from "../../services/category/category.service";
import { StoreService } from "../../services/store/store.service";
// Import environment config file.
import { environment } from "../../../environments/environment";
// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-marketplace-filter",
  templateUrl: "./marketplace-filter.component.html",
  styleUrls: ["./marketplace-filter.component.sass"],
})
export class MarketplaceFilterComponent implements OnInit {
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  menuList: any;
  categoryList: any;
  minValue: number;
  maxValue: number;
  categorySlug: string;
  channelSlug: string;
  optionsRangeSlider: Options;
  minAMaxPPrice: any;
  manufacturers: any;
  productAttribute: any;
  priceQueryString: any;
  getParams: any;
  typeQueryString: any;
  manufacturerQueryString: any;
  aAttachmentList: any;
  aAttachmentSlug: any;
  totalAAProduct: any;
  aAttachmentTypes: any;
  localStorage: any;

  // define events
  @Output() dataEvent = new EventEmitter<any>();
  @Input() categorySelected: any;
  @Input() Fpage: any;

  constructor(
    private CategoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private StoreService: StoreService,
    private activatedRoute: ActivatedRoute
  ) {
    // range slider options
    this.minValue = 0;
    this.maxValue = 200;
    this.optionsRangeSlider = {
      hidePointerLabels: true,
      hideLimitLabels: true,
      floor: 0,
      ceil: 500,
      getSelectionBarColor: (value: number): string => {
        return "#4167b0";
      },
      getPointerColor: (value: number): string => {
        return "#4167b0";
      },
    };

    // get activated route
    this.activatedRoute.url.subscribe((url) => {
      // manage all serach filter
      this.updateDAta();
    });
  }

  ngOnInit() {

    this.channelSlug = '';
    this.updateDAta();
  }

  //fetch categories method
  getCategoryList(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      parent_category_id: "",
      fetch_from: this.Fpage,
    };
    this.CategoryService.getCategories(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.categoryList = res.data;
        }else{
          this.categoryList = [];
        }
      },
      (err) => {
        this.categoryList = [];
      }
    );
  }

  // update data when change route
  updateDAta() {
    // This service subscribe category list
    /*
    this.CategoryService.castCategory.subscribe((categoryList) => {
      this.categoryList = categoryList;
    });
    */
    // This service subscribe category list
    this.CategoryService.castaAttachmentList.subscribe((aAttachmentList) => {
      if (aAttachmentList && aAttachmentList.length) {
        this.aAttachmentList = aAttachmentList;
      }
    });

    // category sider bar
    jQuery(document).ready(function () {
      jQuery(".sidebar--widget__categories").on(
        "click",
        "li > a",
        function (e) {
          if (jQuery(this).next().hasClass("sub-menu") == false) {
          }

          var parent = jQuery(this).parent().parent();
          var the = jQuery(this);

          parent
            .children("li.open")
            .children("span")
            .children(".arrow")
            .removeClass("open");
          parent.children("li.open").children(".sub-menu").slideUp(200);
          parent.children("li.open").removeClass("open");

          var sub = jQuery(this).next();
          var slideOffeset = -200;
          var slideSpeed = 200;

          if (sub.is(":visible")) {
            jQuery(".arrow", jQuery(this)).removeClass("open");
            jQuery(this).parent().removeClass("open");
            sub.slideUp(slideSpeed, function () {});
          } else {
            jQuery(".arrow", jQuery(this)).addClass("open");
            jQuery(this).parent().addClass("open");
            sub.slideDown(slideSpeed, function () {});
          }
        }
      );
    });

    // calling multiple method
    forkJoin([
      this.getStoreAttributes(),
      this.checkParams(),
      //this.getAATProduct(),
    ]);
  }

  // check params
  checkParams(): void {
    // get category params
    this.categorySlug = this.route.snapshot.params.category;
    this.channelSlug = this.route.snapshot.params.channel;
    
  

    this.getCategoryList();

    let setCategorySlug = this.categorySlug;
    if (setCategorySlug) {
      setTimeout(() => {
        jQuery(document).ready(function () {
          let attIds = "#" + setCategorySlug;
          jQuery(attIds).parent("li").addClass("open");
          jQuery(attIds).parent().children(".sub-menu").css("display", "block");

          jQuery(attIds).parent("li").parents().addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds).parent("li").parents().parents().addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds)
            .parent("li")
            .parents()
            .parents()
            .parents()
            .addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds)
            .parent("li")
            .parents()
            .parents()
            .parents()
            .parents()
            .addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds)
            .parent("li")
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds)
            .parent("li")
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");

          jQuery(attIds)
            .parent("li")
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .addClass("open");
          jQuery(attIds)
            .parent()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .parents()
            .children(".sub-menu")
            .css("display", "block");
        });
      }, 1000);
    }
    // get query string
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    // check qeury price
    if (this.getParams && this.getParams.price) {
      // set price params
      this.priceQueryString = this.getParams.price;
    }
    // check qeury type
    this.typeQueryString = "";
    let addClasstype = "";
    if (this.getParams && this.getParams.type) {
      // set type params
      this.typeQueryString = this.getParams.type;
      addClasstype = this.typeQueryString;
      // for adding class
      setTimeout(() => {
        jQuery(document).ready(function () {
          jQuery.each(addClasstype, function (index, v) {
            var idType = v.ID + v.Options + v.dataId;
            jQuery("#" + idType).addClass("active");
          });
        });
      }, 1000);
    }
    // check qeury manufacturer
    this.manufacturerQueryString = "";
    if (this.getParams && this.getParams.manufacturer) {
      // set type params
      this.manufacturerQueryString = this.getParams.manufacturer;
      var manufacturerQueryStrings = this.manufacturerQueryString;
      // for adding class
      setTimeout(() => {
        jQuery(document).ready(function () {
          jQuery.each(manufacturerQueryStrings, function (index, v) {
            jQuery("#AA" + v).addClass("active");
          });
        });
      }, 1000);
    }

    // this for attachments accessories
    if (this.getParams && this.getParams.accessories) {
      this.aAttachmentSlug = true;
    } else {
      this.aAttachmentSlug = false;
    }

    // this for attachments accessories types
    this.aAttachmentTypes = [];
    let aAAddClasstype = [];
    // remove active filter for attachment types
    setTimeout(() => {
      jQuery(document).ready(function () {
        jQuery(".attachmentList").find(".items").removeClass("active");
      });
    }, 700);
    // check data
    if (this.getParams && this.getParams.types) {
      // split url slug
      this.aAttachmentTypes = this.getParams.types.split("/");
      if (this.aAttachmentTypes && this.aAttachmentTypes.length) {
        aAAddClasstype = this.aAttachmentTypes;
        // for adding class
        setTimeout(() => {
          jQuery(document).ready(function () {
            jQuery.each(aAAddClasstype, function (index, v) {
              jQuery("#AA" + v).addClass("active");
            });
          });
        }, 1000);
      }
    }
  }

  // get store attributes
  getStoreAttributes(): void {
    let cond: any = {
      cid: this.CID,
      marketplace: this.MARKETPLACE,
    };
    // send category id
    if (this.categorySelected && this.categorySelected.ID) {
      cond.category_id = this.categorySelected.ID;
    }
    // get product attributes
    this.StoreService.getStoreAttributes(cond).subscribe(
      (res) => {
        // Check data
        if (res && res.data) {
          this.productAttribute = res.data;
          // set attributes
          let setProductAttributes = _.clone(this.productAttribute);
          let typeQuery = _.clone(this.typeQueryString);
          _.map(setProductAttributes, function (v) {
            if (typeQuery && typeQuery.length) {
              let getObject = _.find(typeQuery, { ID: String(v.ID) });
              if (getObject) {
                v.class = true;
              } else {
                v.class = false;
              }
            } else {
              v.class = false;
            }
            return v;
          });
          this.productAttribute = setProductAttributes;
          // add price object in product attributes array
          let priceObj = {
            Default_Value: "Price",
            Description: "Price",
            Field_Name: "Price",
            Name: "Price",
            ID: "",
            Options: "Price",
            class: true,
          };
          //this.productAttribute.splice(0, 0, priceObj);

          // add manufacturers object in product attributes array
          let manufacturerseObj = {
            Default_Value: "Manufacturers",
            Description: "Manufacturers",
            Field_Name: "Manufacturers",
            Name: "Manufacturers",
            ID: "",
            Options: "Manufacturers",
            class: false,
          };
          //this.productAttribute.splice(1, 0, manufacturerseObj);
        }

        // set slider option dynamically according to min/max price
        if (res && res.price) {
          this.minAMaxPPrice = res.price;
          // set slider when price from filter
          if (this.priceQueryString) {
            // re set slider value
            setTimeout(() => {
              this.minValue = this.priceQueryString.minValue
                ? this.priceQueryString.minValue
                : 0;
              this.maxValue = this.priceQueryString.maxValue
                ? this.priceQueryString.maxValue
                : this.minAMaxPPrice.max_price;
            }, 600);
          } else {
            setTimeout(() => {
              this.minValue = 0;
              this.maxValue = this.minAMaxPPrice.max_price;
            }, 400);
          }
          setTimeout(() => {
            // set slider
            this.optionsRangeSlider = {
              hidePointerLabels: true,
              hideLimitLabels: true,
              floor: 0,
              ceil: Number(this.minAMaxPPrice.max_price),
              getSelectionBarColor: (value: number): string => {
                return "#4167b0";
              },
              getPointerColor: (value: number): string => {
                return "#4167b0";
              },
            };
          }, 0);
        }
        // set manufacturers list
        if (res && res.manufacturers) {
          this.manufacturers = res.manufacturers;
          // send data of parent component
          this.dataEvent.emit(res.manufacturers);
        }
      },
      (err) => {}
    );
  }

  onPriceChangeEnd(changeContext: ChangeContext): void {
    this.productFilter(
      changeContext,
      { minValue: changeContext.value, maxValue: changeContext.highValue },
      "price"
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  // category filter
  productFilter(event, data, type): void {
    let redirectURL = "shop/marketplace/";
    if(this.channelSlug){
      redirectURL = "shop/"+this.channelSlug+'/'
    }
    let urlQueryString: any = {};

    // this section for category
    if (type == "category" || this.categorySlug) {
      // change category slug
      if (data && data.Category_Slug) {
        if(this.channelSlug){
          redirectURL += data.Category_Slug;
        }else{
          redirectURL += 'category/'+data.Category_Slug;
        }
      } else {
        // previous category slug
        if(this.channelSlug){
          redirectURL += this.categorySlug;
        }else{
          redirectURL += 'category/'+this.categorySlug;
        }
      }
    }
    // for attachment associates
    if (this.aAttachmentSlug) {
      urlQueryString = {
        accessories: "yes",
      };
    }
    // for attachment associates types
    if (this.aAttachmentTypes || type == "attachment") {
      if (type == "attachment") {
        //data not available in item push new items
        if (typeof this.aAttachmentTypes == "undefined") {
          this.aAttachmentTypes = [data];
        } else {
          // get current item index
          let getIndex = _.findIndex(this.aAttachmentTypes, function (o) {
            return String(o) == String(data);
          });
          if (getIndex >= 0) {
            // remove item from array
            this.aAttachmentTypes.splice(getIndex, 1);
          } else {
            this.aAttachmentTypes.push(data);
          }
        }
      }
      if (this.aAttachmentTypes && this.aAttachmentTypes.length) {
        urlQueryString.types = this.aAttachmentTypes.join("/");
      }
    }

    // this section for price
    if (type == "price" || this.priceQueryString) {
      if (data && data.minValue >= 0) {
        urlQueryString.price = {
          minValue: data.minValue,
          maxValue: data.maxValue,
        };
      } else {
        urlQueryString.price = this.priceQueryString;
      }
    }

    // this section for all type
    if (type == "type" || this.typeQueryString) {
      let typeObj = [];
      if (data && type == "type") {
        // check previous data
        if (this.typeQueryString && this.typeQueryString.length) {
          // find data in previous query string
          let getObject = _.find(this.typeQueryString, {
            Options: String(data.Options),
          });
          if (!getObject) {
            typeObj = [data];
          } else {
            // remove array according to index
            let rmIndex = _.findIndex(this.typeQueryString, function (v) {
              return (
                v["ID"] === getObject.ID && v["Options"] === getObject.Options
              );
            });
            this.typeQueryString.splice(rmIndex, 1);
          }
        } else {
          typeObj = [data];
        }
      }
      // sert previous filter
      let prevFObject = [];
      if (this.typeQueryString && this.typeQueryString.length) {
        prevFObject = this.typeQueryString;
      }
      // set params for filter types
      urlQueryString.type = prevFObject.concat(typeObj);
    }

    // this section for all type
    if (type == "manufacturer" || this.manufacturerQueryString) {
      let typeMObj = [];
      if (data && type == "manufacturer") {
        // check previous data
        if (
          this.manufacturerQueryString &&
          this.manufacturerQueryString.length
        ) {
          // find data in previous query string
          let getObject = _.find(this.manufacturerQueryString, function (o) {
            return String(o) == String(data.ID);
          });
          if (!getObject) {
            typeMObj = [data.ID];
          } else {
            // remove array according to index
            let rmIndex = _.findIndex(
              this.manufacturerQueryString,
              function (v) {
                return v["ID"] === getObject.ID;
              }
            );
            this.manufacturerQueryString.splice(rmIndex, 1);
          }
        } else {
          typeMObj = [data.ID];
        }
      }
      // current params
      let prevMObject = [];
      if (this.manufacturerQueryString && this.manufacturerQueryString.length) {
        prevMObject = this.manufacturerQueryString;
      }
      urlQueryString.manufacturer = prevMObject.concat(typeMObj);
    }
    // creating URL
    if (urlQueryString) {
      redirectURL += "?" + qs.stringify(urlQueryString);
    }
    // change url
    
    this.changeRouter(redirectURL);
    //window.location.href = location.origin +'/'+ redirectURL;

  }

  ngOnChanges() {
    // check selected category
    if (this.categorySelected && this.categorySelected.length) {
      // get selected category
      this.categorySelected =
        this.categorySelected[this.categorySelected.length - 1];
      // get attributes
      this.getStoreAttributes();
    }
  }

  // This get attachment & accessorie total product
  getAATProduct(): void {
    let cond = {
      cid: this.CID,
    };
    // service return data
    this.CategoryService.getAATProduct(cond).subscribe(
      (res) => {
        // set total product for attachment & accessorie
        this.totalAAProduct = res && res.total ? res.total : 0;
      },
      (err) => {}
    );
  }

  // manage attachments & accessories toggle
  aAToggle(status) {
    if (status) {
      this.aAttachmentSlug = true;
      this.productFilter("", "", "");
    } else {
      this.aAttachmentSlug = false;
      this.productFilter("", "", "");
    }
  }
}
