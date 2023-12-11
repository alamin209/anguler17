import { Component, OnInit,Input,Output } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { ResourcesService } from "../../services/resources/resources.service";
import { UserService } from "../../services/auth/user.service";
import { HomeService } from "../../services/home/home.service";
import { ToastrService } from "ngx-toastr";
import { Title, Meta } from "@angular/platform-browser";

// Import environment config file.
import { environment } from "src/environments/environment";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.sass"],
})

export class ContentComponent implements OnInit {

  @Input() newsdetail: any;
  @Input() post_categories: any;
  @Input() VideoURL: any;

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  bucketURL: string = environment.config.AWSBUCKETURL;

  UserToken: string;
  userData: any;
  accountData: any;
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
  product_slug: any;
  NewsComments: any;
  ogurl: any;

  constructor(
    private ResourcesService: ResourcesService,
    private UserService: UserService,
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
    
  }

}
