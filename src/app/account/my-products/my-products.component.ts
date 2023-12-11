import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";

import { VideoService } from '../../services/video/video.service';
import { ResourcesService } from "../../services/resources/resources.service";
import { StoreService } from "../../services/store/store.service";
import { UserService } from "../../services/auth/user.service";
import { ToastrService } from "ngx-toastr";

import { environment } from "../../../environments/environment";
// Declear jquery
declare var jQuery: any;

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.sass']
})
export class MyProductsComponent implements OnInit {
  
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;

  productsList: Array<any>;
  newUUid: string;
  UserToken: string;
  userData: any;
  currentUser: any;
  userPackage: any;
  limit: number = 20;
  cond: any;
  totalItems: number = 0;
  currentPage: number = 0;
  page: number = 1;
  ProductPerRow: any = 4;
  qQueryString: any;
  priceQueryString: any;
  typeQueryString: any;
  manufacturerQueryString: any;
  getParams: any;
  sorFilter: number;
  productNFound: boolean = false;
  sellerID: string;
  sameUserView: string;
  AllProductsLoaded: boolean = false;
  LoadingMore: boolean = false;
  ProductType: any;
  totalPros: number = 0;
  totalPhyPros: number = 0;
  totalDigPros: number = 0;
  totalResources: number = 0;
  totalVideos: number = 0;
  ResourcesNotFound : boolean = false;
  AllResourcesNotFound: boolean = false;
  AllResourcesLoaded: boolean = false;
  ResourcesCategoriesNotFound: boolean = false;
  AllResources: any = [];
  totalItems2: number = 0;
  currentPage2: number = 0;
  page2: number = 1;
  NoVideosFound: boolean = false;
  AllVideosLoaded: boolean = false;
  AllVideos: any = [];
  totalItems3: number = 0;
  currentPage3: number = 0;
  page3: number = 1;
  Keyword: any;

  constructor(
    private VideoService: VideoService,
    private ResourcesService: ResourcesService,
    private StoreService: StoreService,
    private UserService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {
    // Set translate language
    translate.setDefaultLang('en');

    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
   }

  ngOnInit() {

    this.Keyword = '';

    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });
    if(this.userData != null){
      this.sellerID = this.userData.id;
    } else {
      this.sellerID = '1000000';
    }

    this.LoadingMore = false;

    this.ProductType = 'Physical';
    

    if(this.route.snapshot.queryParamMap.get("q")){
      this.Keyword = this.route.snapshot.queryParamMap.get("q");
    }
    
    this.getUserData(); 

    this.get_product_types_count(); 

    

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
          this.userPackage = res.user_package;
          
          this.UserService.setAccountDataList(res);
          
          if(this.route.snapshot.queryParamMap.get("type")){

            this.ProductType = this.route.snapshot.queryParamMap.get("type");
            
            setTimeout(() => {
              jQuery("#" + this.ProductType).prop('checked', true);
            },300);
            //jQuery("#"+this.ProductType).click();
            
            if(this.ProductType == 'Videos'){
              this.getVideos();
            }else if(this.ProductType == 'Resources'){
              this.get_all_resources();
            }else{
              this.get_products_list();
            }

          }else{

            if(this.userPackage && this.userPackage.SellerPackage == 'Yes'){
              setTimeout(() => {  
                jQuery("#" + this.ProductType).prop('checked', true);
              },300);
              this.get_products_list();
            }else{
              this.ProductType = 'Videos';
              jQuery("#Videos").prop('checked', true);
              this.getVideos();
            }
            
          }
          
        }
      }, (error) => {
      });
    }
  }

  setSearchKeyword(value) {
    if (value != "") {
      this.Keyword = value;
    }
  }

  SearchEnter(event) {
    if (event.keyCode == 13) {
      this.SearchByKeyword();
    }
  }

  SearchByKeyword(): void {

    if (this.Keyword) {
      //this.changeRouter("member/products?q=" + this.Keyword);
      this.changeRouter('member/products?type='+this.ProductType+'&q='+this.Keyword);
    } else {
      //this.changeRouter("member/products");
      this.changeRouter('member/products?type='+this.ProductType);
    }

    
    if(this.ProductType == 'Videos'){
      this.getVideos();
    }else if(this.ProductType == 'Resources'){
      this.get_all_resources();
    }else{
      this.get_products_list();
    }

  }

  //func set product type
  SetProductType(pType){

    this.Keyword = '';
    this.ProductType = pType;
    this.changeRouter('member/products?type='+this.ProductType);

    if(this.ProductType == 'Videos'){
      this.getVideos();
    }else if(this.ProductType == 'Resources'){
      this.get_all_resources();
    }else{
      this.get_products_list();
    }

  }

  // Get store list
  get_products_list(page?: any, limitChanged?: any, LoadMore?: any) {
    
    //console.log('get_products_list');

    if (this.LoadingMore == true) {
      return;
    }

    this.LoadingMore = true;
    // set status
    this.productNFound = false;

    this.cond = {
      cid: this.CID
    };
    this.cond.sellerID = this.sellerID;
    if(this.ProductType == 'Digital'){
      this.cond.ProductType = this.ProductType;
    }
    
    if (this.Keyword) {
      this.cond.q = this.Keyword;
    }

    // Calling service
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
    this.cond.marketplace = this.MARKETPLACE;
    // if price filter
    if (this.priceQueryString) {
      this.cond.price = this.priceQueryString;
    }
    // if type filter
    if (this.typeQueryString && this.typeQueryString.length) {
      this.cond.type = this.typeQueryString;
    }

    // if search by keyword
    if (this.qQueryString && this.qQueryString.length) {
      this.cond.q = this.qQueryString;
    }

    // check qeury manufacturer
    if (this.manufacturerQueryString && this.manufacturerQueryString.length) {
      // set type params
      this.cond.manufacturer = this.manufacturerQueryString;
    }
    // sorting filters ASC/DESC
    this.cond.sorting = this.sorFilter ? this.sorFilter : '';
    // get product list
    if (!LoadMore) {
      this.productsList = [];
    }
    this.productNFound = false;
    
    
    this.UserService.getUserProducts(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.totalItems = res.total;
          this.LoadingMore = false;

          let productsList = this.productsList;
          if (res.data && res.data.length) {
            _.map(res.data, function (v) {
              productsList.push(v);
            });
          }
          this.productsList = productsList;

          let urlImage = this.PORTAL_URL;
          let AWSBUCKETURL = this.AWSBUCKETURL;
          let companyCID = this.CID;
          this.productNFound = res.total ? false : true;
          if (this.productsList && this.productsList.length) {
            _.map(this.productsList, function (v) {
              if (v.Image_type == "image") {
                if (v.Image_Source == "url") {
                  v.imageUrl =
                    v && v.ImageLarge
                      ? v.ImageLarge
                      : "./assets/images/no-image.png";
                  v.mediumUrl =
                    v && v.ImageLarge
                      ? v.ImageLarge
                      : "./assets/images/no-image.png";
                  v.thumbimageUrl =
                    v && v.Image ? v.Image : "./assets/images/no-image.png";
                }else if (v.Image_Source == "s3") {
                  
                  v.imageUrl =
                    v && v.Image
                      ? AWSBUCKETURL +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.mediumUrl =
                    v && v.Image
                      ? AWSBUCKETURL +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/medium_" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.thumbimageUrl =
                    v && v.Image
                      ? AWSBUCKETURL +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/thumb_" +
                        v.Image
                      : "./assets/images/no-image.png";
                } else {
                  v.imageUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.mediumUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/medium_" +
                        v.Image
                      : "./assets/images/no-image.png";
                  v.thumbimageUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/thumb_" +
                        v.Image
                      : "./assets/images/no-image.png";
                }
              } else {
                if (v && v.Product_Video) {
                  let regExp =
                    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  let match = v.Product_Video.match(regExp);
                  if (match && match[2].length == 11) {
                    v.imageUrl =
                      "https://i3.ytimg.com/vi/" + match[2] + "/sddefault.jpg";
                  } else {
                    v.imageUrl =
                      v && v.Image
                        ? urlImage +
                          "files/store/products/" +
                          v.CID +
                          "/" +
                          v.ID +
                          "/thumb_" +
                          v.Image
                        : "./assets/images/no-image.png";
                  }
                } else {
                  v.imageUrl =
                    v && v.Image
                      ? urlImage +
                        "files/store/products/" +
                        v.CID +
                        "/" +
                        v.ID +
                        "/thumb_" +
                        v.Image
                      : "./assets/images/no-image.png";
                }
              }
              return v;
            });
          }
        } else {
          this.LoadingMore = false;
          this.productNFound = true;
          this.productsList = [];
          if (!LoadMore) {
            this.productNFound = true;
          } else {
            this.AllProductsLoaded = true;
          }
        }
      },
      (err) => {
        this.LoadingMore = false;
        this.productNFound = true;
      }
    );
  }

  onLoadMore() {
    if (!this.AllProductsLoaded && this.LoadingMore != true) {
      
      this.page = this.page + 1;
      this.get_products_list(this.page, this.limit, true);
    }
  }

  // Get store list
  get_product_types_count() {
    this.cond = {
      cid: this.CID
    };
    this.cond.sellerID = this.sellerID;
    this.UserService.getProducTypesCount(this.cond).subscribe(
      (res) => {
        if (res && res.data) {
          this.totalPros = res.PhysicalPros + res.DigitalPros;
          this.totalPhyPros = res.PhysicalPros;
          this.totalDigPros = res.DigitalPros;
          this.totalResources = res.Resources;
          this.totalVideos = res.Videos;

        }
      });
  }


  changeRouter(slug): void {
    this.router.navigateByUrl(slug);
  }

  editProduct(id){
    this.changeRouter("member/products/edit/"+id);
  }

  deleteProduct(id){
    if(confirm("Are you sure you want to delete this product")) {
      this.cond = {
        id: id,
        CID: this.CID
      };
      // delete product list
      this.StoreService.DeleteProductSeller(this.cond).subscribe(
        (res) => {
          if(!res.error){
            this.toastr.success('Product deleted successfully', "Success!");
            this.get_products_list();
            this.get_product_types_count(); 
          } else {
            this.toastr.error('Error in deleting product', "Error!");
          }
        },
        (err) => {
          this.toastr.error('Error in deleting product', "Error!");
        }
      );
    }
  }

  onLoadMore2() {
    console.log('AllResourcesLoaded: '+this.AllResourcesLoaded);
    if(!this.AllResourcesLoaded){
        this.page2 = this.page3+1;
        this.get_all_resources(this.page2,this.limit,true);
    }
  }
  
  
  get_all_resources(page?:any, limitChanged?:any,LoadMore?:any) {
      
    // set status 
    this.AllResourcesNotFound = false;
    
    // Calling service

    this.cond = {
      cid: this.CID,
      sellerID: this.sellerID
    }
    
    if(limitChanged){
      this.totalItems2=0;
      this.currentPage=0;
    }
    if(this.limit != 1000){
      this.cond.limit=this.limit;
    }
    if(page){
      this.cond.page=page;
    }else{
      this.cond.page = 1;
    }
    
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    
    if (this.Keyword) {
      this.cond.keyword = this.Keyword;
    }
    this.cond.TIP_CATEGORY = this.TIP_CATEGORY;
    
    // if (this.getParams && this.getParams.keyword) {
    //   this.cond.keyword = this.getParams.keyword;
    // }

    // get forum lists
    if(!LoadMore){
        this.AllResources = [];
    }
    this.ResourcesService.getAllResources(this.cond).subscribe(res => {
      if (res && res.data) {
        // console.log(res.data);
        //this.AllResources = (res.data.length) ? res.data : [];
        let AllResources = this.AllResources;
        if(res.data && res.data.length){
            _.map(res.data, function (v) {
                AllResources.push(v);
            });
        }
        this.AllResources = AllResources;
        this.totalItems = res.total;
        if (res.total == 0) {
          this.AllResourcesNotFound = true;
        }
      }else{
        if(!LoadMore){
            this.AllResourcesNotFound = true;
        }else{
            this.AllResourcesLoaded = true;
        }
      }  
    }, (err) => {
        this.AllResourcesNotFound = true;
    })
  }

  onLoadMore3() {
    
    
    console.log('AllVideosLoaded: '+this.AllVideosLoaded);
    
    if(!this.AllVideosLoaded){
    
        console.log('load more!!');
        this.page3 = this.page3+1;
        //this.getVideos(this.page3,this.limit,true);
    }
    
  }
  
  getVideos(page?:any, limitChanged?:any, LoadMore?:any){
  
    this.cond = { 
      sellerID: this.sellerID,
      status:2,
      cid: this.CID,
      page: this.page3,
      limit: this.limit,
    };
    
    if(limitChanged){
      this.totalItems3=0;
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

    if (this.Keyword) {
      this.cond.keyword = this.Keyword;
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


  deleteResource(id){
    if(confirm("Are you sure you want to delete this resource")) {
      this.cond = {
        id: id,
        CID: this.CID
      };
      // delete resource list
      this.ResourcesService.DeleteResourcePostMember(this.cond).subscribe(
        (res) => {
          if(!res.error){
            this.toastr.success('Resource deleted successfully', "Success!");
            this.get_all_resources();
            this.get_product_types_count(); 
          } else {
            this.toastr.error('Error in deleting resource', "Error!");
          }
        },
        (err) => {
          this.toastr.error('Error in deleting resource', "Error!");
        }
      );
    }
  }

  deleteVideo(id){
    if(confirm("Are you sure you want to delete this video")) {
      this.cond = {
        id: id,
        CID: this.CID
      };
      // delete resource list
      this.VideoService.DeleteVideoPostMember(this.cond).subscribe(
        (res) => {
          if(!res.error){
            this.toastr.success('Video deleted successfully', "Success!");
            this.getVideos();
          } else {
            this.toastr.error('Error in deleting video', "Error!");
          }
        },
        (err) => {
          this.toastr.error('Error in deleting video', "Error!");
        }
      );
    }
  }

}
