import { Component, OnInit, NgModule, Input, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { UserService } from "../../../services/auth/user.service";
import { ToastrService } from "ngx-toastr";

// Import environment config file.
import { environment } from "../../../../environments/environment";
import { CategoryService } from "../../../services/category/category.service";
import { StoreService } from "../../../services/store/store.service";

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-product_form",
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.sass","../../../../assets/css/memberpage.css"],
})

export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  resourcesList: Array<any>;
  newUUid: string;
  UserToken: string;
  productData: any;
  userData: any;
  cond: any;
  getParams: any;
  qQueryString: any;
  categorySlug: string;
  categoryList: any;
  catsList: any = [];
  packageTypeList: any = [];
  packageNumberItems: any = [];
  findSelectedCategories: any;
  localStorage: any;
  memberID: string;
  ImageData: any;
  imageFile: any;
  imageURL: any;
  PictureExist: any;
  editor: any;
  multiSelectTags: any;
  recId: any;
  removeImage: any;
  submitted = false;
  numberRegEx: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private StoreService: StoreService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    // Set translate language
    translate.setDefaultLang("en");
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
    this.editor = ClassicEditor;
  }

  ngOnInit() {
    this.productData = "";
    this.PictureExist = false;
    this.recId = this.route.snapshot.params.pId;
    if(this.recId > 0){
      this.load_resource_data();  
    }
    this.checkKeyParam();
    this.get_product_categories();
    //this.get_product_packagetypes();
    this.multiSelectTags = {
      primaryKey: "ID",
      labelKey: "Category_Name",
      enableCheckAll: false
    }
    for(var tmp = 1;tmp<=100;tmp++){
      this.packageNumberItems.push(tmp);
    }

    this.numberRegEx = /\-?\d*\.?\d{1,2}/;

    this.productForm = this.formBuilder.group({
      id: [""],
      title: ["", Validators.required],
      short_desc: ["", Validators.required],
      desc: [""],
      price: ["", [Validators.required, , Validators.pattern(this.numberRegEx)]],
      Categories: ["", Validators.required],
    });
  }

  load_resource_data(){
    let cond = {
      cid: this.CID,
      recId: this.recId
    };
    this.StoreService.getProductSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
          this.productForm.patchValue({
            title: res.data[0].Product_Name,
            short_desc: res.data[0].Product_Short_Description,
            desc: res.data[0].Product_Description,
            price: res.data[0].Product_Price,
            id: res.data[0].ID
          });

          var resCategory = res.data[0].resCategory;
          var catSelArr = [];
          if(resCategory){
            var resCatArr = resCategory.split(",");
            resCatArr.map(function(vl){
              var singleValArr = vl.split("<->");
              if(singleValArr.length > 0){
                let singlePush = new Array();
                singlePush['ID'] = singleValArr[0];
                singlePush['Category_Name'] = singleValArr[1];
                catSelArr.push(singlePush);
              }
            });
          }
          if(catSelArr.length > 0){
            this.productForm.patchValue({
              Categories: catSelArr
            });
          }

          if(res.data[0].Image != ''){
            this.imageURL = res.data[0].Image;
            this.PictureExist = true;
          }
      }
    }, (err) => {});
  }

  onItemSelect(item:any){
    // console.log(item);
    // console.log(this.selectedItems);
  }
  OnItemDeSelect(item:any){
    // console.log(item);
    // console.log(this.selectedItems);
  }
  onSelectAll(items: any){
    // console.log(items);
  }
  onDeSelectAll(items: any){
    // console.log(items);
  }

  checkKeyParam() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });
    if(typeof this.userData.SellerPackage != 'undefined' && this.userData.SellerPackage == 'Yes'){} else {
      this.changeRouter('member/edit-profile');
    }

    // get url params
    this.categorySlug = this.route.snapshot.params.category;
    // get query string
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);

    // when searching with keyword from mobile view
    if (this.getParams && this.getParams.q) {
      this.qQueryString = this.getParams.q;
    }

    this.cond = {
      cid: this.CID,
    };
  }

  
  // get Products tags list from db
  get_product_categories() {
    let cond = {
      cid: this.CID,
    };
    this.CategoryService.getCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.catsList = res.data;
        }
      }, (err) => {});
  }

  get_product_packagetypes() {
    let cond = {
      cid: this.CID,
    };
    this.StoreService.getStoreUPSPackagingTypes(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          console.log(res.data);
            this.packageTypeList = res.data;
        }
      }, (err) => {});
  }

  processFile(files: any) {
    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error("Only images are supported.", "Error!");
      return;
    }
    var reader = new FileReader();
    this.imageFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageURL = reader.result;
      this.ImageData = {
        filename: this.imageFile.name,
        filesize: this.imageFile.size,
        filetype: this.imageFile.type,
        value: reader.result,
      };
      this.removeImage = "";
    };
  }

  onSubmit(productData) {
    this.submitted = true;

    if (this.productForm.valid) {
      var tagArr = productData.Categories;
      if(tagArr.length){
        var tagArr2 = [];
        tagArr.map(function(val){
          if(typeof val.ID != "undefined" && val.ID != '')
            tagArr2.push(val.ID);
          else if(val != '')
            tagArr2.push(val);

          productData.Categories = tagArr2;
        });
      }
      productData["CID"] = this.CID;
      productData["creatorId"] = (typeof this.userData.id != "undefined" && this.userData.id != "" ? this.userData.id : '');
      if(typeof this.ImageData != 'undefined' && this.ImageData != '')
        productData["ImageData"] = this.ImageData;

      productData["PProfilePic"] = this.PictureExist;
      productData["removeImage"] = this.removeImage;

      // console.log(productData);return;
      
      // call service for edit user
      this.StoreService.SaveProductSeller(productData).subscribe(
        (res) => {
          // show message
          this.translate
            .get("PRODUCT_ADDED_SUCCESSFULLY")
            .subscribe((res: string) => {
              this.toastr.success(res, "Success!");
              this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Shop");
            });

          // reset from
          //this.productForm.reset();
        },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, "Error!");
          }
        }
      );
    }
  }

  RemovePic(): void {
    this.imageURL = "";
    this.PictureExist = "";
    this.ImageData = "";
    this.removeImage = "1";
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  memberPage(): void{
    this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Shop");
  }
}