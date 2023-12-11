import { Component, OnInit ,EventEmitter,NgZone ,Input, Output} from '@angular/core';
import { Router,ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import * as _ from 'lodash';
import * as qs from "qs";

// import service 
import { UserService } from '../../services/auth/user.service'
import { CountriesService } from '../../services/countries/countries.service';
import { VideoService } from '../../services/video/video.service';
import { ResourcesService } from '../../services/resources/resources.service'

declare let google: any;

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.sass']
})
export class CategoriesComponent implements OnInit {

  userForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  PRODUCT_CATEGORIES_TABLE: string = environment.config.PRODUCT_CATEGORIES_TABLE;
  VIDEO_CATEGORIES_TABLE: string = environment.config.VIDEO_CATEGORIES_TABLE;
  ASK_CATEGORIES_ON_SIGNUP: boolean = environment.config.ASK_CATEGORIES_ON_SIGNUP;
  
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  CountriesList: any;
  statesList: any;
  userData: any;
  currentUser: any;
  UserToken: any;
  Phone:any;
  ImageData: any;
  imageFile: any; 
  imageURL: any; 
  PictureExist: any; 
  formattedAddress: string;
  user_categories:any;
  pcategories:any;
  vcategories:any;
  SelectAllInterestAction: boolean = false;
  SelectAllInterest: boolean = false;
  _cats: any;
  _cats_validated: boolean = false;
  ProductCategories: boolean = true;
  VideoCategories: boolean = false;
  StAccCreated: boolean = false;
  getParams:any;
  cat:any;
  
  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone,
    private VideoService: VideoService,
    private ResourcesService: ResourcesService
  ) { }

  ngOnInit() {

    this.SelectAllInterestAction = true;
    this.PictureExist = false;
    // brodcast data for login user
    this.userData = '';
    
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
	  
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    // Define user form
    this.userForm = this.formBuilder.group({
      categories: [''],
    });

    
    jQuery(document).ready(function () {
        jQuery(".form-control:not('.email, .password')").keyup(function () {
            var _val = jQuery(this).val();
            var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
            jQuery(this).val(_txt);
        });
      
        
    });

    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    // check qeury price
    if (this.getParams && this.getParams.sacc) {
        // set price params
        this.StAccCreated = this.getParams.sacc;
        if(this.StAccCreated){
            let dataObj = {
                cid: this.CID,
                userId: this.userData.id
            }
            this.UserService.st_account_status_update(dataObj).subscribe(
            (res) => {
              // account updated
            },
            (error: any) => {
              
            }
          );
        }
    }
    
    this.getUserData();
    
    // calling multiple method
    //forkJoin([this.getUserData(), this.get_product_categories()]);


  }
  
  CategoriesFrom(from:any) {
    this.ProductCategories = false;
    this.VideoCategories = false;
    if(from == 'video'){
        this.VideoCategories = true;
        //this.get_tv_categories();
    }else{
        this.ProductCategories = true;
        //this.get_product_categories();
    }
  }
  
  // get Products categories list from db
  get_product_categories() {
    let cond = {
      cid: this.CID,
    };
    this.ResourcesService.getResourcesCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.pcategories = res.data;
            let user_cats = this.user_categories;
            let selectedall = true;
            _.map(this.pcategories, function (v) {
                v.selected = false;
                if (user_cats && user_cats.length) {
                    _.map(user_cats, function (v2) {
                        if (v.ID == v2.CategoryID) {
                            v.selected = true;
                        }else{
                            selectedall = false;
                        }
                    });
                }
                _.map(v.Subcategories, function (v) {
                    v.selected = false;
                    if (user_cats && user_cats.length) {
                        _.map(user_cats, function (v2) {
                            if (v.ID == v2.CategoryID) {
                                v.selected = true;
                            }else{
                                selectedall = false;
                            }
                        });
                    }
                    _.map(v.Subcategories, function (v) {
                        v.selected = false;
                        if (user_cats && user_cats.length) {
                            _.map(user_cats, function (v2) {
                                if (v.ID == v2.CategoryID) {
                                    v.selected = true;
                                }else{
                                    selectedall = false;
                                }
                            });
                        }
                        _.map(v.Subcategories, function (v) {
                            v.selected = false;
                            if (user_cats && user_cats.length) {
                                _.map(user_cats, function (v2) {
                                    if (v.ID == v2.CategoryID) {
                                        v.selected = true;
                                    }else{
                                        selectedall = false;
                                    }
                                });
                            }
                            _.map(v.Subcategories, function (v) {
                                v.selected = false;
                                if (user_cats && user_cats.length) {
                                    _.map(user_cats, function (v2) {
                                        if (v.ID == v2.CategoryID) {
                                            v.selected = true;
                                        }else{
                                            selectedall = false;
                                        }
                                    });
                                }
                                return v;
                            });
                            return v;
                        });
                        return v;
                    });
                    return v;
                });
                return v;
            });
            
            if(selectedall){
                this.SelectAllInterestAction = false;
            }
            
        }
      }, (err) => {
         
      });
  }
  
  // get TV categories list from db
  get_tv_categories() {
    let cond = {
      cid: this.CID,
    };
    this.VideoService.getVideoCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.vcategories = res.data;
            let user_cats = this.user_categories;
            let selectedall = true;
            _.map(this.vcategories, function (v) {
                v.selected = false;
                if (user_cats && user_cats.length) {
                    _.map(user_cats, function (v2) {
                        if (v.ID == v2.CategoryID) {
                            v.selected = true;
                        }else{
                            selectedall = false;
                        }
                    });
                }
                _.map(v.Subcategories, function (v) {
                    v.selected = false;
                    if (user_cats && user_cats.length) {
                        _.map(user_cats, function (v2) {
                            if (v.ID == v2.CategoryID) {
                                v.selected = true;
                            }else{
                                selectedall = false;
                            }
                        });
                    }
                    _.map(v.Subcategories, function (v) {
                        v.selected = false;
                        if (user_cats && user_cats.length) {
                            _.map(user_cats, function (v2) {
                                if (v.ID == v2.CategoryID) {
                                    v.selected = true;
                                }else{
                                    selectedall = false;
                                }
                            });
                        }
                        _.map(v.Subcategories, function (v) {
                            v.selected = false;
                            if (user_cats && user_cats.length) {
                                _.map(user_cats, function (v2) {
                                    if (v.ID == v2.CategoryID) {
                                        v.selected = true;
                                    }else{
                                        selectedall = false;
                                    }
                                });
                            }
                            _.map(v.Subcategories, function (v) {
                                v.selected = false;
                                if (user_cats && user_cats.length) {
                                    _.map(user_cats, function (v2) {
                                        if (v.ID == v2.CategoryID) {
                                            v.selected = true;
                                        }else{
                                            selectedall = false;
                                        }
                                    });
                                }
                                return v;
                            });
                            return v;
                        });
                        return v;
                    });
                    return v;
                });
                return v;
            });
            
            
            if(selectedall){
                this.SelectAllInterestAction = false;
            }
            
        }
      }, (err) => {
         
      });
  }
  
  OpenCategory(ele):void{
    
    //jQuery('.resources-items').removeClass('is--Expanded');
    jQuery(ele).parent().parent().parent().addClass('is--Expanded');
    
  }
  
  // save user data
  SetAllMyInterest() {
  
    let dt = {
        CID: this.CID,
        categories: this.pcategories,
        status: 'add'
    };
    if(this.SelectAllInterestAction){
        dt['status'] = 'remove';
        this.SelectAllInterestAction = false;
    }else{
        dt['status'] = 'add';
        this.SelectAllInterestAction = true;
    }
    
    
    dt['userID'] = this.userData.id;
    dt['CategoryTable'] = this.PRODUCT_CATEGORIES_TABLE;
    this.UserService.setMyInterestAllCategories(dt).subscribe((res) => {
        
        this.translate.get('USER_CATEGORIES_UPDATED_SUCCESSFULLY').subscribe((res: string) => {
          this.toastr.success(res, 'Success!');
        });
        
        if (this.pcategories && this.pcategories.length) {
            let _SelectAllInterestAction = this.SelectAllInterestAction;
            _.map(this.pcategories, function (v) {
                if(_SelectAllInterestAction){
                    v.selected = true;
                }else{
                    v.selected = false;
                }
                return v;
            });
        }
        setTimeout(function(){
            //jQuery('#categories').select2({placeholder: "Select Categories"}); //initialize 
        },2000);
        
      },
    (error: any) => {
      if (error.error.error) {
        this.toastr.error(error.error.error, 'Error!');
      }
    });
    
  }
  
  // save user data
  SetMyInterest(cat,catID,CategoryName,table) {
    
    if (catID) {
      
      let dt = {
          CID: this.CID
      };
      
      dt['userID'] = this.userData.id;
      dt['CategoryTable'] = table;
      dt['catID'] = catID;
      dt['CategoryName'] = CategoryName;
      
      let status = '';
      if(cat && cat.selected){
        status = 'remove';
      }else{
        status = 'add';
      }
      
      dt['status'] = status;
      // call service for edit user
      this.UserService.setMyInterestCategory(dt).subscribe((res) => {
        
        if (this.pcategories && this.pcategories.length) {
            _.map(this.pcategories, function (v) {
                if (v.ID == catID) {
                    if(status == 'add'){
                        v.selected = true;
                    }else{
                        v.selected = false;
                    }    
                }
                _.map(v.Subcategories, function (v) {
                    if (v.ID == catID) {
                        if(status == 'add'){
                            v.selected = true;
                        }else{
                            v.selected = false;
                        }    
                    }
                    _.map(v.Subcategories, function (v) {
                        if (v.ID == catID) {
                            if(status == 'add'){
                                v.selected = true;
                            }else{
                                v.selected = false;
                            }    
                        }
                        _.map(v.Subcategories, function (v) {
                            if (v.ID == catID) {
                                if(status == 'add'){
                                    v.selected = true;
                                }else{
                                    v.selected = false;
                                }    
                            }
                            _.map(v.Subcategories, function (v) {
                                if (v.ID == catID) {
                                    if(status == 'add'){
                                        v.selected = true;
                                    }else{
                                        v.selected = false;
                                    }    
                                }
                                return v;
                            });
                            return v;
                        });
                        return v;
                    });
                    return v;
                });
                return v;
            });
            
        }
        
        
        if (this.vcategories && this.vcategories.length) {
            _.map(this.vcategories, function (v) {
                if (v.ID == catID) {
                    if(status == 'add'){
                        v.selected = true;
                    }else{
                        v.selected = false;
                    }    
                }
                _.map(v.Subcategories, function (v) {
                    if (v.ID == catID) {
                        if(status == 'add'){
                            v.selected = true;
                        }else{
                            v.selected = false;
                        }    
                    }
                    _.map(v.Subcategories, function (v) {
                        if (v.ID == catID) {
                            if(status == 'add'){
                                v.selected = true;
                            }else{
                                v.selected = false;
                            }    
                        }
                        _.map(v.Subcategories, function (v) {
                            if (v.ID == catID) {
                                if(status == 'add'){
                                    v.selected = true;
                                }else{
                                    v.selected = false;
                                }    
                            }
                            _.map(v.Subcategories, function (v) {
                                if (v.ID == catID) {
                                    if(status == 'add'){
                                        v.selected = true;
                                    }else{
                                        v.selected = false;
                                    }    
                                }
                                return v;
                            });
                            return v;
                        });
                        return v;
                    });
                    return v;
                });
                return v;
            });
        }
        
      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        });
    } else {
        
    }
    
  }
  
  // save user data
  onSubmit(customerData) {
    
    this.userForm.controls['categories'].setErrors(null);

    this._cats_validated = false;
    
    let _cats = ''; //jQuery("#categories").val();
    
    if(_cats.length == 0){
        this._cats_validated = true;
    }
    
    this.markFormGroupDirtied(this.userForm);
    if (this.userForm.valid) {
      customerData['CID'] = this.CID;
      customerData['userID'] = this.userData.id;
      customerData['CategoryTable'] = this.PRODUCT_CATEGORIES_TABLE;
      customerData['categories'] = _cats;
      
      // call service for edit user
      this.UserService.editUserCategories(customerData).subscribe((res) => {
        // show message
        this.translate.get('USER_CATEGORIES_UPDATED_SUCCESSFULLY').subscribe((res: string) => {
          this.toastr.success(res, 'Success!');
        });

        // reset from 
        this.userForm.reset();

        // redirect
        //this.changeRouter('member/profile');

      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        });
    } else {
        
    }
    
  }

  
  // check validation for whole form 
  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsDirty();

      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
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
        userId: this.userData.id
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          this.currentUser = res.data;
          this.user_categories = res.data.categories;
          this.UserService.setAccountDataList(res);
          
          this.get_product_categories();
          this.get_tv_categories();
          
        }
      }, (error) => {
      });
    }
  }
}