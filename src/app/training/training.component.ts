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
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.sass']
})
export class TrainingComponent implements OnInit {

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
  AllTrainingsNotFound: boolean = false;
  AllTrainingsLoaded: boolean = false;
  ResourcesCategoriesNotFound: boolean = false;
  RecentVideos: any = [];
  AllTrainings: any = [];
  user_likes: any = [];
  ResourcesCategories: any = [];
  SearchFilters : any = [];
  TIPProduct: any = {};
  ProductSlug:any;
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
    
    this.route.paramMap.subscribe(params => {
        this.ProductSlug = params.get("slug");
        // call fucntion for fetch orders
        
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
    //this.get_all_posts();
    this.get_traiing_products();

    
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
  
  get_traiing_products(page?:any, limitChanged?:any,LoadMore?:any) {
      
    // set status 
    this.AllTrainingsNotFound = false;
    
    this.AllTrainings = [];
    // Calling service
    this.cond = {
      cid: this.CID,
      userId: this.userData.id
    }
   
    this.ResourcesService.getTrainingProducts(this.cond).subscribe(res => {
      if (res && res.data) {
        // console.log(res.data);
        this.AllTrainings = (res.data.length) ? res.data : [];
        
      }else{
        
      }  
    }, (err) => {
        this.AllTrainingsNotFound = true;
    })
  }
 

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }



}
