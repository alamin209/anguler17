import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../services/auth/user.service'
import { StoreService } from '../services/store/store.service';
import { HomeService } from '../services/home/home.service'



// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.sass']
})
export class ContactUsComponent implements OnInit {
  
  contactForm;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  ipAddress: any;
  siteSettings: any;
  size:any;
  lang:any;
  theme:any;
  type:any;

  
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private UserService: UserService,
    private StoreService:StoreService,
    private HomeService:HomeService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }



  ngOnInit() {

    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: ['', [Validators.required]],
      message: ['', [Validators.required]],
      recaptcha: ['', [Validators.required]]
    }, {
      
    });
    
    // Calling site settings 
    this.getSettings();
    
    // get ip address
    this.StoreService.getIPAddress().subscribe(res => {
      if (res && res.ip) {
        this.ipAddress = res.ip;
      }
    }, (err) => {
    });

    // jQuery(document).ready(function () {
    //   jQuery(".form-control:not('.email')").keyup(function () {
    //     var _val = jQuery(this).val();
    //     var _txt = _val.charAt(0).toUpperCase() + _val.slice(1);
    //     jQuery(this).val(_txt);
    //   });
    // });

  }


  onSubmit(customerData) {
    
    this.markFormGroupDirtied(this.contactForm);

    if (this.contactForm.valid) {
      customerData['CID'] = this.CID;
      customerData['ipAddress'] = this.ipAddress;
      this.UserService.saveContactRquest(customerData)
        .subscribe(
          (res) => {
            this.contactForm.reset();
            this.translate.get('CONTACT_REQUEST_SENT_SUCCESSFULLY').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });
            this.changeRouter('thank-you?t=contact-us');
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
  
  // Fetch menus method
  getSettings(): void {
    // Set conditions
    let cond = {
      cid: this.CID
    };
    this.HomeService.getSettings(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          this.siteSettings = res.data[0];
        } else {
          this.siteSettings = '';
        }
      }, (err) => {

      });
  }
  // handle google captcha
  handleLoad():void{

  }
 // success google captcha 
  handleSuccess(e): void {

  }
  // reset google captcha
  handleReset():void{
    
  }

  handleExpire ():void{

  }

}

