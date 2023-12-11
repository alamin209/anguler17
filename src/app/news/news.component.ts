import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { NewsService } from '../services/news/news.service'
import { HomeService } from '../services/home/home.service'
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';
// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.sass']
})
export class NewsComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  EVENTS_SEMINARS_CATEGORY: string = environment.config.EVENTS_SEMINARS_CATEGORY;
  CATEGORIES_DONT_FETCH: string = environment.config.CATEGORIES_DONT_FETCH;
  
  newsList: Array<any>;
  UserToken: string;
  userData: any;
  limit: number = 9;
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
  KeywordSearch:any;
  CateGorySearch:any;
  TagSearch:any;
  siteSettings: any;

  constructor(
    private NewsService: NewsService,
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
  
    //this.checkKeyParam();
    
    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe(data => {
      if(data){
      
        this.siteSettings = data;
        //console.log(data);
        // set meta tags values
        let title = data.meta_title; 
        let Description = data.meta_tag_desc; 
        let keywords = data.meta_tag; 
        this.titleService.setTitle(title);

        this.metaTagService.updateTag({ name: 'keywords', content: keywords});
        this.metaTagService.updateTag({ name: 'description', content: Description});

        let ogtitle = title;
        let ogdescription = Description;
        let ogurl = location.origin+'/blog';
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
    this.KeywordSearch = '';
    this.TagSearch = '';
    this.Keyword = '';
    
    setTimeout(() => {
    
        this.getParams = this.route.snapshot.queryParamMap;
        this.getParams = qs.parse(this.getParams.params);

        if (this.getParams && this.getParams.category) {
          this.CateGorySearch = this.getParams.category;
        }
        if (this.getParams && this.getParams.tag) {
          this.TagSearch = this.getParams.tag;
        }
        
        if (this.getParams && this.getParams.keyword) {
          this.KeywordSearch = this.getParams.keyword;
        }

        console.log(this.getParams);
        console.log(this.CateGorySearch);
        this.get_news_list();
    }, 600);
    

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
    if(this.CATEGORIES_DONT_FETCH){
        this.cond.CATEGORIES_DONT_FETCH=this.CATEGORIES_DONT_FETCH;
    }
   
    if(this.EVENTS_SEMINARS_CATEGORY){
        this.cond.EVENTS_SEMINARS_CATEGORY=this.EVENTS_SEMINARS_CATEGORY;
    }
    console.log(this.cond);
    
    // get news lists
    this.newsList = [];
    this.NewsService.getNewsList(this.cond).subscribe(res => {
      if (res && res.data) {
        this.newsList = (res.data.length) ? res.data : [];
        this.totalItems = res.total;
        this.recentnewsList = (res.recent_posts.length) ? res.recent_posts : [];
        this.newscategoryList = (res.categories.length) ? res.categories : [];
        this.newstagsList = (res.tags.length) ? res.tags : [];
        if (res.total == 0) {
          this.NewsNotFound = true;
        }
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
      }else{
        this.changeRouter('blog');
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
