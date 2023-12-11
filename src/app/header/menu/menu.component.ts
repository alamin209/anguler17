import {
  Component,
  Input,
  Output,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  EventEmitter,
} from "@angular/core";
import { forkJoin, from } from "rxjs";
import { Router, ActivatedRoute, NavigationStart } from "@angular/router";
import { HomeService } from "../../services/home/home.service";
import { CategoryService } from "../../services/category/category.service";
import { UserService } from "../../services/auth/user.service";
import * as _ from "lodash";
import * as qs from "qs";
// Import environment config file.
import { environment } from "../../../environments/environment";
// added animations
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from "@angular/animations";
// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.sass"],
  animations: [
    trigger("fadeInOut", [
      state("state1", style({})),
      state("state2", style({})),
      transition(
        "state1=>state2",
        animate("0.5s ease-in", style({ transform: "translateX(0px)" }))
      ),
      transition(
        "state2=>state1",
        animate("0.2s ease-out", style({ transform: "translateX(100%)" }))
      ),
    ]),
  ],
})
export class MenuComponent implements OnInit {
  @Input() productCount: any;
  @Input() subTotal: any;
  @Input() menuList: any;
  @Output() messageEvent = new EventEmitter<boolean>();
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  IS_STORE: boolean = environment.config.IS_STORE;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  membershipMenuList: any;
  categoryList: any;
  stickyNavMenu: boolean;
  classPFlag: boolean;
  private wasInside = false;
  rMenu: boolean;
  menuTab: string;
  UserName: string;
  UserID: string;
  UserToken: string;
  userData: any;
  SidebarCartOpen: boolean = false;
  aAttachmentList: any;
  aAClass: any;
  manageAAttachment: any;
  stAAKeys: any;
  activeMenu: any;
  Keyword: any;
  OpenSearch: boolean = false;
  siteSettings: any;
  ComapnyLogo: any;
  ComapnyRetinaLogo: any;

  // Getting stickly menu height

  @ViewChild("pageMenu") menuElement: ElementRef;
  sticky: boolean = false;
  elementPosition: any;

  constructor(
    private HomeService: HomeService,
    private CategoryService: CategoryService,
    private router: Router,
    private UserService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.ComapnyLogo = "../assets/images/logo.png";
    this.ComapnyRetinaLogo = "../assets/images/logo.png";

    // for get site settings from service
    this.HomeService.castSiteSettings.subscribe((data) => {
      if (data) {
        this.siteSettings = data;
        this.ComapnyLogo =
          this.siteSettings &&
          this.siteSettings.Logo &&
          this.siteSettings.Logo != ""
            ? this.PORTAL_URL +
              "files/logos/" +
              this.siteSettings.CID +
              "/" +
              this.siteSettings.Logo
            : "../assets/images/logo.png";

        this.ComapnyRetinaLogo =
          this.siteSettings &&
          this.siteSettings.RetinaLogo &&
          this.siteSettings.RetinaLogo != ""
            ? this.PORTAL_URL +
              "files/logos/" +
              this.siteSettings.CID +
              "/mobile/" +
              this.siteSettings.RetinaLogo
            : "../assets/images/logo.png";
      }
    });

    // brodcast data for login user
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    // set menu tab value
    this.menuTab = "Menu";

    // Calling menu and categoty method
    forkJoin([this.getMembershipMenu()]);

    if (this.IS_STORE) {
      this.getCategoryList();
      //this.getAAList();
    }
    // This service subscribe category list
    this.CategoryService.castCategory.subscribe(
      (categoryList) => (this.categoryList = categoryList)
    );

    // This service subscribe category list
    this.CategoryService.castaAttachmentList.subscribe((aAttachmentList) => {
      if (aAttachmentList && aAttachmentList.length) {
        this.aAttachmentList = aAttachmentList;
        // for manage attachment & accessories layout
        if (this.aAttachmentList && this.aAttachmentList.length <= 6) {
          this.aAClass = "AA--View--01";
        } else if (
          this.aAttachmentList &&
          this.aAttachmentList.length >= 7 &&
          this.aAttachmentList.length <= 12
        ) {
          this.aAClass = "AA--View--02";
        } else if (
          this.aAttachmentList &&
          this.aAttachmentList.length >= 13 &&
          this.aAttachmentList.length <= 18
        ) {
          this.aAClass = "AA--View--03";
        } else if (
          this.aAttachmentList &&
          this.aAttachmentList.length >= 19 &&
          this.aAttachmentList.length <= 24
        ) {
          this.aAClass = " AA--View--04";
        } else {
          this.aAClass = "AA--View--01";
        }
        // mange attachment types
        let k = 0;
        // adding keys according to conditions
        let aAData = _.map(this.aAttachmentList, function (v, ind: any) {
          if (ind % 6 == 0) {
            k++;
          }
          v.item = k;
          return v;
        });
        // group by item
        this.manageAAttachment = _.mapValues(
          _.groupBy(aAData, "item"),
          (ilist) => ilist.map((data) => _.omit(data, "item"))
        );
        aAData = [];
        // making two dimensional array
        _.map(this.manageAAttachment, function (v, index) {
          aAData.push({ id: index, item: v });
        });
        this.manageAAttachment = aAData;
      }
    });

    // for active url
    this.router.events.subscribe((value) => {
      if (value instanceof NavigationStart) {
        if (value && value.url) {
          let getParams = value.url.split("/");
          //console.log(getParams);
          this.activeMenu = getParams[1];
          if (this.activeMenu == "") {
            this.activeMenu = "/";
          }
        }
      }
    });
  }

  OpenSearchBox(): void {
    if (this.OpenSearch) {
      this.OpenSearch = false;
    } else {
      this.OpenSearch = true;
    }
  }

  setSearchValue(value) {
    if (value != "") {
      this.Keyword = value;
    }
  }

  SearchProducts() {
    let redirectURL = "shop";
    let urlQueryString: any = {};

    if (this.Keyword != "") {
      urlQueryString = { q: this.Keyword };
    }
    // creating URL
    if (urlQueryString) {
      redirectURL += "?" + qs.stringify(urlQueryString);
    }

    this.rMenu = false;
    //this.changeRouter(redirectURL);
    window.location.href = location.origin + "/" + redirectURL;
  }

  current = "state1";
  getValue(item): any {
    return this.manageAAttachment[item];
  }

  changeState() {
    this.current = this.current === "state1" ? "state2" : "state1";
  }

  ngAfterViewInit() {
    this.elementPosition = this.menuElement.nativeElement.offsetTop;
  }

  // Mange Sticky menu show/hide
  @HostListener("window:scroll", ["$event"])
  stickyMenu() {
    const windowScroll = window.pageYOffset;
    if (windowScroll >= this.elementPosition) {
      this.stickyNavMenu = true;
    } else {
      this.stickyNavMenu = false;
      this.classPFlag = false;
    }
  }

  // Manage class flag true/false;
  togglePMenu(): void {
    if (!this.classPFlag) {
      this.classPFlag = true;
      this.wasInside = true;
    }
  }

  // Manage host listener
  @HostListener("document:click", ["$event"])
  clickout(): void {
    if (!this.wasInside) {
      this.classPFlag = false;
    }
    this.wasInside = false;
  }

  // Mobile responsive menu
  mobileRMenu(): void {
    if (!this.rMenu) {
      this.rMenu = true;
      this.stickyNavMenu = false;
      this.classPFlag = false;
      document.body.classList.add("noscroll");
    } else {
      this.rMenu = false;
      document.body.classList.remove("noscroll");
    }
  }

  CloseMobileMenu(): void {
    if (this.rMenu) {
      this.rMenu = false;
      document.body.classList.remove("noscroll");
    }
  }

  // sign out
  signOut(): void {
    this.UserService.signOut();
  }

  // for cart side bar
  cartSiderBarOpen(): void {
    this.messageEvent.emit(true);
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.activeMenu = slug;
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // Fetch menus method
  getMembershipMenu(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getMembershipMenu(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.membershipMenuList = res.data; // Set menu list
          let uData = this.userData;
          _.map(this.membershipMenuList, function (v, index) {
            v.ExternalLink = false;
            let menuurl = v.url;
            if (menuurl.includes("http")) {
              v.ExternalLink = true;
            }

            if (menuurl.includes("fundraise")) {
              if(uData.id){
                v.url = menuurl+'?atl='+uData.password+'-'+uData.id;
              }
            }
            return v;

          });
        }
      },
      (err) => {}
    );
  }

  //fetch categories method
  getCategoryList(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      parent_category_id: "",
      marketplace: '',
      fetch_from: 'shop',
    };
    this.CategoryService.getCategories(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          // Set data for subscribe categorty list
          this.CategoryService.setCategoryList(res.data);
          jQuery(document).ready(function () {
            jQuery(".go-next").on("click", function (event) {
              event.preventDefault();
              jQuery(this).parent().next().addClass("move-out");
              return false;
            });

            jQuery(".js-goBack").on("click", function (event) {
              event.preventDefault();
              jQuery(this).parent().parent().removeClass("move-out");
              return false;
            });
          });
        }
      },
      (err) => {}
    );
  }

  // Print child down category
  childCList: any;
  storeCategory = {};
  childCategory(itme, parentList): void {
    // Check zero index ids
    if (itme && itme[0] && itme[0].ID) {
      this.childCList = itme;
      let id = itme[0].ID;
      // check id exists
      if (this.storeCategory[id]) {
        this.storeCategory[id] = parentList;
      } else {
        // If object keys zero then assign parent ids
        if (Object.keys(this.storeCategory).length == 0) {
          this.storeCategory["parent"] = id;
        }
        // Push new object of array
        this.storeCategory[id] = {};
        this.storeCategory[id] = parentList;
      }
    }
  }

  // Print child up category
  childCategoryUp(itme): void {
    // Check zero index ids
    if (itme && itme[0] && itme[0].ID) {
      // If parent and traget id matached then assign empty array
      if (this.storeCategory["parent"] == itme[0].ID) {
        this.childCList = [];
        this.storeCategory = {};
      } else {
        // Push parent array according to target index
        if (this.storeCategory[itme[0].ID]) {
          this.childCList = this.storeCategory[itme[0].ID];
        } else {
          this.childCList = [];
          this.storeCategory = {};
        }
      }
    }
  }

  // Print child down menu
  childMList: any;
  storeMenu = {};
  childMenu(itme, parentList): void {
    // Check zero index ids
    if (itme && itme[0] && itme[0].ID) {
      this.childMList = itme;
      let id = itme[0].ID;
      // check id exists
      if (this.storeMenu[id]) {
        this.storeMenu[id] = parentList;
      } else {
        // If object keys zero then assign parent ids
        if (Object.keys(this.storeMenu).length == 0) {
          this.storeMenu["parent"] = id;
        }
        // Push new object of array
        this.storeMenu[id] = {};
        this.storeMenu[id] = parentList;
      }
    }
  }

  // Print child up menu
  childMenuUp(itme): void {
    // Check zero index ids
    if (itme && itme[0] && itme[0].ID) {
      // If parent and traget id matached then assign empty array
      if (this.storeMenu["parent"] == itme[0].ID) {
        this.childMList = [];
        this.storeMenu = {};
      } else {
        // Push parent array according to target index
        if (this.storeMenu[itme[0].ID]) {
          this.childMList = this.storeMenu[itme[0].ID];
        } else {
          this.childMList = [];
          this.storeMenu = {};
        }
      }
    }
  }

  //get accessory attachment types
  getAAList(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
    };
    this.CategoryService.getAATypes(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          // Set data for subscribe categorty list
          this.CategoryService.setAATypes(res.data);
        }
      },
      (err) => {}
    );
  }
}
