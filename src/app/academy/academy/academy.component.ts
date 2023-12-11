import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import * as _ from 'lodash';
import * as qs from 'qs';
import { Title,Meta  } from '@angular/platform-browser';

// import services
import { VideoService } from '../../services/video/video.service';
import { UserService } from '../../services/auth/user.service'
import { HomeService } from '../../services/home/home.service'

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-academy',
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.sass']
})
export class AcademyComponent implements OnInit {

  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  userData: any;
  UserToken: any;
  currentUser: any;
  user_categories:any;
  user_permissions:any;
  user_likes:any;
  favorites_videos:any;
  watch_later_videos:any;
  user_channels:any;
  cond: any = [];
  NoVideosFound: boolean = false;
  AllVideosLoaded: boolean = false;
  AllVideos: any = [];
  pendingVideos:any = [];
  finalVideos:any = [];
  page:number = 1;
  limit:number = 16;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  categories = [];
  FilterCategory:any;
  FilterKeyword:any;
  FilterTag:any;
  FilterType:any;
  ChannelSlug:any;
  VideoTags:any;
  Subscriptions:any;

  MobileFilters: boolean = false;
  
  constructor(
    private UserService: UserService,
    private HomeService: HomeService,
    private VideoService: VideoService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title,
   
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {
  
    this.FilterType = '';
    this.ChannelSlug = '';
    
    this.route.paramMap.subscribe(params => {
      this.FilterType = params.get("type");
      this.ChannelSlug = params.get("channel_slug");
      
      
    });
    
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    this.FilterCategory = '';
    this.FilterKeyword = '';
    
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    // check qeury price
    if (this.getParams && this.getParams.q) {
        // set price params
        this.FilterKeyword = this.getParams.q;   
    }

    if (this.getParams && this.getParams.category) {
      var lastSlash = this.getParams.category.lastIndexOf("-");
      let cID = this.getParams.category.substring(lastSlash + 1); 
      this.FilterCategory = cID;
      
      setTimeout(() => {
        jQuery('#CaTFilter').val(cID);
      },2000);

    }
    
    let cond = {
      cid: this.CID
    };
    this.VideoService.getVideoCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.categories = res.data;
        }
      }, (err) => {
         
      });
      
    this.getUserData();
    // calling multiple method
    //forkJoin([this.getVideos(), this.getVideoTags()]);
    
    if(this.ChannelSlug){
        this.FilterType = 'subscription';
    }

    if(this.FilterType == 'subscription'){
        this.getSubscriptions();
    }
    
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
        let ogurl = location.origin+'/academy';
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
  
  
  FilterByCategory(category){
    this.FilterCategory = category.target.value;
    this.getVideos();
  }
  
  SaveKeyword(keyword:any){
    this.FilterKeyword = keyword.target.value;
  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
  // redirect to page according to url
  FilterByType(type:any): void {
    let slug = '';
    if(type != ''){
        slug = '/academy/'+type;
        this.FilterType = type;
    }else{
        slug = 'academy';
    }
    this.router.navigateByUrl(slug, { replaceUrl: true });
    this.FilterTag = '';
    this.AllVideosLoaded = false;
    
    this.MobileFilters = false;
    document.body.classList.remove('noscroll');
      
    this.getVideos();
    if(type == 'subscription'){
        this.getSubscriptions();
    }else{
        this.ChannelSlug = '';
    }
    
  }
  
  FilterByChannel(Channel_Slug:any): void {
    
    //let slug = '/academy/channel/'+Channel_Slug;
    //this.router.navigateByUrl(slug, { replaceUrl: true });
    
    this.ChannelSlug = Channel_Slug;
    this.FilterType = 'subscription';
    this.FilterTag = '';
    this.getVideos();
    
  }
  
  // Like Video
  LikeVideo(ID: Number,Liked:any) {
    
    // Set sesson id;
    if (!(this.userData)) {
      this.translate.get('LOGIN_FIRST').subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=academy";
      this.changeRouter(slug);
    }
    this.cond = {
      CID: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      VideoID: ID,
      Liked:Liked
    }
    
    this.VideoService.LikeVideo(this.cond).subscribe(res => {
      // Check data 
      if (res && res.data) {
        
        _.map(this.AllVideos, function (v) {
            if(v.ID == ID){
                v.Liked = res.Liked;
                if(res.Liked){
                    v.Video_Likes = v.Video_Likes+1;
                }else{
                    v.Video_Likes = v.Video_Likes-1;
                }
            }
        });
        if(this.FilterType == 'liked'){
            this.getVideos();
        }
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
            if (res && res.added) {
                this.toastr.success('Added Successfully.');
            }else{
                if(this.FilterType =='library'){
                    this.getVideos();
                    this.toastr.error('Removed Successfully.');
                }else{
                    this.toastr.success('Added Successfully.');
                }
                
            }
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
            if (res && res.added) {
                this.toastr.success('Added Successfully.');
            }else{
                if(this.FilterType =='watch-later'){
                    this.getVideos();
                    this.toastr.error('Removed Successfully.');
                }else{
                    this.toastr.success('Added Successfully.');
                }
            }
      }

    }, (err) => {
      if (err.error.error) {
        this.toastr.error(err.error.error);
      }
    });
  }
  
  VideoByTags(ID:any,Tag:any){
    this.FilterType = '';
    this.FilterTag = Tag;
    this.getVideos();
  }
  

  onLoadMore() {
    
    
    console.log('AllVideosLoaded: '+this.AllVideosLoaded);
    
    if(!this.AllVideosLoaded){
    
        console.log('load more!!');
        this.page = this.page+1;
        this.getVideos(this.page,this.limit,true);
    }
    
  }
  
  getVideos(page?:any, limitChanged?:any, LoadMore?:any){
  
    this.cond = { 
      userId: (this.userData && this.userData.id) ? this.userData.id : '',
      status:2,
      cid: this.CID,
      page: this.page,
      limit: this.limit,
      FilterType:this.FilterType,
      ChannelSlug:this.ChannelSlug
    };
    if (this.FilterCategory) {
        this.cond.category = this.FilterCategory;
    }
    if (this.FilterKeyword) {
        this.cond.keyword = this.FilterKeyword;
    }
    if (this.FilterTag) {
        this.cond.tag = this.FilterTag;
    }
    
    if(limitChanged){
      this.totalItems=0;
      this.currentPage=0;
    }
    if(this.limit != 1000){
      this.cond.limit=this.limit;
    }
    if(page){
      this.cond.page = page;
    }else{
      this.cond.page = 1;
    }
    
    
    this.NoVideosFound = false;
    
    if(!LoadMore){
        this.AllVideos = [];
    }
    this.VideoService.getVideos(this.cond).subscribe(res => {
      if (res && res.data && res.data.length) {
            this.totalItems = res.total;
            let AllVideos = this.AllVideos;
            if(res.data && res.data.length){
                _.map(res.data, function (v) {
                    AllVideos.push(v);
                });
            }
            this.AllVideos = AllVideos;
            
            //this.AllVideos = (res.data && res.data.length) ? res.data:[]; 
            this.user_likes = (res.likes && res.likes.length) ? res.likes:[]; 
            let user_likes = this.user_likes;
            _.map(this.AllVideos, function (v) {
                v.Liked = false;
                _.map(user_likes, function (v2) {
                    if(v.ID == v2.VideoId){
                        v.Liked = true;
                    }
                });
            });
            
      }else{
        //this.AllVideos = [];
        if(!LoadMore){
            this.NoVideosFound = true;
        }else{
            this.AllVideosLoaded = true;
        }
      }
    }, (err) => {
        this.NoVideosFound = true;
        //this.AllVideos = [];
    });
  }

  

  receiveMessage($event) {
    //this.getUserPendingVideos();
  }
  
  
  // get current user
  getVideoTags(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.VideoService.getPVideoTags(dataObj).subscribe(res => {
        if (res && res.data) {
          this.VideoTags = res.data;
        }
      }, (error) => {
      });
    }
  }
  
  // get subscriptions
  getSubscriptions(): void {
    
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.VideoService.getSubscriptions(dataObj).subscribe(res => {
        if (res && res.data) {
          this.Subscriptions = res.data;
        }
      }, (error) => {
      });
    }
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
          this.user_permissions = res.user_permissions;
          this.UserService.setAccountDataList(res);
          
          let user_permissions = this.user_permissions;
          if(user_permissions.includes('3')){
            forkJoin([this.getVideos(), this.getVideoTags()]);
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
