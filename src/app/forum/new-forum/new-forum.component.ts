import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { TranslateService } from '@ngx-translate/core';
import { CountriesService } from '../../services/countries/countries.service';
import { HomeService } from '../../services/home/home.service'
import { ForumService } from '../../services/forum/forum.service';

declare let google: any;

/*
 * Import the service
 */
import { UserService } from '../../services/auth/user.service';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-new-forum',
  templateUrl: './new-forum.component.html',
  styleUrls: ['./new-forum.component.sass']
})
export class NewForumComponent implements OnInit {
  
  topicForm;
  url: string = environment.config.API_URL;
  CID: Number = environment.config.CID;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  CountriesList: any;
  statesList: any;
  queryWait: boolean;
  userData: any;
  UserToken: any;
  Phone:any;
  ForumCategories = [];
  ForumTags = [];
  tags: any;
  _cats: any;
  _cats_validated: boolean = false;
  _tags_validated: boolean = false;
  localStorage:any;
  exampleData = [];
  cat_options :any;
  cat_options_list = [];
  dropdownSettings = {};

  constructor(
    private UserService: UserService,
    private CountriesService: CountriesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone,
    private HomeService: HomeService,
    private ForumService: ForumService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }



  ngOnInit() {
  
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    this.dropdownSettings = {
      singleSelection: false,
      enableCheckAll:false,
      idField: 'ID',
      textField: 'name',
      itemsShowLimit: 10,
      allowSearchFilter: true,
      closeDropDownOnSelection:true
    };
    
    this.tags = [];
    this._cats = [];
    
    this.topicForm = this.formBuilder.group({
      title: ['', Validators.required],
      short_description: [''],
      description: ['', Validators.required],
      categories: [''],
      tags: [''],
    }, {
      
    });
    
    let cond = {
      cid: this.CID
    };
    this.ForumService.getForumCategories(cond)
      .subscribe(res => {
        if (res && res.categories && res.categories.length) {
          this.ForumCategories = res.categories;
        }
        
        if (res && res.tags && res.tags.length) {
          this.ForumTags = res.tags;
        }
        
        setTimeout(function(){
            jQuery('#tags').select2({tags:true,placeholder: "Select Tags Or Add New"}); //initialize 
            jQuery('#categories').select2({placeholder: "Select Categories"}); //initialize 
        },1000);
        
    }, (err) => {

    });
    
    

  }

  
  onSubmit(formData) {
    
    //console.log(sel_cats);
    this.topicForm.controls['tags'].setErrors(null);
    this.topicForm.controls['categories'].setErrors(null);
    this.topicForm.controls['short_description'].setErrors(null);
    
    this._cats_validated = false;
    this._tags_validated = false;
    
    let _cats = jQuery("#categories").val();
    let _tags = jQuery("#tags").val();
    
    if(_cats.length == 0){
        this._cats_validated = true;
    }
    if(_tags.length == 0){
        this._tags_validated = true;
    }
    
    this.markFormGroupDirtied(this.topicForm);

    if (this.topicForm.valid) {
      
      formData['CID'] = this.CID;
      formData['cats'] = jQuery("#categories").val();
      formData['tags'] = jQuery("#tags").val();
      formData['userId'] = this.userData.id;
      
      this.ForumService.SaveForumPost(formData)
        .subscribe(
          (res) => {
            this.topicForm.reset();
            this.translate.get('FORUM_POSTED_SUCCFULLY').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });
            this.changeRouter('forum');
            
          },
          (error: any) => {
            if (error.error.error) {
              this.toastr.error(error.error.error, 'Error!');
            }
          }
        );
    } else {
    }
  }
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

  

}

