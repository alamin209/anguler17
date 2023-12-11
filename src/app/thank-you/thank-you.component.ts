import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as qs from 'qs';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.sass']
})
export class ThankYouComponent implements OnInit {

  messageSlug: any;
  t: any;
  page:any;
  getParams:any;
  url: string = environment.config.API_URL;
  private CID: Number = environment.config.CID;
  private EMAIL_CONFIRMATION: boolean = environment.config.EMAIL_CONFIRMATION;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // get url params
    this.messageSlug = this.route.snapshot.params.slug;
    
    this.page = this.route.snapshot.params.slug;
    if(this.page == 'customer'){
        setTimeout(() => {
          window.location.href = location.origin +'/member/categories';
        }, 7000);

    }
    
    // get query string
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);
    // check qeury price
    if (this.getParams && this.getParams.t) {
        // set price params
        this.page = this.getParams.t;
        
    }

  }

}
