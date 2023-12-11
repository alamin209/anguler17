// @ts-ignore
import { Component, OnInit, HostListener, ViewChild, Input, ElementRef} from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

// Handle the global property
import { Globals } from '../../common/globals';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { jarallax } from 'jarallax';
// import {
//   jarallax,
//   jarallaxElement,
//   jarallaxVideo
// } from 'jarallax';


// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.sass']
})
export class SliderComponent implements OnInit {
  mainSliderOptions: any = {};
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  slidesStore: any = [];
  @Input() sliderData;
  @Input() ISHomePage;
  constructor(private globals: Globals, private activatedRoute: ActivatedRoute) { 

    // get activated route  
    this.activatedRoute.url.subscribe(url => {      
      // Call slider method
      this.mainSlider();
    });
  }

  ngOnInit() {
    // Call slider method
    this.mainSlider();

    jQuery('#HeroSlider .owl-carousel').owlCarousel();

    setTimeout(function(){
    
        // jarallaxVideo();
        // jarallaxElement();
        let _jarallax = jarallax(document.querySelectorAll('.jarallax'), {
          videoVolume: 10,
          speed:                  0.2,
          videoLoop:              true,
          videoLazyLoading:       true,
          videoPlayOnlyVisible:   true,
          //videoSrc: 'https://www.youtube.com/watch?v=ab0TSkLe-E0'
          //disableParallax:        /iPad|iPhone|iPod|Android/,
          onInit: function () {
            var self = this;
            var video = self.video;
            if (video) {
              video.unmute();
            }
          }
        });
    },1000);
    
  }
  
  

  /**
   * Define method for slider
   */
  mainSlider(): void {
    // Copy objects
    this.mainSliderOptions = Object.assign({}, this.globals.mainSliderOptions);

    if (this.sliderData && this.sliderData.length) {
        let _PORTAL_URL = this.PORTAL_URL;
        let _CID = this.CID;
        _.map(this.sliderData, function (v) {
            let vimage = v.slider_image;
            //console.log(vimage);
            if(v.is_video == 1 && !vimage.includes(".com")){
                //alert('asdsadsad');
                v.video = _PORTAL_URL+'newcms/files/slider/'+_CID+'/'+v.slider_image;
                /*
                jarallax(document.querySelectorAll('.jarallax'), {
                    videoSrc: 'https://www.youtube.com/watch?v=ab0TSkLe-E0'
                    //disableParallax:        /iPad|iPhone|iPod|Android/
                });
                */
            }
        })
    }

    this.slidesStore = this.sliderData;
    
    
    
  }

}
