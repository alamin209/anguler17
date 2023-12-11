import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '../../services/events/events.service';

declare let google: any;

/* Import the service */
import { UserService } from '../../services/auth/user.service';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.sass']
})
export class CreateTicketComponent implements OnInit {
  
  ticketForm;
  url: string = environment.config.API_URL;
  CID: Number = environment.config.CID;
  TAX_EMEMPT: boolean = environment.config.TAX_EMEMPT;
  DEFAULT_COUNTRY: string = environment.config.DEFAULT_COUNTRY;
  ASK_COMPANY_NAME: boolean = environment.config.ASK_COMPANY_NAME;
  PHONE_NUMBER_MASK: boolean = environment.config.PHONE_NUMBER_MASK;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  queryWait: boolean;
  userData: any;
  UserToken: any;
  Phone:any;
  localStorage:any;
  ActivePage:any;
  
  constructor(
    private UserService: UserService,
    private EventsService: EventsService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    public zone: NgZone
  ) {
    // Set translate language
    translate.setDefaultLang('en');
  }



  ngOnInit() {
  
    this.ActivePage = "create-ticket";
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    
    this.ticketForm = this.formBuilder.group({
      Product: ['', Validators.required],
      SubProduct: ['', Validators.required],
      Request: ['', Validators.required],
      Status: ['', Validators.required],
      Details: ['', Validators.required],
      HowResolved: [''],
      ContactName: ['', Validators.required],
      AssociatedItem: [''],
      AssociatedCategory: [''],
      AssociatedSubCategory: ['']
    }, {
      
    });
    
    

  }

  
  onSubmit(formData) {
    
    this.ticketForm.controls['HowResolved'].setErrors(null);
    this.ticketForm.controls['AssociatedItem'].setErrors(null);
    this.ticketForm.controls['AssociatedCategory'].setErrors(null);
    this.ticketForm.controls['AssociatedSubCategory'].setErrors(null);
    
    this.markFormGroupDirtied(this.ticketForm);

    if (this.ticketForm.valid) {
      
      formData['CID'] = this.CID;
      formData['MemberID'] = this.userData.id;
      formData['Rating'] = 0;
      
      this.EventsService.SaveTicket(formData)
        .subscribe(
          (res) => {
            this.ticketForm.reset();
            this.translate.get('Ticket Created Successfully.').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });
            this.changeRouter('tickets');
            
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

