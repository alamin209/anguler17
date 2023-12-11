import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';
import { Globals } from '../common/globals';
// Import environment config file.
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';

// import services
import { UserService } from '../services/auth/user.service'
import { ResourcesService } from '../services/resources/resources.service'
import { HomeService } from '../services/home/home.service'
import { VideoService } from '../services/video/video.service'

declare var jQuery: any;

// js custom functions, we may put these in exteranl js, and then include

@Component({
  selector: 'app-all-tips',
  templateUrl: './all-tips.component.html',
  styleUrls: ['./all-tips.component.sass']
})
export class AllTipsComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  
  resourcesList: Array<any>;
  userData: any;
  UserToken: any;
  currentUser: any;
  user_categories:any;
  limit: number = 54;
  cond:any;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  typeQueryString: any;
  sorFilter: number;
  ResourcesNotFound : boolean = false;
  CategoriesBreadcumbs: any;
  recentresourcesList: Array<any>;
  resourcescategoryList: Array<any>;
  resourcestagsList: Array<any>;
  newsdetail:any;
  Keyword:any;
  CateGorySearch:any;
  TagSearch:any;
  videoASOptions: any = {};
  page:number = 1;
  NoVideosFound: boolean = false;
  AllResourcesNotFound: boolean = false;
  AllResourcesLoaded: boolean = false;
  ResourcesCategoriesNotFound: boolean = false;
  RecentVideos: any = [];
  AllResources: any = [];
  user_likes: any = [];
  ResourcesCategories: any = [];
  SearchFilters : any = [];
  TIPProduct: any = {};
  
  MobileFilters: boolean = false;

  constructor(
    private UserService: UserService,
    private ResourcesService: ResourcesService,
    private HomeService:  HomeService,
    private VideoService:  VideoService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title,
    private globals: Globals,
  ) { 
    // Set translate language
    translate.setDefaultLang('en');

    // get activated route  
    this.activatedRoute.url.subscribe(url => {
      //this.checkKeyParam();
    });
  }

  ngOnInit() {
  
  
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
      this.getUserData();
      
    });
    
    
    
    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe(data => {
      if(data){
        // console.log(data);
        // set meta tags values
        let title = data.meta_title; 
        let Description = data.meta_tag_desc; 
        let keywords = data.meta_tag; 
        this.titleService.setTitle(title);

        this.metaTagService.updateTag({ name: 'keywords', content: keywords});
        this.metaTagService.updateTag({ name: 'description', content: Description});

        let ogtitle = title;
        let ogdescription = Description;
        let ogurl = location.origin+'/resources';
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

    //jQuery('#RecentVideos .owl-carousel').owlCarousel();
    
    // Copy objects
    this.videoASOptions = Object.assign({}, this.globals.videoASOptions);
    
  }

  /**
   * 
   * @checkKeyParam() will be used to refresh all the resources
   * it will clar all filters (it also the function run by default on page load)
   * 
  */
 
  checkKeyParam():void{
    // manage all serach filter
    this.CateGorySearch = '';
    this.TagSearch = '';
    this.Keyword = '';
    this.SearchFilters = [];
    this.get_all_tips();
    
  }


  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          this.currentUser = res.data;
          this.user_categories = res.data.categories;
          this.UserService.setAccountDataList(res);
          
          let user_permissions = res.user_permissions;
          console.log(user_permissions);
          if(user_permissions.includes('6')){
            this.checkKeyParam();
          }else{
              this.translate.get('NO_PERMISSION_MSG').subscribe((res: string) => {
                this.toastr.error(res);
              });
              //this.changeRouter('member/profile');    
              window.location.href = location.origin + '/member/profile';
          }
          
          
        }
      }, (error) => {
      });
    }
  }
  
  onLoadMore() {
    console.log('AllResourcesLoaded: '+this.AllResourcesLoaded);
    if(!this.AllResourcesLoaded){
        console.log('load more!!');
        this.page = this.page+1;
        this.get_all_tips(this.page,this.limit,true);
    }
  }
  
  /**
   * 
   * @get_all_resource functions will load the resources against \
   * particular user and company
   * 
  */ 
  get_all_tips(page?:any, limitChanged?:any,LoadMore?:any) {
      
    // set status 
    this.AllResourcesNotFound = false;
    
    // Calling service

    this.cond = {
      cid: this.CID,
      userId: this.userData.id
    }
    
    if(limitChanged){
      this.totalItems=0;
      this.currentPage=0;
    }
    if(this.limit != 1000){
      this.cond.limit=this.limit;
    }
    if(page){
      this.cond.page=page;
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
    if (this.Keyword) {
      this.cond.keyword = this.Keyword;
    }
    this.cond.TIP_CATEGORY = this.TIP_CATEGORY;
    
    // if (this.getParams && this.getParams.keyword) {
    //   this.cond.keyword = this.getParams.keyword;
    // }

    // get forum lists
    if(!LoadMore){
        this.AllResources = [];
    }
    this.ResourcesService.getTipPosts(this.cond).subscribe(res => {
      if (res && res.data) {
        // console.log(res.data);
        //this.AllResources = (res.data.length) ? res.data : [];
        let AllResources = this.AllResources;
        if(res.data && res.data.length){
            _.map(res.data, function (v) {
                AllResources.push(v);
            });
        }
        this.AllResources = AllResources;
        this.totalItems = res.total;
        if (res.total == 0) {
          this.AllResourcesNotFound = true;
        }
        
        this.TIPProduct = res.product;
      }else{
        if(!LoadMore){
            this.AllResourcesNotFound = true;
        }else{
            this.AllResourcesLoaded = true;
        }
      }  
    }, (err) => {
        this.AllResourcesNotFound = true;
    })
  }
  
  // Get resources categories and sub categories names
  getResourcesCategories(){

    this.ResourcesCategoriesNotFound = false;
    // Calling service
    this.cond = {
      cid: this.CID
    }

    this.ResourcesCategories = [];
    this.ResourcesService.getResourcesCategories(this.cond)
    .subscribe(res => {
      if (res && res.data && res.data.length) {
            // console.log(res.data);
            this.ResourcesCategories = (res.data && res.data.length) ? res.data:[]; 
      }else{
            this.ResourcesCategoriesNotFound = true;
      }
    }, (err) => {
        this.ResourcesCategoriesNotFound = true;
    });
  }

  getRecentVideos(){
    this.cond = { 
      status:2,
      cid: this.CID,
      page: this.page,
      limit: 10,
      userId: (this.userData && this.userData.id) ? this.userData.id : '',
    };
    
    this.NoVideosFound = false;
    this.RecentVideos = [];
    this.VideoService.getRecentVideos(this.cond)
    .subscribe(res => {
      if (res && res.data && res.data.length) {
            this.RecentVideos = (res.data && res.data.length) ? res.data:[]; 
            this.user_likes = (res.user_likes && res.user_likes.length) ? res.user_likes:[]; 
            let user_likes = this.user_likes;
            _.map(this.RecentVideos, function (v) {
                v.Liked = false;
                _.map(user_likes, function (v2) {
                    if(v.ID == v2.VideoId){
                        v.Liked = true;
                    }
                });
            });
      }else{
            this.NoVideosFound = true;
      }
    }, (err) => {
        this.NoVideosFound = true;
    });
  }
  
  // Like Video
  LikeVideo(ID: Number,Liked:any) {
    // Set sesson id;
    this.cond = {
      CID: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      VideoID: ID,
      Liked:Liked
    }
    
    
    this.VideoService.LikeVideo(this.cond).subscribe(res => {
      // Check data 
      if (res && res.data) {
        
        _.map(this.RecentVideos, function (v) {
            if(v.ID == ID){
                v.Liked = res.Liked;
                if(res.Liked){
                    v.Video_Likes = v.Video_Likes+1;
                }else{
                    v.Video_Likes = v.Video_Likes-1;
                }
            }
        });
        
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
      }
    });
  }
  
  AddtoLibrary(ID:any){
    // Set sesson id;
    if (!(this.userData)) {
      this.translate.get('LOGIN_FIRST').subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=academy";
      this.changeRouter(slug);
    }
    let cond = {
      CID: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      VideoID: ID,
    }
    this.VideoService.AddtoLibrary(cond).subscribe(res => {
      // Check data 
      if (res && res.data) {
            this.toastr.success('Added Successfully.');
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
      }
    });
  }
  
  Watchlater(ID:any){
    // Set sesson id;
    if (!(this.userData)) {
      this.translate.get('LOGIN_FIRST').subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=academy";
      this.changeRouter(slug);
    }
    let cond = {
      CID: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      VideoID: ID,
    }
    this.VideoService.Watchlater(cond).subscribe(res => {
      // Check data 
      if (res && res.data) {
            this.toastr.success('Added Successfully.');
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
      }
    });
  }
  
  OpenCategory(ele):void{
    
    //jQuery('.resources-items').removeClass('is--Expanded');
    jQuery(ele).parent().parent().parent().addClass('is--Expanded');
    
  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  /***
   * 
   * Search 
   * Clear all the Serarch Filters before apply @SearchByKeyword
   * so that we will reload all the resources according to keyword search
   *
   * 
  */

  SearchResourceValue(value): void {
    this.Keyword = value;
  }
  
  SearchByKeyword(value){

    this.CateGorySearch = '';
    this.TagSearch = '';
    this.Keyword = '';

    this.Keyword = value;
    this.get_all_tips();

  }

  SearchByKeywordEnter(event,value){
    if (event.keyCode == 13)
    {
      this.CateGorySearch = '';
      this.TagSearch = '';
      this.Keyword = '';

      this.Keyword = value;
      this.get_all_tips();
    }
  }
  
  /**
   * 
   *  The @addFilter and @applyFilter are for load all resources 
   *  according to these filters, when we check some checkbox in the left sidebar fiters
   * 
   *  @addFilter will checked the check box and
   *  @applFilter will add remove fitlter items from the filter array.
   * 
  */
  addFilter(filter_key){

    if(this.SearchFilters.indexOf(filter_key) != -1){
      return true;
    }

  }

  applyFilters(checked, category_id){

    console.log('applyFilters');
    console.log('category_id: '+category_id);
    if(checked){
      
      let subcateselected = false;
      let allsubcats = [];
      let SearchFilters = this.SearchFilters;
      if(this.ResourcesCategories && this.ResourcesCategories.length){
            _.map(this.ResourcesCategories, function (v) {
                if(v.ID == category_id){
                    _.map(SearchFilters, function (v2) {
                        if(v.ID == v2){
                            subcateselected = true;
                        }
                    });
                    allsubcats.push(v.ID);
                    if(v.Subcategories && v.Subcategories.length){
                        _.map(v.Subcategories, function (v) {
                            _.map(SearchFilters, function (v2) {
                                if(v.ID == v2){
                                    subcateselected = true;
                                }
                            });
                            allsubcats.push(v.ID);
                            if(v.Subcategories && v.Subcategories.length){
                                _.map(v.Subcategories, function (v) {
                                    _.map(SearchFilters, function (v2) {
                                        if(v.ID == v2){
                                            subcateselected = true;
                                        }
                                    });
                                    allsubcats.push(v.ID);
                                    if(v.Subcategories && v.Subcategories.length){
                                        _.map(v.Subcategories, function (v) {
                                            _.map(SearchFilters, function (v2) {
                                                if(v.ID == v2){
                                                    subcateselected = true;
                                                }
                                            });
                                            allsubcats.push(v.ID);
                                            if(v.Subcategories && v.Subcategories.length){
                                                _.map(v.Subcategories, function (v) {
                                                    _.map(SearchFilters, function (v2) {
                                                        if(v.ID == v2){
                                                            subcateselected = true;
                                                        }
                                                    });
                                                    allsubcats.push(v.ID);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }else{
                    if(v.Subcategories && v.Subcategories.length){
                        _.map(v.Subcategories, function (v) {
                            if(v.ID == category_id){
                                _.map(SearchFilters, function (v2) {
                                    if(v.ID == v2){
                                        subcateselected = true;
                                    }
                                });
                                allsubcats.push(v.ID);
                                if(v.Subcategories && v.Subcategories.length){
                                    _.map(v.Subcategories, function (v) {
                                        _.map(SearchFilters, function (v2) {
                                            if(v.ID == v2){
                                                subcateselected = true;
                                            }
                                        });
                                        allsubcats.push(v.ID);
                                        if(v.Subcategories && v.Subcategories.length){
                                            _.map(v.Subcategories, function (v) {
                                                _.map(SearchFilters, function (v2) {
                                                    if(v.ID == v2){
                                                        subcateselected = true;
                                                    }
                                                });
                                                allsubcats.push(v.ID);
                                                if(v.Subcategories && v.Subcategories.length){
                                                    _.map(v.Subcategories, function (v) {
                                                        _.map(SearchFilters, function (v2) {
                                                            if(v.ID == v2){
                                                                subcateselected = true;
                                                            }
                                                        });
                                                        allsubcats.push(v.ID);
                                                        
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
            console.log('subcateselected: '+subcateselected);
            if(!subcateselected){
                let SearchFilters_ = this.SearchFilters;
                if(allsubcats && allsubcats.length){
                    _.map(allsubcats, function (v3) {
                        SearchFilters_.push(v3);
                    });
                }
                this.SearchFilters = SearchFilters_;
            }
            console.log(allsubcats);
            console.log(this.SearchFilters);
      }
      this.SearchFilters.push(category_id);
    } else {
      this.SearchFilters.splice(this.SearchFilters.indexOf(category_id), 1)
    }
    
    // load all resources with category filters
    this.CateGorySearch="";
    this.CateGorySearch = this.SearchFilters;
    this.get_all_tips();
    
    this.MobileFilters = false;
    document.body.classList.remove('noscroll');
      

  }

  // Mobile responsive menu 
  ShowMobileFilters(): void {
    if (!this.MobileFilters) {
      this.MobileFilters = true;
      document.body.classList.add('noscroll');
    } else {
      this.MobileFilters = false;
      document.body.classList.remove('noscroll');
    }
  }
  
  CloseMobileFilters():void{
    if (this.MobileFilters) {
      this.MobileFilters = false;
      document.body.classList.remove('noscroll');
    }
  }

}
