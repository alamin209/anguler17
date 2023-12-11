import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { StoreService } from "../../services/store/store.service";
import { NewsService } from "../../services/news/news.service";
import * as uuid from "uuid";
import { UserService } from "../../services/auth/user.service";
// Handle the global property
import { Globals } from "../../common/globals";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

// Import environment config file.
import { environment } from "../../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-latest-blog-posts",
  templateUrl: "./latest-blog-posts.component.html",
  styleUrls: ["./latest-blog-posts.component.sass"],
})
export class LatestBlogPostsComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  latestNews: Array<any>;
  newUUid: string;
  UserToken: string;
  userData: any;
  featuredSliderOptions: any;

  constructor(
    private StoreService: StoreService,
    private NewsService:NewsService,
    private router: Router,
    private UserService: UserService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private globals: Globals
  ) {
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
  }

  ngOnInit() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    this.latestNews = [];
    this.getLatestNews();

  }

  // pull latest news
  getLatestNews() {
    let cond = {
      cid: this.CID
    }
    // get news lists
    this.NewsService.getLatestNews(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.latestNews = res.data;
      } else {
        this.latestNews = [];
      }
    }, (err) => {
      this.latestNews = [];
    })
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  
}
