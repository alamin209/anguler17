import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { StoreService } from '../../services/store/store.service'
import { SliderService } from '../../services/slider/slider.service'
import { CategoryService } from '../../services/category/category.service'

// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-count',
  templateUrl: './category-count.component.html',
  styleUrls: ['./category-count.component.sass']
})
export class CategoryCountComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  productsList: Array<any>;
  newUUid: string;
  sliderData: Array<[]>;
  categoriesData: Array<[]>;
  sliderImage: string;
  sliderTitle: string;
  findSelectedCategories: any;
  categorySlug: string;
  getParams: any;
  categoryList: any;
  categoryActiveSelected: any;
  @Input() categorySelected: any;
  @Input() channelSlug: any;

  constructor(
    private StoreService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private SliderService: SliderService,
    private CategoryService: CategoryService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
    this.sliderTitle = 'Shop';

  }

  ngOnInit() {
    // calling get store slider method
    if(this.channelSlug){
      this.getChannelDetails();
    }else{
      this.getSlider();
    }
    this.getCategories();
  }

  ngOnChanges() {
    // check selected category
    if (this.categorySelected && this.categorySelected.length) {
      // get parent ids
      let getObject = _.find(this.categorySelected, function (o) { return o.Parent_Category == "0" });
      if (getObject) {
        // assign ids
        this.categoryActiveSelected = getObject.ID
      }
      // manage top category 
      this.findSelectedCategories = this.categorySelected[this.categorySelected.length - 1];
    }
  }
  stepWiseChangeUrl() {
    // check category length
    if (this.categorySelected && this.categorySelected.length) {
      // get selected index
      let getIndex = _.findIndex(this.categorySelected, { 'ID': this.findSelectedCategories.ID });
      // check selected index
      if (getIndex) {
        // routing url
        this.changeRouter('shop/' + this.categorySelected[getIndex - 1].Category_Slug)
      } else {
        // routing url
        this.changeRouter('shop');
      }
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }


  // Fetch shop slider
  getSlider(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      slider_category: 8
    };
    this.SliderService.getSystemPageSlider(cond)
      .subscribe(res => {
        if (res && res.data && res.data) {

          this.sliderData = (res.data && res.data.length) ? res.data.slider : []; // Set slider data
          this.sliderImage = (res.data && res.data.length) ? this.PORTAL_URL + 'newcms/files/slider/' + this.CID + '/' + res.data[0].slider_image : './assets/images/background/shop-BG.jpg'; // Set slider data
          this.sliderTitle = (res.data && res.data.length) ? res.data[0].slider_title : 'Shop'; // Set slider data
        }
      }, (err) => {

      });
  }

  // Fetch shop slider
  getChannelDetails(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      channelSlug: this.channelSlug
    };
    this.StoreService.getChannelDetails(cond)
      .subscribe(res => {
        if (res && res.data && res.data) {

          this.sliderData = (res.data) ? res.data : []; // Set slider data
          this.sliderImage = (res.data) ? this.PORTAL_URL + 'files/store/channels/' + this.CID + '/' + res.data.Banner : './assets/images/background/shop-BG.jpg'; // Set slider data
          this.sliderTitle = (res.data) ? res.data.Name : 'Shop'; // Set slider data
        }
      }, (err) => {

      });
  }

  // Fetch shop slider
  getCategories(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      parent_category_id: '',
      limit: 5
    };
    this.CategoryService.getFeaturedCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data) {
          this.categoriesData = (res.data && res.data.length) ? res.data : []; // Set slider data
          // manage all serach filter
          this.checkKeyParam();
        }
      }, (err) => {

      });
  }

  checkKeyParam() {
    // get url params
    this.categorySlug = this.route.snapshot.params.category;


    if (this.categorySlug) {
      /*this.CategoryService.castCategory.subscribe(categoryList => {
      
      
        this.categoryList = categoryList;
        if(this.categoryList && this.categoryList.length){
          this.categoryList.forEach(element => {
            if((!element.childrenMenu || !element.childrenMenu.length) && (element.Category_Slug == this.categorySlug)){
              this.findSelectedCategories = element
            }else{
              if(element.Category_Slug == this.categorySlug){
                this.findSelectedCategories = element
              }else{
                element.childrenMenu.forEach(element => {
                  if(element.Category_Slug == this.categorySlug){
                    this.findSelectedCategories = element
                  }else{
                    element.childrenMenu.forEach(element => {
                      if(element.Category_Slug == this.categorySlug){
                        this.findSelectedCategories = element
                      }else{
                        element.childrenMenu.forEach(element => {
                          if(element.Category_Slug == this.categorySlug){
                            this.findSelectedCategories = element
                          }else{
                            element.childrenMenu.forEach(element => {
                              if(element.Category_Slug == this.categorySlug){
                                this.findSelectedCategories = element
                              }else{
                                element.childrenMenu.forEach(element => {
                                  if(element.Category_Slug == this.categorySlug){
                                    this.findSelectedCategories = element
                                  }else{
                                    element.childrenMenu.forEach(element => {
                                      if(element.Category_Slug == this.categorySlug){
                                        this.findSelectedCategories = element
                                      }else{
                                        element.childrenMenu.forEach(element => {
                                          if(element.Category_Slug == this.categorySlug){
                                            this.findSelectedCategories = element
                                          }else{
                                            element.childrenMenu.forEach(element => {
                                              if(element.Category_Slug == this.categorySlug){
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
        }
      });*/
    }

  }

}
