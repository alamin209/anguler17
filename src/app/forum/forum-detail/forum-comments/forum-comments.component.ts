import { Component,Input,Output, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { ForumService } from '../../../services/forum/forum.service'
import { UserService } from '../../../services/auth/user.service'
import * as uuid from 'uuid';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Declear jquery 
declare var jQuery: any;

// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forum-comments',
  templateUrl: './forum-comments.component.html',
  styleUrls: ['./forum-comments.component.sass']
})
export class ForumCommentsComponent implements OnInit {

  @Input() ForumID: any;
  @Input() ForumComments: any;
  commentForm;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  ForumSlug: string;
  ForumInfo: any;
  reQuesTab: string;
  newUUid: string;
  UserToken: string;
  userData: any;
  modalRef: BsModalRef;
  
  //ForumComments: any;
  
  ShowCommentsCount: any;
  HideViewCommentsMore: boolean = true;
  
  constructor(
    private ForumService: ForumService,
    private router: Router, private translate: TranslateService,
    private route: ActivatedRoute,
    private UserService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
    ) {
    // Set translate language
    translate.setDefaultLang('en');

    
    //this.ForumComments = [];
    
    this.ShowCommentsCount = 5;
    
  }

    ngOnInit() {
    
      
      this.route.paramMap.subscribe(params => {
        this.ForumSlug = params.get("slug");
        // fetch Forum Comments
        //this.getForumComments();
      });
      
      // Define review form
      this.commentForm = this.formBuilder.group({
        Name: ['', Validators.required],
        Email: ['', [Validators.required,Validators.email]],
        Comment: ['', Validators.required],
      });
      
      // brodcast data for login user
      this.userData = '';
      this.UserService.setUserDataList();
      this.UserService.castUserData.subscribe(userData => {
        this.userData = userData;
        this.userData;
        // get user token
        this.UserToken = localStorage.getItem('token');
        
        this.commentForm.patchValue({
            Name: (this.userData && this.userData.screen_name) ? this.userData.screen_name : '',
            Email: (this.userData && this.userData.email) ? this.userData.email : '',
        });
        
      });
      
      
      
     
      
    }
    
    

  // save Forum review
  onSubmit(frmData) {
    this.markFormGroupDirtied(this.commentForm);
    if (this.commentForm.valid) {
      frmData['CID'] = this.CID;
      frmData['PostID'] = this.ForumID;
      frmData['CustomerID'] = this.userData.id;
      // call service save Forum review
      this.ForumService.SavePostComment(frmData).subscribe((res) => {
        // show message
        this.toastr.success('Posted Successfully.');

        // reset from 
        this.commentForm.reset();
        
        this.commentForm.patchValue({
            Name: (this.userData && this.userData.screen_name) ? this.userData.screen_name : '',
            Email: (this.userData && this.userData.email) ? this.userData.email : '',
        });
        
        // fetch Forum Comments
        this.getForumComments();
        
        
        this.modalRef.hide();

      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error);
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
  
  // Get Forum Comments 
  getForumComments() {
    if (this.ForumID) {
      console.log(this.ForumID);
      let cond: object = {
        CID: this.CID,
        ForumID: this.ForumID,
        CustomerID:(this.userData && this.userData.id) ? this.userData.id : '',
      };
      // Calling service
      this.ForumService.getForumComments(cond).subscribe(res => {
        if (res && res.data) {
          this.ForumComments = res.data;
          
        }
      }, (err) => {
            if(err.error.error){
                this.toastr.error(err.error.error);
            }
      });
    }
  }
  
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
  // for model 
  openModal(template: TemplateRef<any>,Type = '',RefID = 0) {
    this.modalRef = this.modalService.show(template);
  }

  ViewMoreComments(length:any){
    this.ShowCommentsCount = length;
    this.HideViewCommentsMore = false;
  }




}
