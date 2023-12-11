import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-view-ticket',
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.sass']
})
export class ViewTicketComponent implements OnInit {
  
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
  TicketsNotFound : boolean = false;
  Ticket:any;
  TicketID:any;
  cond:any;
  TicketReplies:any;
  ticketcommentForm:any;

  constructor(
    private UserService: UserService,
    private EventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute,
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
  
    this.ActivePage = "view-ticket";

    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });
    
    this.route.paramMap.subscribe(params => {

      this.TicketID = params.get("ticketid");
      this.get_ticket();
        
    });

    this.ticketcommentForm = this.formBuilder.group({
      reply: ['', Validators.required],
    }, {
      
    });

    

  }

  get_ticket() {

    // set status 
    this.TicketsNotFound = false;
    
    this.cond = {
      cid: this.CID,
      userID: this.userData.id,
      TicketID: this.TicketID
    }
    
    this.Ticket = '';
    this.EventsService.getTicket(this.cond).subscribe(res => {
      if (res && res.data) {
        
        this.Ticket = (res.data.length) ? res.data[0] : '';

        this.get_ticket_replies();

      }  
    }, (err) => {
        this.TicketsNotFound = true;
    })
  }

  get_ticket_replies() {
    
    this.cond = {
      cid: this.CID,
      userID: this.userData.id,
      TicketID:this.TicketID
    }
    
    this.TicketReplies = [];
    this.EventsService.getTicketReplies(this.cond).subscribe(res => {
      if (res && res.data) {
        
        this.TicketReplies = (res.data.length) ? res.data : [];
        //console.log(this.TicketReplies);

      }  
    }, (err) => {
        //this.TicketsNotFound = true;
    })
  }

  onSubmit(formData) {
    
    
    this.markFormGroupDirtied(this.ticketcommentForm);

    if (this.ticketcommentForm.valid) {
      
      formData['CID'] = this.CID;
      formData['RepliedByID'] = this.userData.id;
      formData['TicketID'] = this.TicketID;
      formData['Status'] = this.Ticket.Status;
      

      this.EventsService.SaveTicketReply(formData)
        .subscribe(
          (res) => {

            this.ticketcommentForm.reset();
            
            this.translate.get('Reply Posted Successfully.').subscribe((res: string) => {
              this.toastr.success(res, 'Success!');
            });

            //this.changeRouter('tickets/view/'+this.TicketID);
            this.get_ticket_replies();
            
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

