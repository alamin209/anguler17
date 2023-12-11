import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { ForumService } from '../../services/forum/forum.service'
import { UserService } from '../../services/auth/user.service'
import { HomeService } from '../../services/home/home.service';
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';

// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forum-detail',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.sass']
})
export class ForumDetailComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  
  UserToken: string;
  userData: any;
  limit: number = 9;
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
  forum_slug:any;
  forumdetail: any;
  post_categories: Array<any>;
  ForumComments: any;

  constructor(
    private ForumService: ForumService,
    private UserService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastr: ToastrService,
    private metaTagService: Meta,
    private titleService: Title,
  ) { 
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    
    this.route.paramMap.subscribe(params => {
      this.forum_slug = params.get("slug");
      // Calling get product details method
      this.get_forum_details(this.forum_slug);
    });

    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    this.ForumComments = [];
    
  }

  // Get forum detail
  get_forum_details(event?:any, limitChanged?:any) {
    // set status 
    this.ForumNotFound = false;
    // Calling service

    this.cond = {
      cid: this.CID,
      forum_slug : this.forum_slug
    }
   
    
    this.post_categories = [];
    // get forum details 
    this.ForumService.getForumDetails(this.cond).subscribe(res => {
      if (res && res.data) {
        this.forumdetail = (res.data.length) ? res.data[0] : [];
        this.post_categories = (res.post_categories.length) ? res.post_categories : [];
        this.recentforumList = (res.recent_posts.length) ? res.recent_posts : [];
        this.forumcategoryList = (res.categories.length) ? res.categories : [];
        this.forumtagsList = (res.tags.length) ? res.tags : [];
        if (res.data.length == 0) {
          this.ForumNotFound = true;
        }
        if(this.forumdetail.ID){
            //fetch forum post comments
            this.getForumComments(this.forumdetail.ID);
        }
        // set meta tags values
        let title = this.forumdetail.title; 
        let Description = this.forumdetail.short_description; 
        let keywords = this.forumdetail.short_description; 
        this.titleService.setTitle(title);

        this.metaTagService.updateTag({ name: 'keywords', content: keywords});
        this.metaTagService.updateTag({ name: 'description', content: Description});

        let ogtitle = title;
        let ogdescription = Description;
        let ogurl = location.origin+'/forum-details/'+this.forumdetail.slug; 
        
        let ogimage = (this.forumdetail && this.forumdetail.image) ? this.PORTAL_URL + 'files/blog/' + this.forumdetail.CID + '/' + this.forumdetail.image : location.origin+"/assets/Facebook-Auto-populated-Image-1200x630.jpg";

        this.metaTagService.updateTag({ property: 'og:title', content: ogtitle });
        this.metaTagService.updateTag({ property: 'og:description', content: ogdescription });
        this.metaTagService.updateTag({ property: 'og:url', content:ogurl });
        this.metaTagService.updateTag({ property: 'og:image', content: ogimage, itemprop: 'image' });

        this.metaTagService.updateTag({ name: 'twitter:title', content: ogtitle });
        this.metaTagService.updateTag({ name: 'twitter:description', content:ogdescription });
        this.metaTagService.updateTag({ name: 'twitter:card', content: ogimage });
        this.metaTagService.updateTag({ name: 'twitter:image', content: ogimage, itemprop: 'image' });
        
        
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
  
  // Get Forum Comments 
  getForumComments(ForumID) {
    if (ForumID) {
      let cond: object = {
        CID: this.CID,
        ForumID: ForumID,
        CustomerID:(this.userData && this.userData.id) ? this.userData.id : '',
      };
      this.ForumComments = [];
      // Calling service
      this.ForumService.getForumComments(cond).subscribe(res => {
        if (res && res.data) {
          this.ForumComments = res.data;
          
        }
      }, (err) => {
            if(err.error.error){
                this.toastr.error(err.error.error);
            }
      });
    }
  }

  SearchByKeywordEnter(event){
    if (event.keyCode == 13)
    {
      this.SearchByKeyword();
    }
  }

}
