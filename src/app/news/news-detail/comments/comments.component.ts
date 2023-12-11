import { Component,Input,Output, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { NewsService } from '../../../services/news/news.service'
import { UserService } from '../../../services/auth/user.service'
import * as uuid from 'uuid';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Declear jquery 
declare var jQuery: any;

// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.sass']
})
export class CommentsComponent implements OnInit {

  @Input() NewsID: any;
  @Input() NewsComments: any;
  commentForm;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  NewsSlug: string;
  NewsInfo: any;
  reQuesTab: string;
  newUUid: string;
  UserToken: string;
  userData: any;
  modalRef: BsModalRef;
  
  //NewsComments: any;
  
  ShowCommentsCount: any;
  HideViewCommentsMore: boolean = true;
  

  
  constructor(
    private NewsService: NewsService,
    private router: Router, private translate: TranslateService,
    private route: ActivatedRoute,
    private UserService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
    ) {
    // Set translate language
    translate.setDefaultLang('en');

    
    //this.NewsComments = [];
    
    this.ShowCommentsCount = 1;
    
  }

    ngOnInit() {
    
      this.route.paramMap.subscribe(params => {
        this.NewsSlug = params.get("slug");
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
      
      // fetch News Comments
      //this.getNewsComments();
      
    }
    
    

  // save News review
  onSubmit(frmData) {
    this.markFormGroupDirtied(this.commentForm);
    if (this.commentForm.valid) {
      frmData['CID'] = this.CID;
      frmData['PostID'] = this.NewsID;
      frmData['CustomerID'] = (this.userData && this.userData.id) ? this.userData.id : '',
      // call service save News review
      this.NewsService.SavePostComment(frmData).subscribe((res) => {
        // show message
        this.translate.get('COMMENT_POSTED_SUCCESSFULLY').subscribe((res: string) => {
          this.toastr.success(res);
        });

        // reset from 
        this.commentForm.reset();
        
        this.commentForm.patchValue({
            Name: (this.userData && this.userData.screen_name) ? this.userData.screen_name : '',
            Email: (this.userData && this.userData.email) ? this.userData.email : '',
        });
        
        // fetch News Comments
        this.getNewsComments();
        
        
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
  
  // Get News Comments 
  getNewsComments() {
    if (this.NewsID) {
      let cond: object = {
        CID: this.CID,
        NewsID: this.NewsID,
        CustomerID:(this.userData && this.userData.id) ? this.userData.id : '',
      };
      // Calling service
      this.NewsService.getNewsComments(cond).subscribe(res => {
        if (res && res.data) {
          this.NewsComments = res.data;
          
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
