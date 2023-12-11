import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { ResourcesService } from '../../services/resources/resources.service'
import { HomeService } from '../../services/home/home.service'
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';
// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-category-resources',
  templateUrl: './category-resources.component.html',
  styleUrls: ['./category-resources.component.sass']
})
export class CategoryResourcesComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  
  
  newsList: Array<any>;
  UserToken: string;
  userData: any;
  limit: number = 10;
  cond:any;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  typeQueryString: any;
  sorFilter: number;
  NewsNotFound : boolean = false;
  CategoriesBreadcumbs: any;
  recentnewsList: Array<any>;
  newscategoryList: Array<any>;
  newstagsList: Array<any>;
  Keyword:any;
  CateGorySearch:any;
  TagSearch:any;
  

  constructor(
    private ResourcesService: ResourcesService,
    private HomeService:  HomeService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title,
  ) { 
    // Set translate language
    translate.setDefaultLang('en');

    // get activated route  
    this.activatedRoute.url.subscribe(url => {
      this.checkKeyParam();
    });
  }

  ngOnInit() {
  
    
    this.checkKeyParam();
    
    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe(data => {
      if(data){
        // set meta tags values
        let title = data.meta_title; 
        let Description = data.meta_tag_desc; 
        let keywords = data.meta_tag; 
        this.titleService.setTitle(title);

        this.metaTagService.updateTag({ name: 'keywords', content: keywords});
        this.metaTagService.updateTag({ name: 'description', content: Description});

        let ogtitle = title;
        let ogdescription = Description;
        let ogurl = location.origin+'/news';
        let ogimage = location.origin+'/assets/Facebook-Auto-populated-Image-1200x630.jpg';
        
        this.metaTagService.updateTag({ property: 'og:title', content: ogtitle });
        this.metaTagService.updateTag({ property: 'og:description', content: ogdescription });
        this.metaTagService.updateTag({ property: 'og:url', content:ogurl });
        this.metaTagService.updateTag({ property: 'og:image', content: ogimage, itemprop: 'image' });

        this.metaTagService.updateTag({ name: 'twitter:title', content: ogtitle });
        this.metaTagService.updateTag({ name: 'twitter:description', content:ogdescription });
        this.metaTagService.updateTag({ name: 'twitter:card', content: ogimage });
        this.metaTagService.updateTag({ name: 'twitter:image', content: ogimage, itemprop: 'image' });
      }
    });
    
  }

  checkKeyParam():void{
    // manage all serach filter
    this.CateGorySearch = '';
    this.TagSearch = '';

    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);

    this.route.paramMap.subscribe(params => {
      this.CateGorySearch = params.get("category");
      
    });
    

    this.get_news_list();

  }
  
  // Get store list
  get_news_list(event?:any, limitChanged?:any) {
    // set status 
    this.NewsNotFound = false;
    // Calling service

    this.cond = {
      cid: this.CID
    }
    
    if(limitChanged){
      this.totalItems=0;
      this.currentPage=0;
    }
    if(this.limit != 1000){
      this.cond.limit=this.limit;
    }
    if(event && event.page){
      this.cond.page=event.page;
    }else{
      this.cond.page = 1;
    }
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    
    if (this.CateGorySearch) {
      this.cond.category = this.CateGorySearch;
    }
    if (this.TagSearch) {
      this.cond.tag = this.TagSearch;
    }
    
    if (this.getParams && this.getParams.keyword) {
      this.cond.keyword = this.getParams.keyword;
      this.Keyword = this.getParams.keyword;
    }
    
    if(this.RESOURCES_CATEGORY){
        this.cond.RESOURCES_CATEGORY = this.RESOURCES_CATEGORY;
    }
    
    //console.log(this.cond);
    
    // get news lists
    this.newsList = [];
    this.ResourcesService.getResourcesPosts(this.cond).subscribe(res => {
      if (res && res.categories && res.categories.length) {
        this.newscategoryList = (res.categories.length) ? res.categories : [];
      }
      if (res && res.posts_videos && res.posts_videos.length) {
        this.newsList = (res.posts_videos.length) ? res.posts_videos : [];
        this.totalItems = res.total;
        
      }else{
        this.NewsNotFound = true;
      } 
    }, (err) => {
        this.NewsNotFound = true;
    })
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  SearchBlogValue(value): void {
    this.Keyword = value;
  }

  SearchByKeyword(){
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    if (this.getParams && this.getParams.category && this.Keyword) {
      //this.changeRouter('blog?category='+this.getParams.category+'&keyword='+this.Keyword);
      this.changeRouter('blog?keyword='+this.Keyword);
    }else{
      if(this.Keyword){
        this.changeRouter('blog?keyword='+this.Keyword);
      }
    }
  }

  SearchByKeywordEnter(event){
    if (event.keyCode == 13)
    {
      this.SearchByKeyword();
    }
  }

}
