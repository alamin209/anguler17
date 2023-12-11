import { Component, OnInit } from '@angular/core';

// Handle the global property
import { Globals } from '../../common/globals';
import { Router } from '@angular/router';
import { HomeService } from '../../services/home/home.service';
import * as _ from 'lodash';

// Import environment config file.
import { environment } from '../../../environments/environment';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.sass']
})
export class TestimonialsComponent implements OnInit {

  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  Testimonials: any = [];
  
  constructor(
    private globals: Globals,
    private HomeService: HomeService,
    private router: Router) { }

  ngOnInit() {
    // Call method
    this.getTestimonials();
    
    
    
  }

  
  /**
   * Define method for slider
   */
  getTestimonials(): void {
    
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getTestimonials(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          // Set data for subscribe Testimonials list
          this.Testimonials = res.data;
          setTimeout(function(){
              if(jQuery("#HomeTestimonialsCarousel").length) {
                  jQuery("#HomeTestimonialsCarousel").owlCarousel({
                    loop:                 true,
                    autoplay:             true,
                    autoplayHoverPause:   false,
                    nav:                  false,
                    margin:               0,
                    dots:                 true,
                    mouseDrag:            false,
                    touchDrag:            false,
                    smartSpeed:           1100,
                    items:                1,
                    animateIn:            'fadeIn',
                    animateOut:           'fadeOut',
                  });
               }
          },500);
          
        }
      }, (err) => {

    });
    
  }
  
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

}
