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
  selector: "app-type",
  templateUrl: "./product-type.component.html",
  styleUrls: ["./product-type.component.sass","../../../../assets/css/memberpage.css"],
})

export class ProductTypeComponent implements OnInit {
  productForm: FormGroup;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  newUUid: string;
  UserToken: string;
  userData: any;
  currentUser: any;
  userPackage: any;
  cond: any;
  getParams: any;
  qQueryString: any;
  localStorage: any;
  
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
  }

  ngOnInit() {

    this.userData = '';
    
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      this.getUserData();
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    

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
          
          
        }
      }, (error) => {
      });
    }
  }

  
}