import { Component, OnInit, NgModule, Input, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { UserService } from "../../services/auth/user.service";
import { ToastrService } from "ngx-toastr";

// Import environment config file.
import { environment } from "../../../environments/environment";
import { CategoryService } from "../../services/category/category.service";
import { ResourcesService } from "../../services/resources/resources.service";

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-seller-resourcepage",
  templateUrl: "./seller-resource.component.html",
  styleUrls: ["./seller-resource.component.sass","../../../assets/css/memberpage.css"],
})

export class SellerResourceComponent implements OnInit {
  resourceForm: FormGroup;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  resourcesList: Array<any>;
  newUUid: string;
  UserToken: string;
  resourceData: any;
  resourceSingle:any;
  userData: any;
  cond: any;
  getParams: any;
  qQueryString: any;
  categorySlug: string;
  categoryList: any;
  tagList: any = [];
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private ResourcesService: ResourcesService,
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
    this.resourceData = "";
    this.PictureExist = false;
    this.recId = this.route.snapshot.params.resourceId;
    if(this.recId > 0){
      this.load_resource_data();  
    }
    this.checkKeyParam();
    this.get_product_categories();
    this.get_product_tags();
    this.multiSelectTags = {
      primaryKey: "ID",
      labelKey: "name",
      enableCheckAll: false
    }

    this.resourceForm = this.formBuilder.group({
      id: [""],
      title: ["", Validators.required],
      short_desc: ["", Validators.required],
      desc: [""],
      author: [""],
      selCategory: ["", Validators.required],
      selTag: [""]
    });
  }

  load_resource_data(){
    let cond = {
      cid: this.CID,
      recId: this.recId
    };
    this.ResourcesService.getResourcesSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
          this.resourceSingle = res.data[0];
          this.resourceForm.patchValue({
            title: res.data[0].title,
            short_desc: res.data[0].short_description,
            desc: res.data[0].description,
            author: res.data[0].author,
            selCategory: res.data[0].resCategory,
            //selTag: res.data[0].resTags,
            id: res.data[0].ID
          });

          var resTags = res.data[0].resTags;
          var tagsSelArr = [];
          if(resTags){
            var resTagsArr = resTags.split(",");
            resTagsArr.map(function(vl){
              var singleValArr = vl.split("<->");
              if(singleValArr.length > 0){
                let singlePush = new Array();
                singlePush['ID'] = singleValArr[0];
                singlePush['name'] = singleValArr[1];
                tagsSelArr.push(singlePush);
              }
            });
          }
          if(tagsSelArr.length > 0){
            this.resourceForm.patchValue({
              selTag: tagsSelArr
            });
          }

          if(res.data[0].image != ''){
            this.imageURL = res.data[0].image;
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

  // get Products categories list from db
  get_product_categories() {
    let cond = {
      cid: this.CID,
    };
    this.ResourcesService.getResourcesCategoriesMember(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.categoryList = res.data;
        }
      }, (err) => {});
  }

  // get Products tags list from db
  get_product_tags() {
    let cond = {
      cid: this.CID,
    };
    this.ResourcesService.getResourcesTagsMember(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.tagList = res.data;
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

  onSubmit(resourceData) {
    this.submitted = true;

    if (this.resourceForm.valid) {
      var tagArr = resourceData.selTag;
      if(tagArr.length){
        var tagArr2 = [];
        tagArr.map(function(val){
          if(typeof val.ID != "undefined" && val.ID != '')
            tagArr2.push(val.ID);
          else if(val != '')
            tagArr2.push(val);
          resourceData.selTag = tagArr2;
        });
      }
      resourceData["CID"] = this.CID;
      resourceData["creatorId"] = (typeof this.userData.id != "undefined" && this.userData.id != "" ? this.userData.id : '');
      if(typeof this.ImageData != 'undefined' && this.ImageData != '')
        resourceData["ImageData"] = this.ImageData;

      resourceData["PProfilePic"] = this.PictureExist;
      resourceData["removeImage"] = this.removeImage;

      // console.log(resourceData);return;
      
      // call service for edit user
      this.ResourcesService.SaveResourcePostMember(resourceData).subscribe(
        (res) => {
          // show message
          this.translate
            .get("RESOURCE_SAVED_SUCCESSFULLY")
            .subscribe((res: string) => {
              this.toastr.success(res, "Success!");
              this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Resources");
            });

          // reset from
          //this.resourceForm.reset();
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
    this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Resources");
  }
}