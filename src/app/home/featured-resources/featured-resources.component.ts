import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { StoreService } from "../../services/store/store.service";
import { ResourcesService } from "../../services/resources/resources.service";
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
  selector: "app-featured-resources",
  templateUrl: "./featured-resources.component.html",
  styleUrls: ["./featured-resources.component.sass"],
})
export class FeaturedResourcesComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  AllResources: Array<any>;
  newUUid: string;
  UserToken: string;
  userData: any;
  featuredSliderOptions: any;
  cond: any;

  constructor(
    private StoreService: StoreService,
    private ResourcesService: ResourcesService,
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

    this.AllResources = [];
    this.getResources();
  }

  getResources() {
    this.cond = {
      cid: this.CID,
      userId: this.userData && this.userData.id ? this.userData.id : "",
      limit: 3,
      currentPage: 0,
      page: 1,
    };

    this.ResourcesService.getAllResources(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.AllResources = res.data.length ? res.data : [];
        } else {
          this.AllResources = [];
        }
      },
      (err) => {
        this.AllResources = [];
      }
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
}
