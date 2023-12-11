import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { EventsService } from '../../services/events/events.service';
import { ToastrService } from 'ngx-toastr';
import { Title,Meta  } from '@angular/platform-browser';
// Import environment config file.
import { environment } from 'src/environments/environment';

/* Import the service */
import { UserService } from '../../services/auth/user.service';

import swal from 'sweetalert';

@Component({
  selector: 'app-ticketing',
  templateUrl: './ticketing.component.html',
  styleUrls: ['./ticketing.component.sass']
})
export class TicketingComponent implements OnInit {

  setTab: string;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  
  
  AWSBUCKETURL: string = environment.config.AWSBUCKETURL;
  TicketsList: Array<any>;
  UserToken: string;
  userData: any;
  limit: number = 5;
  cond:any;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  typeQueryString: any;
  sorFilter: number;
  TicketsNotFound : boolean = false;
  CategoriesBreadcumbs: any;
  recentTicketsList: Array<any>;
  forumcategoryList: Array<any>;
  forumtagsList: Array<any>;
  Keyword:any;
  CateGorySearch:any;
  TagSearch:any;
  ViewAll : boolean = false;
  ActivePage:any;
  

  constructor(
    private UserService:  UserService,
    private EventsService:  EventsService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title,
  ) { 
    // Set translate language
    translate.setDefaultLang('en');

    // get activated route  
    this.activatedRoute.url.subscribe(url => {
      //this.checkKeyParam();
    });
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

    this.setTab = "All";
    
    this.ActivePage = "tickets";


    this.get_tickets();


    
  }

 
  
  // Get store list
  get_tickets(event?:any, limitChanged?:any) {

    // set status 
    this.TicketsNotFound = false;
    
    // Calling service

    this.cond = {
      cid: this.CID,
      userID: this.userData.id,
      Status:this.setTab
    }
    
    if(limitChanged){
      this.totalItems=0;
      this.currentPage=0;
    }
    if(this.limit != 1000){
      this.cond.limit=this.limit;
    }
    if(event && event.page){
      this.cond.page=event.page;
    }else{
      this.cond.page = 1;
    }

    
    
    // get forum lists
    this.TicketsList = [];
    this.EventsService.getTickets(this.cond).subscribe(res => {
      if (res && res.data) {
        
        this.TicketsList = (res.data.length) ? res.data : [];
        this.totalItems = res.total;
        
        if (res.total == 0) {
          this.TicketsNotFound = true;
        }

      }  
    }, (err) => {
        this.TicketsNotFound = true;
    })
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  CloseTicket(ID:any) {

    this.cond = {
      cid: this.CID,
      userID: this.userData.id,
      TicketID:ID
    }
    this.EventsService.CloseTicket(this.cond).subscribe(res => {
      if (res && res.data) {
        
        this.get_tickets();
        swal("Deleted!", "Your ticket has been closed!", "success");

      }  
    }, (err) => {
        this.TicketsNotFound = true;
    })
  }
  

}

