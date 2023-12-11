import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category/category.service';

// Import environment config file.
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.sass']
})
export class CategoryComponent implements OnInit {
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  categoryList: any = [];

  constructor(
    private CategoryService: CategoryService,
    private router: Router) { }

  ngOnInit() {
    
    // This service subscribe category list
    //this.CategoryService.castCategory.subscribe(categoryList => this.categoryList = categoryList);
    
    this.categoryList = [];
    // get featured categories
    this.getFeaturedCategories();

  }

  // Fetch shop slider
  getFeaturedCategories(): void {
    // Set conditions
    let cond = { 
      cid: this.CID,
      parent_category_id:'',
      limit:5
    };
      this.CategoryService.getFeaturedCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data) {
            this.categoryList = (res.data && res.data.length) ? res.data:[]; // Set slider data
        }
      }, (err) => {

      });
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
  
}
