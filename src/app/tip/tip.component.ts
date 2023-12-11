import { Component, OnInit } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as qs from 'qs';
import { ResourcesService } from '../services/resources/resources.service'
import { ToastrService } from 'ngx-toastr';
// Import environment config file.
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tip',
  templateUrl: './tip.component.html',
  styleUrls: ['./tip.component.sass']
})
export class TipComponent implements OnInit {

  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  TIP_CATEGORY: string = environment.config.TIP_CATEGORY;
  RESOURCES_CATEGORY: string = environment.config.RESOURCES_CATEGORY;
  
  
  resourcesList: Array<any>;
  UserToken: string;
  userData: any;
  cond:any;
  tippost:any;
  TIPNotFound:any;
  VideoURL:any;
  
  constructor(
    private ResourcesService: ResourcesService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { 
    // Set translate language
    translate.setDefaultLang('en');

  }

  ngOnInit() {
  
    this.TIPNotFound = false;
    this.tippost = '';
    this.get_tip_post();
    
    
    
  }

  get_tip_post(category?:any) {
    
    // set status 
    this.TIPNotFound = false;
    // Calling service

    this.cond = {
      cid: this.CID
    }

    this.cond.category = this.TIP_CATEGORY;
    
    // get resources lists
    
    this.ResourcesService.getTipPost(this.cond).subscribe(res => {
      if (res && res.data) {
        this.tippost = (res.data  && res.data.length) ? res.data[0] : '';
        let vurl = 'https://www.youtube.com/embed/'+this.tippost.video_id+'?modestbranding=1&rel=0&showinfo=0';
        this.VideoURL = this.sanitizer.bypassSecurityTrustResourceUrl(vurl);
        //console.log(this.tippost);
      }  
    }, (err) => {
        this.TIPNotFound = true;
    })
  }


}
