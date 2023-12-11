import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { NewsService } from "../../services/news/news.service";
import { UserService } from "../../services/auth/user.service";
import { HomeService } from "../../services/home/home.service";
import { ToastrService } from "ngx-toastr";
import { Title, Meta } from "@angular/platform-browser";

// Import environment config file.
import { environment } from "src/environments/environment";

@Component({
  selector: "app-news",
  templateUrl: "./news-detail.component.html",
  styleUrls: ["./news-detail.component.sass"],
})
export class NewsDetailComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  bucketURL: string = environment.config.AWSBUCKETURL;
  
  UserToken: string;
  userData: any;
  limit: number = 9;
  cond: any;
  totalItems: number = 0;
  currentPage: number = 0;
  getParams: any;
  typeQueryString: any;
  sorFilter: number;
  NewsNotFound: boolean = false;
  CategoriesBreadcumbs: any;
  recentnewsList: Array<any>;
  newscategoryList: Array<any>;
  newstagsList: Array<any>;
  Keyword: any;
  news_slug: any;
  newsdetail: any;
  post_categories: Array<any>;
  VideoURL: any;
  siteSettings: any;
  NewsComments: any;
  ogurl:any;

  constructor(
    private NewsService: NewsService,
    private UserService: UserService,
    private HomeService: HomeService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastr: ToastrService,
    private metaTagService: Meta,
    private titleService: Title,
    private sanitizer: DomSanitizer
  ) {
    // Set translate language
    translate.setDefaultLang("en");
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.news_slug = params.get("slug");
      // Calling get product details method
      this.get_news_details(this.news_slug);
    });

    // Calling site settings
    this.getSettings();

    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    // check if accessing from super admin
    console.log(this.route.snapshot.queryParamMap.get("access"));
    if (this.route.snapshot.queryParamMap.get("access")) {
    } else {
      if (!this.userData) {
        //this.changeRouter('login');
      }
    }
  }

  // Get news detail
  get_news_details(event?: any, limitChanged?: any) {
    // set status
    this.NewsNotFound = false;
    // Calling service

    this.cond = {
      cid: this.CID,
      news_slug: this.news_slug,
    };

    this.post_categories = [];
    // get news details
    this.NewsService.getNewsDetails(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.newsdetail = res.data.length ? res.data[0] : [];
          this.post_categories = res.post_categories.length
            ? res.post_categories
            : [];
          this.recentnewsList = res.recent_posts.length ? res.recent_posts : [];
          this.newscategoryList = res.categories.length ? res.categories : [];
          this.newstagsList = res.tags.length ? res.tags : [];

          let vurl =
            "https://www.youtube.com/embed/" +
            this.newsdetail.video_id +
            "?modestbranding=1&rel=0&showinfo=0";
          this.VideoURL = this.sanitizer.bypassSecurityTrustResourceUrl(vurl);

          if (this.newsdetail.ID) {
            //fetch forum post comments
            this.getNewsComments(this.newsdetail.ID);
          }

          if (res.data.length == 0) {
            this.NewsNotFound = true;
          }

          // set meta tags values
          let title = this.newsdetail.title;
          let Description = this.newsdetail.short_description;
          let keywords = this.newsdetail.short_description;
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
          let ogurl = location.origin + "/blog/post/" + this.newsdetail.slug;
          this.ogurl = ogurl;
          let ogimage =
            this.newsdetail && this.newsdetail.image
              ? this.PORTAL_URL +
                "files/blog/" +
                this.newsdetail.CID +
                "/medium_2x_" +
                this.newsdetail.image
              : location.origin +
                "/assets/Facebook-Auto-populated-Image-1200x630.jpg";

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
            content: ogimage,
            itemprop: "image",
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

          window["__sharethis__"].initialize();
          window["__sharethis__"].load("inline-share-buttons", {
            url: location.origin + "/blog/post/" + this.newsdetail.slug,
          });
        }
      },
      (err) => {
        this.NewsNotFound = true;
      }
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  SearchBlogValue(value): void {
    this.Keyword = value;
  }

  SearchByKeyword() {
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    if (this.getParams && this.getParams.category && this.Keyword) {
      //this.changeRouter('blog?category='+this.getParams.category+'&keyword='+this.Keyword);
      this.changeRouter("blog?keyword=" + this.Keyword);
    } else {
      if (this.Keyword) {
        this.changeRouter("blog?keyword=" + this.Keyword);
      }
    }
  }

  SearchByKeywordEnter(event) {
    if (event.keyCode == 13) {
      this.SearchByKeyword();
    }
  }

  // Fetch menus method
  getSettings(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getSettings(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.siteSettings = res.data[0];
        } else {
          this.siteSettings = "";
        }
      },
      (err) => {}
    );
  }

  // Get News Comments
  getNewsComments(NewsID) {
    if (NewsID) {
      let cond: object = {
        CID: this.CID,
        NewsID: NewsID,
        CustomerID: this.userData && this.userData.id ? this.userData.id : "",
      };
      this.NewsComments = [];
      // Calling service
      this.NewsService.getNewsComments(cond).subscribe(
        (res) => {
          if (res && res.data) {
            this.NewsComments = res.data;
          }
        },
        (err) => {
          if (err.error.error) {
            this.toastr.error(err.error.error);
          }
        }
      );
    }
  }
}
