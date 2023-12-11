import { Component, TemplateRef, OnInit, HostListener } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import * as _ from "lodash";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { TranslateService } from "@ngx-translate/core";
import { Globals } from "../../common/globals";

// Declear jquery
declare var jQuery: any;

// import service
import { UserService } from "../../services/auth/user.service";
import { ForumService } from "../../services/forum/forum.service";
import { VideoService } from "../../services/video/video.service";
import { ResourcesService } from "../../services/resources/resources.service";

// Import environment config file.
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.sass"],
})
export class ProfileComponent implements OnInit {
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  IS_STORE: boolean = environment.config.IS_STORE;
  FINANCING: boolean = environment.config.FINANCING;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean =
    environment.config.GOOGLE_PLACES_SEARCH_API;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  ASK_ADDRESS: boolean = environment.config.ASK_ADDRESS;
  UserToken: string;
  userData: any;
  addressList: any;
  currentUser: any;
  user_categories: any;
  user_pinned_items: any;
  user_pinned_posts: any;
  PinnedPost: any;
  PinnedPosts: any;
  DefaultPaymentOption: any;
  ForumNotFound: boolean = false;
  VideosNotFound: boolean = false;
  AllFeedsLoaded: boolean = false;
  AllFeedsLoading: boolean = false;
  limit: number = 20;
  cond: any;
  totalItems: number = 0;
  currentPage: number = 0;
  page: number = 1;
  forumList: Array<any>;
  videoList: Array<any>;
  PinnedPostOptions: any = {};
  masonryOptions: any = {};
  pcategories: any;
  vcategories: any;
  final_ucats: any;
  usercats_arr: any;
  slideConfig: any;
  slides: any;
  modalRef: BsModalRef;
  classPFlag: boolean;
  private wasInside = false;
  setTab: string;
  ProductTypes:Array<any>;
  FilterCategory:any;
  FilterType:any;
  FilterKeyword:any;
  

  constructor(
    private router: Router,
    private UserService: UserService,
    private ForumService: ForumService,
    private VideoService: VideoService,
    private ResourcesService: ResourcesService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private globals: Globals,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    // brodcast data for login user
    this.userData = "";

    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });

    //this.get_tv_categories();
    //this.get_product_categories();

    //this.getUserData();

    // calling multiple method
    forkJoin([this.getUserPinnedPosts(), this.get_tv_categories(),this.getCMProductTypes()]);

    if (this.IS_STORE) {
      //this.getPaymentOption();
    }

    // set product detail tabs
    this.setTab = "Grid";

    // Copy objects
    this.PinnedPostOptions = Object.assign({}, this.globals.PinnedPostOptions);

    this.slideConfig = {
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 541,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 540,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    };
    /*
    jQuery("#CategoryFilter").select2({
      tags: true,
      tokenSeparators: [",", " "],
      placeholder: "Select Categories",
      maximumSelectionLength:3
    });
    */
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
      };
      this.UserService.getUserData(dataObj).subscribe(
        (res) => {
          if (res && res.data) {
            this.currentUser = res.data;
            this.user_categories = res.data.categories;
            //this.user_pinned_items = res.user_pinned_items;
            this.UserService.setAccountDataList(res);

            this.adjust_categories();
          } else {
            this.currentUser = [];
          }
        },
        (error) => {
          this.currentUser = [];
        }
      );
    }
  }

  FilterByCategory(category:any){
    console.log(category);
    this.FilterCategory = category;
    this.get_user_videos();
    
  }

  FilterByType(type:any){
    this.FilterType = type;
    this.get_user_videos();
    
  }
  
  SaveKeyword(keyword:any){
    this.FilterKeyword = keyword;
  }
  

  
  // get Products categories list from db
  getCMProductTypes() {
    let cond = {
      cid: this.CID,
      userId:this.userData.id
    };
    this.ResourcesService.getCMProductTypes(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.ProductTypes = res.data;
          
        }
      },
      (err) => {}
    );
  }

  // Manage class flag true/false;
  togglePMenu() {
    if (!this.classPFlag) {
      this.classPFlag = true;
      this.wasInside = true;
    }
  }

  // Manage host listener
  @HostListener("document:click", ["$event"])
  clickout() {
    if (!this.wasInside) {
      this.classPFlag = false;
    }
    this.wasInside = false;
  }

  // remove address
  removeAddress(id: number): void {
    if (id) {
      let dataObj = {
        cid: this.CID,
        id: id,
      };
      this.UserService.removeAddress(dataObj).subscribe(
        (res) => {
          if (res && res.data) {
            // calling multiple method
            forkJoin([this.getUserData()]);
            // show message
            this.translate
              .get("ADDRESS_REMOVED_SUCCESSFULLY")
              .subscribe((res: string) => {
                this.toastr.success(res);
              });
          }
        },
        (error) => {}
      );
    }
  }

  // Get store list
  get_user_forum_list(event?: any, limitChanged?: any) {
    // set status
    this.ForumNotFound = false;

    // Calling service

    this.cond = {
      cid: this.CID,
      userId: this.userData.id,
    };

    if (limitChanged) {
      this.totalItems = 0;
      this.currentPage = 0;
    }
    if (this.limit != 1000) {
      this.cond.limit = this.limit;
    }
    if (event && event.page) {
      this.cond.page = event.page;
    } else {
      this.cond.page = 1;
    }

    if (this.user_categories && this.user_categories.length) {
      let ucats = [];
      _.map(this.user_categories, function (v) {
        ucats.push(v.CategoryID);
      });
      this.cond.user_categories = ucats;
    }

    // get forum lists
    this.forumList = [];
    this.ForumService.getuserForumList(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.forumList = res.data.length ? res.data : [];

          if (res.total == 0) {
            this.ForumNotFound = true;
          }
        }
      },
      (err) => {
        this.ForumNotFound = true;
      }
    );
  }

  // Get store list
  get_user_videos(page?: any, limitChanged?: any, LoadMore?: any) {
    // set status
    this.VideosNotFound = false;

    // Calling service

    this.cond = {
      cid: this.CID,
      userId: this.userData.id,
    };

    if (this.FilterType) {
      this.cond.ProductTypeID = this.FilterType;
    }

    if (this.FilterCategory) {
      this.cond.CategoryID = this.FilterCategory;
    }
    
    if (this.FilterKeyword) {
      this.cond.keyword = this.FilterKeyword;
    }

    if (limitChanged) {
      this.totalItems = 0;
      this.currentPage = 0;
    }
    if (this.limit != 1000) {
      this.cond.limit = this.limit;
    }
    if (page) {
      this.cond.page = page;
    } else {
      this.cond.page = 1;
    }

    this.AllFeedsLoading = true;

    if (this.user_categories && this.user_categories.length) {
      let allucats = [];
      let vcats = [];
      _.map(this.user_categories, function (v) {
        allucats.push({
          CategoryID: v.CategoryID,
          CategoryTable: v.CategoryTable,
        });
        if (v.CategoryTable == "tbl_missiotv_categories") {
          vcats.push(v.CategoryID);
        }
      });
      this.cond.allucats = allucats;
      this.cond.user_pcats = this.final_ucats;
      this.cond.user_vcats = vcats;
    }

    // get forum lists
    if (!LoadMore) {
      this.videoList = [];
    }
    this.VideoService.getUserBlogsVideos(this.cond).subscribe(
      (res) => {
        this.AllFeedsLoading = false;
        if (res && res.data && res.data.length) {
          //this.videoList = (res.data.length) ? res.data : [];
          //let videoList = (res.data.length) ? res.data : [];
          let user_pinned_posts = this.user_pinned_posts;
          let videoList = this.videoList;
          if (res.data && res.data.length) {
            _.map(res.data, function (v) {
              videoList.push(v);
            });
          }

          _.map(this.videoList, function (v) {
            let URLImage = false;
            var imgname = v.image;
            URLImage = false;
            if (imgname.indexOf("http") != -1) {
              URLImage = true;
            }
            v.URLImage = URLImage;

            let Pinned = false;
            _.map(user_pinned_posts, function (v2) {
              if (v.ID == v2.PostID) {
                Pinned = true;
              }
            });
            v.Pinned = Pinned;
          });
          this.videoList = videoList;
          this.totalItems = res.total;
          if (res.total == 0) {
            this.VideosNotFound = true;
          }

          if (this.limit > this.videoList.length) {
            this.AllFeedsLoaded = true;
          }
        } else {
          if (!LoadMore) {
            this.VideosNotFound = true;
          } else {
            this.AllFeedsLoaded = true;
          }
        }
      },
      (err) => {
        this.VideosNotFound = true;
      }
    );
  }

  // get default payment option details
  getPaymentOption(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
      };
      this.UserService.getDefaultPaymentOptionDetails(dataObj).subscribe(
        (res) => {
          if (res && res.data && res.data.length) {
            this.DefaultPaymentOption = res.data[0];
          } else {
            this.DefaultPaymentOption = [];
          }
        },
        (error) => {
          this.DefaultPaymentOption = [];
        }
      );
    }
  }

  // get user pinned posts
  getUserPinnedPosts(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: this.userData.id,
      };
      this.UserService.getUserPinnedPosts(dataObj).subscribe(
        (res) => {
          if (res && res.data && res.data.length) {
            this.user_pinned_posts = res.data;
            this.user_pinned_posts = res.data;
            _.map(this.user_pinned_posts, function (v) {
              v.Pinned = true;
              let URLImage = false;
              var imgname = v.image;
              URLImage = false;
              if (imgname.indexOf("http") != -1) {
                URLImage = true;
              }
              v.URLImage = URLImage;
              return v;
            });
            console.log(this.user_pinned_posts);

            let user_pinned_posts = this.user_pinned_posts;

            _.map(this.videoList, function (v) {
              let Pinned = false;
              _.map(user_pinned_posts, function (v2) {
                if (v.ID == v2.PostID) {
                  Pinned = true;
                }
              });
              v.Pinned = Pinned;
            });
          } else {
            this.user_pinned_posts = [];
          }
        },
        (error) => {
          this.user_pinned_posts = [];
        }
      );
    }
  }

  // Pin Post
  PinPost(ID: Number, Pinned: any, PostType: any) {
    // Set sesson id;
    if (!this.userData) {
      this.translate.get("LOGIN_FIRST").subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=member/profile";
      this.changeRouter(slug);
    }
    this.cond = {
      CID: this.CID,
      CustomerID: this.userData && this.userData.id ? this.userData.id : "",
      PostID: ID,
      Pinned: Pinned,
      PostType: PostType,
    };
    this.UserService.PinPost(this.cond).subscribe(
      (res) => {
        // Check data
        if (res.Pinned) {
          console.log(this.user_pinned_posts);

          this.user_pinned_posts.push(res.data);
          console.log(this.user_pinned_posts);
        } else {
          let _user_pinned_posts = [];
          _.map(this.user_pinned_posts, function (v) {
            if (v.PostID != ID) {
              _user_pinned_posts.push(v);
            }
          });
          this.user_pinned_posts = _user_pinned_posts;
        }
        _.map(this.videoList, function (v) {
          if (v.ID == ID) {
            if (res.Pinned) {
              v.Pinned = true;
            } else {
              v.Pinned = false;
            }
          }
        });
      },
      (err) => {
        if (err.error.error) {
          this.toastr.error(err.error.error);
        }
      }
    );
  }

  onLoadMore() {
    if (!this.AllFeedsLoaded && !this.AllFeedsLoading) {
      console.log("load more!!");
      this.page = this.page + 1;
      this.get_user_videos(this.page, this.limit, true);
    }
  }

  adjust_categories() {
    this.final_ucats = [];
    let user_categories = this.user_categories;
    if (this.user_categories && this.user_categories.length) {
      let _ucats = [];
      _.map(this.user_categories, function (v) {
        if (v.CategoryTable == "tbl_product_categories") {
          _ucats.push(v.CategoryID);
        }
      });

      let _ucats_arr = [];
      _.map(this.pcategories, function (v) {
        if (_ucats.includes(v.ID)) {
          v.selected = true;
          _ucats_arr.push(v);
        }
        _.map(v.Subcategories, function (v) {
          if (_ucats.includes(v.ID)) {
            v.selected = true;
            _ucats_arr.push(v);
          }
          _.map(v.Subcategories, function (v) {
            if (_ucats.includes(v.ID)) {
              v.selected = true;
              _ucats_arr.push(v);
            }
            _.map(v.Subcategories, function (v) {
              if (_ucats.includes(v.ID)) {
                v.selected = true;
                _ucats_arr.push(v);
              }
              _.map(v.Subcategories, function (v) {
                if (_ucats.includes(v.ID)) {
                  v.selected = true;
                  _ucats_arr.push(v);
                }
              });
            });
          });
        });
      });

      if (_ucats_arr && _ucats_arr.length) {
        _.map(_ucats_arr, function (v) {
          let subcateselected = false;
          if (v.Subcategories && v.Subcategories.length) {
            _.map(v.Subcategories, function (v) {
              if (v.selected) {
                subcateselected = true;
              }
              if (v.Subcategories && v.Subcategories.length) {
                _.map(v.Subcategories, function (v) {
                  if (v.selected) {
                    subcateselected = true;
                  }
                  if (v.Subcategories && v.Subcategories.length) {
                    _.map(v.Subcategories, function (v) {
                      if (v.selected) {
                        subcateselected = true;
                      }
                      if (v.Subcategories && v.Subcategories.length) {
                        _.map(v.Subcategories, function (v) {
                          if (v.selected) {
                            subcateselected = true;
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
          v.subcateselected = subcateselected;
        });

        if (_ucats_arr && _ucats_arr.length) {
          _.map(_ucats_arr, function (v) {
            if (!v.subcateselected) {
              if (v.Subcategories && v.Subcategories.length) {
                _.map(v.Subcategories, function (v) {
                  _ucats.push(v.ID);
                  if (v.Subcategories && v.Subcategories.length) {
                    _.map(v.Subcategories, function (v) {
                      _ucats.push(v.ID);
                      if (v.Subcategories && v.Subcategories.length) {
                        _.map(v.Subcategories, function (v) {
                          _ucats.push(v.ID);
                          if (v.Subcategories && v.Subcategories.length) {
                            _.map(v.Subcategories, function (v) {
                              _ucats.push(v.ID);
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });
        }

        this.final_ucats = _ucats;
        
        
      }

      this.usercats_arr = _ucats_arr;
      console.log('_ucats_arr');
      console.log(_ucats_arr);
      
    }
    this.get_user_videos();

    let pcategories = this.pcategories;
    let vcategories = this.vcategories;
  }

  // get Products categories list from db
  get_product_categories() {
    let cond = {
      cid: this.CID,
    };
    this.ResourcesService.getResourcesCategories(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.pcategories = res.data;
          this.getUserData();
        }
      },
      (err) => {}
    );
  }

  // get TV categories list from db
  get_tv_categories() {
    let cond = {
      cid: this.CID,
    };
    this.VideoService.getVideoCategories(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          this.vcategories = res.data;
          this.get_product_categories();
        }
      },
      (err) => {}
    );
  }

  // for model
  openModalPopup(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
