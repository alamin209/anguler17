import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { StoreService } from "../../../services/store/store.service";
import { SliderService } from "../../../services/slider/slider.service";
import { CategoryService } from "../../../services/category/category.service";

// Import environment config file.
import { environment } from "../../../../environments/environment";

@Component({
  selector: "seller-banner",
  templateUrl: "./seller-banner.component.html",
  styleUrls: ["./seller-banner.component.sass"],
})
export class SellerBannerComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  productsList: Array<any>;
  newUUid: string;
  sliderData: any;
  categoriesData: Array<[]>;
  sliderImage: string;
  sliderTitle: string;
  findSelectedCategories: any;
  categorySlug: string;
  getParams: any;
  categoryList: any;
  categoryActiveSelected: any;
  seller_slug:any;
  ProfilePicURL: any;
  BannerURL: any;
  @Input() categorySelected: any;

  constructor(
    private StoreService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private SliderService: SliderService,
    private CategoryService: CategoryService
  ) {
    // Set translate language
    translate.setDefaultLang("en");
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
    this.sliderTitle = "Shop";
  }

  ngOnInit() {

    this.BannerURL = './assets/images/seller/Vendor-Banner.jpg';
    this.ProfilePicURL = '';
    this.route.paramMap.subscribe(params => {
      this.seller_slug = params.get("sellername");
      // console.log(this.seller_slug);
      this.getSellerInfo(this.seller_slug);
    });
  }

  getSellerInfo(slug): void {
    //let userData = JSON.parse(localStorage.getItem('user'));
    this.StoreService.getSellerInfo({ sellerslug: slug }).subscribe(res1 => {
      if (res1 && res1.data) {
        this.sliderData = res1.data;
        
        if (this.sliderData && this.sliderData.profile_banner) {
          this.BannerURL
= this.AWSBUCKETURL+"files/avatar/"+this.sliderData.CID+"/"+this.sliderData.profile_banner;
        }

        if (this.sliderData && this.sliderData.profile_picture) {
          this.ProfilePicURL
= this.AWSBUCKETURL+"files/avatar/"+this.sliderData.CID+"/"+this.sliderData.profile_picture;
        }

      }
    }, (error) => { });
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  

}
