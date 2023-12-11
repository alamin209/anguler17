import { Component, OnInit, HostListener } from '@angular/core';
import {CategoryService} from "../../services/category/category.service";
import {StoreService} from "../../services/store/store.service";
import {ResourcesService} from "../../services/resources/resources.service";
import {VideoService} from "../../services/video/video.service";

import { ActivatedRoute, Router } from '@angular/router';
import {environment} from "../../../environments/environment";
import * as _ from 'lodash';
import * as qs from 'qs';

// Declear jquery
declare var jQuery: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass']
})
export class SearchComponent implements OnInit {

  categoryList: any;
  itemCategory: string;
  CID: Number = environment.config.CID;
  selectedCategoryId: number;
  ResultsList: Array<any>;
  isSuggestionVisible: boolean;
  Searching:boolean;
  searchTxt: string;
  Keyword:any;
  getParams: any;
  qQueryString: any;
  qProductType: any;
  
  constructor(
      private CategoryService: CategoryService,
      private StoreService: StoreService,
      private ResourcesService:ResourcesService,
      private VideoService:VideoService,
      private router: Router,
      private route: ActivatedRoute    
  ) { }

  ngOnInit() {
  

    this.ResultsList = [];
    this.Keyword = '';
    this.Searching = false;
    this.qProductType = 'Products';
    // This service subscribe category list
    this.CategoryService.castCategory.subscribe(categoryList => {
      
      this.categoryList = categoryList;
      //this.categoryList.unshift({ID:-1, Category_Name: "Select Category"})
    });
    
    // get activated route  
    this.route.url.subscribe(url => {
      // manage all serach filter
      this.checkKeyParam();
    });

    jQuery(document).ready(function () {
      jQuery(".js-BtnType").on("click", function () {
        jQuery(".header-nav-search-wrapp").toggleClass("show");
      });
    });
    
    
    
  }

  SetProductType(stype){
    this.qProductType = stype;
    jQuery(".header-nav-search-wrapp").toggleClass("show");
  }
  
  checkKeyParam(){
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    
  }

  // Set category item for search products
  setCategory(item: any): void {
    this.itemCategory = (item && item.Category_Name) ? item.Category_Name : '';
    let slug = 'shop/marketplace?product_cat=';
    if (item && item.ID && item.ID != -1) { // category is selected
      slug += item['Category_Slug'];
      this.selectedCategoryId = item.ID;
    } else { // no selected(All)
      slug += '0';
      this.selectedCategoryId = -1;
    }
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.navigateByUrl(slug, { replaceUrl: true });
    // this.reset();
  }

  SearchNow(keyword){
    let redirectURL = 'shop/marketplace';
    let urlQueryString: any = {};

    if (keyword != '') {
      urlQueryString = {q: keyword}
    }
    // creating URL
    if (urlQueryString) {
      redirectURL += '?' + qs.stringify(urlQueryString);
    }
    
    //this.changeRouter(redirectURL);
    window.location.href = location.origin +'/'+ redirectURL;
  }
  
  onSearchChange(searchValue) {
    this.Keyword = searchValue;
  }

  onSearchChange2(searchValue) {
    if (searchValue.length > 1) {
      
      this.Keyword = searchValue;
      this.Searching = true;
      let cond: object = {
        cid: this.CID,
        categoryId: this.selectedCategoryId,
        name: searchValue,
        sType:this.qProductType
      };
      if(this.qProductType == 'Products'){
        this.StoreService.searchProducts(cond).subscribe(res => {
          if (res && res.data) {
            this.ResultsList = (res.data.length) ? res.data : [];
            this.isSuggestionVisible = true;
            this.Searching = false;
          }else{
           this.isSuggestionVisible = false;
           this.Searching = false;
          }
        }, (err) => {
          this.isSuggestionVisible = false;
          this.Searching = false;
        });
      }
      if(this.qProductType == 'Videos'){
        this.VideoService.searchVideos(cond).subscribe(res => {
          if (res && res.data) {
            this.ResultsList = (res.data.length) ? res.data : [];
            this.isSuggestionVisible = true;
            this.Searching = false;
          }else{
           this.isSuggestionVisible = false;
           this.Searching = false;
          }
        }, (err) => {
          this.isSuggestionVisible = false;
          this.Searching = false;
        });
      }
      if(this.qProductType == 'Resources'){
        this.ResourcesService.searchResources(cond).subscribe(res => {
          if (res && res.data) {
            this.ResultsList = (res.data.length) ? res.data : [];
            this.isSuggestionVisible = true;
            this.Searching = false;
          }else{
           this.isSuggestionVisible = false;
           this.Searching = false;
          }
        }, (err) => {
          this.isSuggestionVisible = false;
          this.Searching = false;
        });
      }
    } else {
      this.isSuggestionVisible = false;
      this.Searching = false;
    }
  }
  
  
  SearchProducts(){
    
    let redirectURL = '';
    let urlQueryString: any = {};

    if (this.Keyword != '') {
      urlQueryString = {q: this.Keyword}
    }
    // creating URL
    if (urlQueryString) {
      if(this.qProductType == 'Products'){
        redirectURL += 'shop?' + qs.stringify(urlQueryString);
      }
      if(this.qProductType == 'Resources'){
        redirectURL += 'resources?' + qs.stringify(urlQueryString);
      }
      if(this.qProductType == 'Videos'){
        redirectURL += 'academy?' + qs.stringify(urlQueryString);
      }
       
    }
    
    //this.changeRouter(redirectURL);
    window.location.href = location.origin +'/'+ redirectURL;
    
  }

  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
    this.reset();
  }

  reset() {
    this.isSuggestionVisible = false;
    this.searchTxt = '';
  }
  // unset product list after user selecting product
  @HostListener('document:click', ['$event'])
  unSetProduct():void{
    this.ResultsList = [];
    this.searchTxt = '';
  }

}
