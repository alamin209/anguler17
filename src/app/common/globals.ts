import { Injectable } from "@angular/core";
import { OwlOptions } from 'ngx-owl-carousel-o';

@Injectable({
  providedIn: "root",
})
export class Globals {
  developmentKey = true;
  // Define main slider options.
  mainSliderOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayHoverPause: false,
    nav: false,
    margin: 0,
    dots: true,
    mouseDrag: false,
    touchDrag: false,
    smartSpeed: 1100,
    items: 1,
    // animateIn: "fadeIn",
    // animateOut: "fadeOut",
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  };
  // Define main attachments and accessories slider options.
  attachmentASOptions: OwlOptions = {
    loop: false,
    autoplay: true,
    autoplayHoverPause: false,
    nav: false,
    margin: 10,
    dots: true,
    mouseDrag: false,
    touchDrag: false,
    smartSpeed: 1100,
    items: 6,
    responsive: {
      0: {
        items: 2,
      },
      600: {
        items: 4,
      },
      1000: {
        items: 6,
      },
    },
  };

  // Define Featured Products slider options.
  featuredASOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayHoverPause: true,
    nav: true,
    margin: 14,
    dots: false,
    mouseDrag: true,
    touchDrag: true,
    smartSpeed: 1100,
    items: 4,
    responsive: {
      0: {
        items: 2,
      },
      600: {
        items: 3,
      },
      1000: {
        items: 4,
      },
    },
  };

  // Define main Videos slider options.
  videoASOptions: any = {
    margin: 15,
    dots: false,
    navigation: true,
    items: 5,
    loop: false,
    navRewind: false,
    responsive: {
      0: {
        items: 2,
      },
      600: {
        items: 4,
      },
      1000: {
        items: 6,
      },
    },
  };

  // Define dashbord pinned post slider options.
  PinnedPostOptions: any = {
    margin: 10,
    dots: true,
    navigation: true,
    items: 1,
    loop: false,
    navRewind: false,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      800: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  };
  // Define slimscroll attributes
  slimSOptions = {
    position: "right", // left | right
    barBackground: "black", // #C9C9C9
    barOpacity: "0.8", // 0.8
    barWidth: "3", // 10
    barBorderRadius: "20", // 20
    barMargin: "0", // 0
    gridBackground: "#d9d9d9", // #D9D9D9
    gridOpacity: "1", // 1
    gridWidth: "2", // 2
    gridBorderRadius: "20", // 20
    gridMargin: "0", // 0
    alwaysVisible: true, // true
    visibleTimeout: 1000, // 1000
  };
}
