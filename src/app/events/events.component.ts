import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import * as _ from 'lodash';

// import services
import { EventsService } from '../services/events/events.service';
import { UserService } from '../services/auth/user.service'

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.sass']
})
export class EventsComponent implements OnInit {

  CID: number = environment.config.CID;
  PORTAL_MAIN: string = environment.config.PORTAL_MAIN;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  EVENTS_HOST: string = environment.config.EVENTS_HOST;
  userData: any;
  UserToken: any;
  currentUser: any;
  cond: any = [];
  NoEventsFound: boolean = false;
  AllEvents: any = [];
  pendingEvents:any = [];
  finalEvents:any = [];
  page:number = 1;
  limit:number = 3;
  totalItems:number=0;
  currentPage :number=0;
  getParams: any;
  categories = [];
  
  
  constructor(
    private UserService: UserService,
    private EventsService: EventsService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
   
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
      this.getUserData();
      
      
    });
    this.getEvents();
    
    
    

  }
  
  
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
  
  getEvents(event?:any, limitChanged?:any){
  
    this.cond = { 
      userId: (this.userData && this.userData.id) ? this.userData.id : '',
      status:2,
      cid: this.CID,
      page: this.page,
      limit: this.limit,
    };
    
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
    
    
    this.NoEventsFound = false;
    this.AllEvents = [];
    this.EventsService.getEvents(this.cond)
    .subscribe(res => {
      if (res && res.data && res.data.length) {
            this.totalItems = res.total;
            this.AllEvents = (res.data && res.data.length) ? res.data:[]; 
            
            
      }else{
        this.AllEvents = [];
        this.NoEventsFound = true;
      }
    }, (err) => {
        this.NoEventsFound = true;
        this.AllEvents = [];
    });
  }

  

  receiveMessage($event) {
    //this.getUserPendingEvents();
  }
  
  // get current user
  getUserData(): void {
    if (this.userData) {
      let dataObj = {
        cid: this.CID,
        userId: (this.userData && this.userData.id) ? this.userData.id : ''
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
          this.currentUser = res.data;
          this.UserService.setAccountDataList(res);
          
          let user_permissions = res.user_permissions;
          if(user_permissions.includes('7')){
            this.getEvents();
          }else{
              this.translate.get('NO_PERMISSION_MSG').subscribe((res: string) => {
                this.toastr.error(res);
              });
              //this.changeRouter('member/profile');    
              window.location.href = location.origin + '/member/profile';
          }
          
          
        }
      }, (error) => {
      });
    }
  }
  
  
  
  
  
}
