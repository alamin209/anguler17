import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home/home.service'
import { Router } from '@angular/router';
// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-financing',
  templateUrl: './financing.component.html',
  styleUrls: ['./financing.component.sass']
})
export class FinancingComponent implements OnInit {
  financingPageData: any;
  CID: number = environment.config.CID;
  private path: any;
  pageNotFound : boolean = false;

  constructor(
    private HomeService: HomeService,
    private router: Router) {
  }

  ngOnInit() {
    // calling method
    this.getFinancingPage();
  }

  // Fetch cms page detail data
  getFinancingPage(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      page_name: 'financing'
    };
    this.pageNotFound = false;
    // calling service
    this.HomeService.getFinancingPage(cond)
      .subscribe(res => {
        // get financing page dat
        if (res && res.data && res.data && res.data.pageData) {
          this.financingPageData = res.data.pageData // Set page data
        } else {
          this.financingPageData = {};
          this.pageNotFound = true;
        }
      }, (err) => {

      });
  }

  // redirect to page according to url
  changeRouter(slug): void {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // open global popup
  openModal(slug) {
    // set data by service and open model
    this.HomeService.setPageContent(slug);
  }
}
