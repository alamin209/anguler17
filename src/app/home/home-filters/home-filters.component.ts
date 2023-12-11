import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CategoryService } from "../../services/category/category.service";
import {ResourcesService} from "../../services/resources/resources.service";
import {VideoService} from "../../services/video/video.service";

// Import environment config file.
import { environment } from "../../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-home-filters",
  templateUrl: "./home-filters.component.html",
  styleUrls: ["./home-filters.component.sass"],
})
export class HomeFiltersComponent implements OnInit {
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  categoryList: any = [];
  qProductType:any;


  constructor(
    private CategoryService: CategoryService,
    private ResourcesService:ResourcesService,
    private VideoService:VideoService,
    private router: Router
  ) {}

  ngOnInit() {

    this.qProductType = 'Products';

    this.categoryList = [];
    // get featured categories
    this.getStoreCategoryList();

    jQuery(".jsScroll").click(function (event) {
      event.preventDefault();
      jQuery("html, body").animate(
        { scrollTop: jQuery(jQuery(this).attr("href")).offset().top },
        500
      );
    });

    
  }

  SetProductType(stype){
    
    this.qProductType = stype;
    this.categoryList = [];
    
    if(stype == 'Products'){
      this.getStoreCategoryList();
    }

    if(stype == 'Resources'){
      this.getResourcesCategories();
    }
    
    if(stype == 'Videos'){
      this.getVideosCategories();
    }
    

  }

  //fetch categories method
  getStoreCategoryList(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      parent_category_id: ''
    };
    this.CategoryService.getCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {

          this.categoryList = (res.data && res.data.length) ? res.data:[];
          // Set data for subscribe categorty list
          this.CategoryService.setCategoryList(res.data);
        }else{
          this.categoryList = [];
        }
      }, (err) => {
        this.categoryList = [];
      });
  }

  //fetch categories method
  getResourcesCategories(): void {
    // Set conditions
    let cond = {
      cid: this.CID
    };
    this.ResourcesService.getResourcesCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          // console.log(res.data);
          this.categoryList = (res.data && res.data.length) ? res.data:[]; 
        }else{
          this.categoryList = [];
        }
      }, (err) => {
        this.categoryList = [];
      });
  }
  
  //fetch categories method
  getVideosCategories(): void {
    // Set conditions
    let cond = {
      cid: this.CID
    };
    this.VideoService.getVideoCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {

          this.categoryList = res.data;
          // Set data for subscribe categorty list
          this.CategoryService.setCategoryList(res.data);
        }else{
          this.categoryList = [];
        }
      }, (err) => {
        this.categoryList = [];
      });
  }
  

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
}
