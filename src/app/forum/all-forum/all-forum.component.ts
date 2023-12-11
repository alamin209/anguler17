import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { ForumService } from '../../services/forum/forum.service'
import { HomeService } from '../../services/home/home.service'
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';
// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-all-forum',
  templateUrl: './all-forum.component.html',
  styleUrls: ['./all-forum.component.sass']
})
export class AllForumComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  
  
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  forumList: Array<any>;
  UserToken: string;
  userData: any;
  limit: number = 5;
  cond:any;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  typeQueryString: any;
  sorFilter: number;
  ForumNotFound : boolean = false;
  CategoriesBreadcumbs: any;
  recentforumList: Array<any>;
  forumcategoryList: Array<any>;
  forumtagsList: Array<any>;
  Keyword:any;
  CateGorySearch:any;
  TagSearch:any;
  ViewAll : boolean = false;
  

  constructor(
    private ForumService: ForumService,
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
      //this.checkKeyParam();
    });
  }

  ngOnInit() {
  
    this.checkKeyParam();
    
    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe(data => {
      if(data){
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
        let ogurl = location.origin+'/forum';
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

    if (this.getParams && this.getParams.category) {
      this.CateGorySearch = this.getParams.category;
    }
    if (this.getParams && this.getParams.tag) {
      this.TagSearch = this.getParams.tag;
    }

    this.ViewAll = false;
    this.get_forum_list();

  }
  
  ViewAllTopic():void{
    this.ViewAll = true;
    this.get_forum_list();
  }
  
  
  // Get store list
  get_forum_list(event?:any, limitChanged?:any) {
    // set status 
    this.ForumNotFound = false;
    
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
      this.ViewAll = true;
    }
    if (this.TagSearch) {
      this.cond.tag = this.TagSearch;
    }
    
    if (this.getParams && this.getParams.keyword) {
      this.cond.keyword = this.getParams.keyword;
      this.Keyword = this.getParams.keyword;
    }
    
    
    // get forum lists
    this.forumList = [];
    this.ForumService.getForumList(this.cond).subscribe(res => {
      if (res && res.data) {
        this.forumList = (res.data.length) ? res.data : [];
        this.totalItems = res.total;
        this.recentforumList = (res.recent_posts.length) ? res.recent_posts : [];
        this.forumcategoryList = (res.categories.length) ? res.categories : [];
        this.forumtagsList = (res.tags.length) ? res.tags : [];
        if (res.total == 0) {
          this.ForumNotFound = true;
        }
      }  
    }, (err) => {
        this.ForumNotFound = true;
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

