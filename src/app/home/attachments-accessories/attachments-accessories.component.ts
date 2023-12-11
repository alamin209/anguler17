import { Component, OnInit } from '@angular/core';

// Handle the global property
import { Globals } from '../../common/globals';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category/category.service';
import * as _ from 'lodash';

// Import environment config file.
import { environment } from '../../../environments/environment';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-attachments-accessories',
  templateUrl: './attachments-accessories.component.html',
  styleUrls: ['./attachments-accessories.component.sass']
})
export class AttachmentsAccessoriesComponent implements OnInit {

  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  attachmentASOptions: any = {};
  attachmentASStore: any = [];
  aAttachmentList: any;
  
  constructor(
    private globals: Globals,
    private CategoryService: CategoryService,
    private router: Router) { }

  ngOnInit() {
    // Call method
    this.attachmentASlider();
    
    jQuery('#AgfolksAccessories .owl-carousel').owlCarousel();
    
  }

  
  /**
   * Define method for slider
   */
  attachmentASlider(): void {
    // Copy objects
    this.attachmentASOptions = Object.assign({}, this.globals.attachmentASOptions);
    // This service subscribe category list
    this.CategoryService.castaAttachmentList.subscribe(aAttachmentList => {
      if (aAttachmentList && aAttachmentList.length) {
        this.aAttachmentList = aAttachmentList;
        let aACID = this.CID;
        let aAPORTAL_URL = this.PORTAL_URL;
        _.map(this.aAttachmentList,function(v){
            v.ImagePath = (v.Image) ? aAPORTAL_URL + 'files/store/types/' + aACID + '/' + v.Image : "./assets/images/no-image.png";
          return v;
        })
      }
    });
    
    /*let cond = {
      cid: this.CID,
      parent_category_id: 234
    };
    this.CategoryService.getCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          // Set data for subscribe categorty list
          this.attachmentASStore = res.data;
        }
      }, (err) => {

      });*/
    
  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

}
