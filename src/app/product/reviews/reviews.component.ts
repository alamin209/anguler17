import { Component,Input,Output, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { StoreService } from '../../services/store/store.service';
import { UserService } from '../../services/auth/user.service'
import * as uuid from 'uuid';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Declear jquery 
declare var jQuery: any;

// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.sass']
})
export class ReviewsComponent implements OnInit {

  @Input() ProductID: any;
  @Input() ProductCID: any;
  reviewForm;
  QAForm;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  productSlug: string;
  productInfo: any;
  reQuesTab: string;
  newUUid: string;
  UserToken: string;
  userData: any;
  modalRef: BsModalRef;
  max: number = 5;
  rate: number = 0;
  isReadonly: boolean = false;
  productReviews: any;
  AverageRatings: any;
  productQAs: any;
  QType: any;
  QAID: any;
  ShowReviewsCount: any;
  HideViewReviewsMore: boolean = true;
  ShowQsCount: any;
  HideViewQsMore: boolean = true;
  

  
  constructor(
    private StoreService: StoreService,
    private router: Router, private translate: TranslateService,
    private route: ActivatedRoute,
    private UserService: UserService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
    ) {
    // Set translate language
    translate.setDefaultLang('en');

    // set product detail tabs
    this.reQuesTab = 'reviews';
    
    this.productReviews = [];
    this.AverageRatings = [];
    this.productQAs = [];

    this.QType = 'ques';
    this.QAID = 0;
    
    this.ShowReviewsCount = 1;
    this.ShowQsCount = 1;
    
  }

    ngOnInit() {
    
      this.route.paramMap.subscribe(params => {
        this.productSlug = params.get("slug");
      });

      // brodcast data for login user
      this.userData = '';
      this.UserService.setUserDataList();
      this.UserService.castUserData.subscribe(userData => {
        this.userData = userData;
        this.userData;
        // get user token
        this.UserToken = localStorage.getItem('token');
      });
      
      
      // Define review form
      this.reviewForm = this.formBuilder.group({
        Title: ['', Validators.required],
        Message: ['', Validators.required],
        Rating: ['', Validators.required],
      });

      // Define review form
      this.QAForm = this.formBuilder.group({
        Message: ['', Validators.required],
      });

      

      // fetch product reviews
      this.getProductReviews();
      
    }
    
    

  // save product review
  onSubmit(frmData) {
    this.markFormGroupDirtied(this.reviewForm);
    if (this.reviewForm.valid) {
      frmData['CID'] = this.ProductCID;
      frmData['Product_ID'] = this.ProductID;
      frmData['CustomerID'] = this.userData.id;
      //console.log(frmData);
      // call service save product review
      this.StoreService.SaveProductReview(frmData).subscribe((res) => {
        // show message
        this.translate.get('PRODUCT_REVIEW_POSTED_SUCCESSFULLY').subscribe((res: string) => {
          this.toastr.success(res, 'Success!');
        });

        // reset from 
        this.reviewForm.reset();
        
        // fetch product reviews
        this.getProductReviews();
        
        
        this.modalRef.hide();

      },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, 'Error!');
          }
        });
    } else {
    }
  }

  // save product review
  onSubmitQAForm(frmData) {
    this.markFormGroupDirtied(this.QAForm);
    if (this.QAForm.valid) {
      frmData['CID'] = this.ProductCID;
      frmData['Product_ID'] = this.ProductID;
      frmData['CustomerID'] = this.userData.id;
      frmData['QID'] = this.QAID;
      frmData['QType'] = this.QType;
      // call service save product review
      this.StoreService.SaveProductQA(frmData).subscribe((res) => {
        // show message
        if(this.QType == 'ques'){
          this.translate.get('PRODUCT_QUESTION_POSTED_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }else{
          this.translate.get('PRODUCT_QUESTION_ANSWER_POSTED_SUCCESSFULLY').subscribe((res: string) => {
            this.toastr.success(res, 'Success!');
          });
        }
        

        // reset from 
        this.QAForm.reset();
        
        // fetch product reviews
        this.getProductQA();
        
        this.modalRef.hide();

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
  
  // Get product reviews 
  getProductReviews() {
    if (this.ProductID) {
      let cond: object = {
        CID: this.CID,
        ProductID: this.ProductID,
        CustomerID:(this.userData && this.userData.id) ? this.userData.id : '',
      };
      // Calling service
      this.StoreService.getProductReviews(cond).subscribe(res => {
        if (res && res.data) {
          this.productReviews = res.data;
          this.AverageRatings = res.other_data;
        }
      }, (err) => {
            if(err.error.error){
              this.toastr.error(err.error.error, 'Error!');
            }
      });
    }
  }
  
  // Get product qa 
  getProductQA() {
    if (this.ProductID) {
      let cond: object = {
        CID: this.CID,
        ProductID: this.ProductID,
        CustomerID:(this.userData && this.userData.id) ? this.userData.id : '',
        QID: '',
      };
      // Calling service
      this.StoreService.getProductQA(cond).subscribe(res => {
        if (res && res.data) {
          this.productQAs = res.data;
          
        }
      }, (err) => {
        if(err.error.error){
          this.toastr.error(err.error.error, 'Error!');
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

    if (!(this.userData)){
      this.translate.get('LOGIN_FIRST').subscribe((res: string) => {
        this.toastr.error(res);
      });
      let slug = "login?redirect=product&slug="+this.productSlug;
      this.changeRouter(slug);
    }else{
      this.QType = Type;
      this.QAID = RefID;
      this.modalRef = this.modalService.show(template);
    }
  }

  ViewMoreReviews(length:any){
    this.ShowReviewsCount = length;
    this.HideViewReviewsMore = false;
  }

  ViewMoreQA(length:any){
    this.ShowQsCount = length;
    this.HideViewQsMore = false;
  }



}
