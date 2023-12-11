import { Component, OnInit,TemplateRef } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { ActivatedRoute, Router} from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { VideoService } from '../../services/video/video.service';
import { HomeService } from '../../services/home/home.service'
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/auth/user.service'
import * as _ from 'lodash';
import { Title,Meta  } from '@angular/platform-browser';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-video-details',
  templateUrl: './video-details.component.html',
  styleUrls: ['./video-details.component.sass']
})
export class VideoDetailsComponent implements OnInit {

  CID: number = environment.config.CID;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  cond: any = [];
  userData: any;
  limit: number = 9;
  currentPage :number=0;
  getParams: any;
  RelatedVideos: Array<any>;
  UserToken:any;
  _slug:any;
  VideoDetail: any;
  VideoURL:any;
  currentUser: any;
  user_categories:any;
  user_likes:any;
  favorites_videos:any;
  watch_later_videos:any;
  user_channels:any;
  modalRef: BsModalRef;
  
  constructor(
    private UserService: UserService,
    private HomeService: HomeService,
    private VideoService: VideoService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private metaTagService: Meta,
    private titleService: Title,
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    
    this.route.paramMap.subscribe(params => {
        this._slug = params.get("slug");
        // brodcast data for login user
        this.userData = '';
        this.UserService.setUserDataList();
        this.UserService.castUserData.subscribe(userData => {
        this.userData = userData;
        this.userData;
        // get user token
        this.UserToken = localStorage.getItem('token');

        this.getVideoDetails();
        
        });
    });
    
  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
  SubscribeVideoChannel(VideoID:any,ChannelID:any,Subscribed:any){
    if (this.userData) {
      let dataObj = {
        CID: this.CID,
        userId: this.userData.id,
        ChannelID: ChannelID,
        VideoID: VideoID,
        Subscribed:Subscribed
      }
      this.VideoService.SubscribeChannel(dataObj).subscribe(res => {
        if (res && res.data) {
           this.VideoDetail.Subscribed = res.Subscribed;
           if(res.Subscribed){
                this.toastr.success('Subscribed Successfully.');
            }else{
                this.toastr.error('Unsubscribed Successfully.');
            }
        }
      }, (error) => {
      });
    }
    
  }
  
  
  
  
  getVideoDetails(){
    this.cond = { 
      cid: this.CID,
      slug: this._slug,
      userId: (this.userData && this.userData.id) ? this.userData.id : '',
    };
    this.VideoService.getVideoDetails(this.cond).subscribe(res => {
        
      if (res && res.data) {
          this.VideoDetail = (res.data.vData) ? res.data.vData:[];
          this.RelatedVideos = (res.data.RelatedVideos) ? res.data.RelatedVideos:[];
          let vurl = '';
          if(this.VideoDetail.Video_Source == 'youtube'){
            vurl = 'https://www.youtube-nocookie.com/embed/'+this.VideoDetail.Video_Unique_Id+'?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=0';
            this.VideoURL = this.sanitizer.bypassSecurityTrustResourceUrl(vurl);
          }
          if(this.VideoDetail.Video_Source == 'vimeo'){
            vurl = 'https://player.vimeo.com/academy/video/'+this.VideoDetail.Video_Unique_Id+'?autopause=0';
            this.VideoURL = this.sanitizer.bypassSecurityTrustResourceUrl(vurl);
          }
          
          // set meta tags values
          let title = this.VideoDetail.Video_Title;
          let Description = this.VideoDetail.Video_Description;
          let keywords = this.VideoDetail.Video_Description;
          this.titleService.setTitle(title);

          this.metaTagService.updateTag({
            name: "keywords",
            content: keywords,
          });
          this.metaTagService.updateTag({
            name: "description",
            content: Description,
          });

          let ogtitle = title;
          let ogdescription = Description;
          let ogurl = location.origin + "/academy/video/" + this.VideoDetail.Video_slug+'-'+this.VideoDetail.ID;
          let ogimage = vurl;

          this.metaTagService.updateTag({
            property: "og:title",
            content: ogtitle,
          });
          this.metaTagService.updateTag({
            property: "og:description",
            content: ogdescription,
          });
          this.metaTagService.updateTag({ property: "og:url", content: ogurl });
          this.metaTagService.updateTag({
            property: "og:image",
            content: 'https://'+this.VideoDetail.Video_Thumbnail_Large,
            itemprop: "image",
          });
          this.metaTagService.updateTag({
            property: "og:video",
            content: 'https://'+this.VideoDetail.Video_Url,
            itemprop: "video",
          });
          this.metaTagService.updateTag({
            name: "twitter:title",
            content: ogtitle,
          });
          this.metaTagService.updateTag({
            name: "twitter:description",
            content: ogdescription,
          });
          this.metaTagService.updateTag({
            name: "twitter:card",
            content: ogimage,
          });
          this.metaTagService.updateTag({
            name: "twitter:image",
            content: ogimage,
            itemprop: "image",
          });
          
          
          this.getUserData();
            
          
          
          
          
      }
      
    }, (err) => {

    });
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
        
        _.map(this.RelatedVideos, function (v) {
            if(v.ID == ID){
                v.Liked = res.Liked;
                if(res.Liked){
                    v.Video_Likes = v.Video_Likes+1;
                }else{
                    v.Video_Likes = v.Video_Likes-1;
                }
            }
        });
        this.VideoDetail.Liked = res.Liked;   
        if(res.Liked){
            this.VideoDetail.Video_Likes = this.VideoDetail.Video_Likes+1;
        }else{
            this.VideoDetail.Video_Likes = this.VideoDetail.Video_Likes-1;
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
        this.VideoDetail.Library = false;  
        if (res && res.added) {
            this.VideoDetail.Library = res.added;  
            this.toastr.success('Added Successfully.');
        }else{
            if(this.VideoDetail.ID == ID){
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
            this.VideoDetail.WatchLater = false;  
            if (res && res.added) {
                this.VideoDetail.WatchLater = res.added;  
                this.toastr.success('Added Successfully.');
            }else{
                if(this.VideoDetail.ID == ID){
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

  
  // get current user data
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: (this.userData && this.userData.id) ? this.userData.id : '',
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          
          this.currentUser = res.data;
          this.user_categories = res.data.categories;
          this.user_likes = res.video_likes;
          this.favorites_videos = res.favorites_videos;
          this.watch_later_videos = res.watch_later_videos;
          this.user_channels = res.user_channels;
          
		  this.UserService.setAccountDataList(res);
		  
          let user_likes = this.user_likes;
            let VideoDetailID = this.VideoDetail.ID;

            let _Liked = false;
            _.map(user_likes, function (v2) {
                if(VideoDetailID == v2.VideoId){
                    _Liked = true;
                }
            });
            this.VideoDetail.Liked = _Liked;
            
            let _Library = false;
            _.map(this.favorites_videos, function (v2) {
                if(VideoDetailID == v2.VideoID){
                    _Library = true;
                }
            });
            this.VideoDetail.Library = _Library;
            let _WatchLater = false;
            _.map(this.watch_later_videos, function (v2) {
                if(VideoDetailID == v2.VideoID){
                    _WatchLater = true;
                }
            });
            this.VideoDetail.WatchLater = _WatchLater;
            
            let watch_later_videos = this.watch_later_videos;
            let favorites_videos = this.favorites_videos;
            
            _.map(this.RelatedVideos, function (v) {
                v.Liked = false;
                v.Library = false;
                v.WatchLater = false;
                _.map(user_likes, function (v2) {
                    if(v.ID == v2.VideoId){
                        v.Liked = true;
                    }
                });
                _.map(favorites_videos, function (v2) {
                    if(v.ID == v2.VideoId){
                        v.Library = true;
                    }
                });
                _.map(watch_later_videos, function (v2) {
                    if(v.ID == v2.VideoId){
                        v.WatchLater = true;
                    }
                });
            });

            let user_channels = this.user_channels;
            let ChannelId = this.VideoDetail.ChannelId;
            let _Subscribed = false;
            _.map(user_channels, function (v2) {
                if(ChannelId == v2.ChannelID){
                    _Subscribed = true;
                }
            });

            this.VideoDetail.Subscribed = _Subscribed;
          
        }
      }, (error) => {
      });
    }
  }
  
  
  
  // for model 
  openModal(template: TemplateRef<any>,Type = '',RefID = 0) {
    this.modalRef = this.modalService.show(template);
  }
  
  
  
}
