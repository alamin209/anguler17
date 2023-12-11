import { Component, OnInit, NgModule, Input, Output,TemplateRef, ViewChild, ViewEncapsulation, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from '@angular/common';
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, Validators, FormGroup, FormArray } from "@angular/forms";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { UserService } from "../../../services/auth/user.service";
import { ToastrService } from "ngx-toastr";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

// Import environment config file.
import { environment } from "../../../../environments/environment";
import { CategoryService } from "../../../services/category/category.service";
import { StoreService } from "../../../services/store/store.service";
import { CountriesService } from "../../../services/countries/countries.service";

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-product_form",
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.sass","../../../../assets/css/memberpage.css"],
  encapsulation: ViewEncapsulation.None
})

export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  packages: FormArray;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  GOOGLE_PLACES_SEARCH_API: boolean = environment.config.GOOGLE_PLACES_SEARCH_API;
  resourcesList: Array<any>;
  newUUid: string;
  UserToken: string;
  productData: any;
  userData: any;
  cond: any;
  getParams: any;
  qQueryString: any;
  categorySlug: string;
  categoryList: any;
  catsList: any = [];
  packageTypeList: any = [];
  packageNumberItems: any = [];
  countryList: any = [];
  stateList: any = [];
  findSelectedCategories: any;
  localStorage: any;
  memberID: string;
  ImageData: any;
  imageFile: any;
  imageURL: any;
  PictureExist: any;
  editor: any;
  multiSelectTags: any;
  recId: any;
  removeImage: any;
  submitted = false;
  numberRegEx: any;
  ImageUploadMultiple: any = [];
  ImagePreviewMultiple: any = [];
  DocsUploadMultiple: any = [];
  DocsPreviewMultiple: any = [];
  FilesUploadMultiple: any = [];
  FilesPreviewMultiple: any = [];
  formattedAddress: string;
  DiscountTypeVal: string;
  ProductType: string;
  Product_Status: string;
  ShipmentType:any;
  Taxable:any;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private StoreService: StoreService,
    private CountriesService: CountriesService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    public zone: NgZone,
    private location: Location
  ) {
    // Set translate language
    translate.setDefaultLang("en");
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
    this.editor = ClassicEditor;
  }

  ngOnInit() {
    this.productData = "";
    this.DiscountTypeVal = "";
    this.ProductType = this.route.snapshot.params.ptype;
    this.Product_Status = "1";
    this.ShipmentType = "Free";
    this.Taxable = 'No';
    this.PictureExist = false;
    this.recId = '';
    if(this.route.snapshot.params.pId){
      this.recId = this.route.snapshot.params.pId;
    }
    if(this.ProductType == 'Digital' && this.recId == ''){
      jQuery('#Digital').click();
    }
    this.multiSelectTags = {
      primaryKey: "ID",
      labelKey: "Category_Name",
      enableCheckAll: false
    }
    for(var tmp = 1;tmp<=100;tmp++){
      this.packageNumberItems.push(tmp);
    }

    this.numberRegEx = /\-?\d*\.?\d{1,2}/;

    this.productForm = this.formBuilder.group({
      ProductType: [""],
      id: [""],
      title: ["", Validators.required],
      Categories: [""],
      Product_Video: [""],
      short_desc: ["", Validators.required],      
      //price: ["", [Validators.pattern(this.numberRegEx)]],
      price: ["", Validators.required],
      DiscountType: [""],
      Discount: [""],
      taxable: [""],
      Product_Stock: [""],
      Product_TaxAmount: [""],
      product_desc: [""],
      product_spec: [""],
      Warehouse_Name: [""],
      Warehouse_Email: [""],
      Phone: [""],
      Address: [""],
      Address2: [""],
      City: [""],
      State: [""],
      ZIP: [""],
      Country: [""],
      Latitude: [""],
      Longitude: [""],
      Shipment: ["",Validators.required],
      Product_Shipping_Free: [""],
      packages: this.formBuilder.array([])
    });
    
    this.get_countries();
    this.get_states('');

    this.checkKeyParam();
    this.get_product_categories();
    this.get_product_packagetypes();    
    

    
    if(this.recId > 0){
      this.load_resource_data();
    } else {
      this.packages = this.productForm.get('packages') as FormArray;
      this.packages.push(this.formBuilder.group({
        package_id: '',
        package_type: '',
        package_length: '',
        package_width: '',
        package_height: '',
        package_weight: '',
        shipment_value: '',
        package_items: ''
      }));
      
    }
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      package_id: '',
      package_type: '',
      package_length: '',
      package_width: '',
      package_height: '',
      package_weight: '',
      shipment_value: '',
      package_items: ''
    });
  }

  SaveAs(value): void {
    this.Product_Status = value;
  }
  SetProductType(value): void {
    this.ProductType = value;
    if(this.recId == ''){
      this.changeRouter('member/products/'+this.ProductType+'/add');
    }
  }

  SetShipment(value): void {
    this.ShipmentType = value;
  }
  SetTaxable(value): void {
    this.Taxable = value;
  }

  SetDiscountType(value): void {
    this.DiscountTypeVal = value;
  }

  addItem(): void {
    this.packages = this.productForm.get('packages') as FormArray;
    this.packages.push(this.createItem());
  }
  
  get_countries(){
    this.CountriesService.getCountries().subscribe(res => {
      if (res && res.data && res.data.length) {
        this.countryList = res.data;
        
      }
    });
  }
  get_states(country){
    let cond = {
      country: country
    };
    this.CountriesService.getStates(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.stateList = res.data;
        if(this.recId > 0){} else {
          this.productForm.patchValue({
            State: this.userData.state
          });
        }
      } else {
        this.stateList = [];
      }
    });
  }
  onChangeCountry(country){
    this.get_states(country);
  }
  load_resource_data(){
    let cond = {
      cid: this.CID,
      recId: this.recId
    };
    this.StoreService.getProductSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
          this.productForm.patchValue({
            id: res.data[0].ID,
            title: res.data[0].Product_Name, 
            ProductType: res.data[0].ProductType,  
            Product_Video: res.data[0].Product_Video,
            short_desc: res.data[0].Product_Short_Description,
            price: res.data[0].Product_Price,
            DiscountType:  res.data[0].DiscountType,
            Discount:  res.data[0].Discount,
            taxable: res.data[0].Product_Taxable,
            Product_Stock: res.data[0].Product_Stock,
            product_desc: res.data[0].Product_Description,
            product_spec: res.data[0].Specifications,
            Warehouse_Name: res.data[0].Warehouse_Name,
            Warehouse_Email: res.data[0].Warehouse_Email,
            Phone: res.data[0].Phone,
            Address: res.data[0].Address,
            Address2: res.data[0].Address2,
            City: res.data[0].City,
            State: res.data[0].State,
            ZIP: res.data[0].ZIP,
            Country: res.data[0].Country,
            Shipment: res.data[0].Shipping,
            Product_Shipping_Free: res.data[0].Product_Shipping_Free,
            Product_TaxAmount: res.data[0].Product_TaxAmount
          });
          
          this.ShipmentType = res.data[0].Shipping;
          this.Taxable = res.data[0].Product_Taxable;

          this.get_states(res.data[0].Country);
          setTimeout(() => {  
            jQuery(".address1").val(res.data[0].Address);
          },1000);

          this.ProductType = res.data[0].ProductType;
          
          this.Product_Status = res.data[0].Product_Status;
          jQuery("#"+this.ProductType).click();
          

          // console.log(res.data[0].packages.length);
          if(typeof res.data[0].packages != "undefined" && res.data[0].packages.length > 0){
            var packages = res.data[0].packages;

            this.packages = this.productForm.get('packages') as FormArray;
            for(var tmp = 0;tmp<packages.length;tmp++){
              this.packages.push(this.formBuilder.group({
                package_id: packages[tmp]['ID'],
                package_type: packages[tmp]['Packaging_Type'],
                package_length: packages[tmp]['Packaging_Length'],
                package_width: packages[tmp]['Packaging_Width'],
                package_height: packages[tmp]['Packaging_Height'],
                package_weight: packages[tmp]['Packaging_Weight'],
                shipment_value: packages[tmp]['ShipmentValue'],
                package_items: packages[tmp]['NumberofItems']
              }));
            }
          } else {
            this.packages = this.productForm.get('packages') as FormArray;
            this.packages.push(this.formBuilder.group({
              package_id: '',
              package_type: '',
              package_length: '',
              package_width: '',
              package_height: '',
              package_weight: '',
              shipment_value: '',
              package_items: ''
            }));
          }

          var resCategory = res.data[0].resCategory;
          var catSelArr = [];
          if(resCategory){
            var resCatArr = resCategory.split(",");
            resCatArr.map(function(vl){
              var singleValArr = vl.split("<->");
              if(singleValArr.length > 0){
                let singlePush = new Array();
                singlePush['ID'] = singleValArr[0];
                singlePush['Category_Name'] = singleValArr[1];
                catSelArr.push(singlePush);
              }
            });
          }
          if(catSelArr.length > 0){
            this.productForm.patchValue({
              Categories: catSelArr
            });
          }

          /*if(res.data[0].Image != ''){
            this.imageURL = res.data[0].Image;
            this.PictureExist = true;
          }*/
      }
    }, (err) => {});

    this.StoreService.getProductImagesSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.ImagePreviewMultiple = res.data;
      }
    });

    this.StoreService.getProductDocsSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.DocsPreviewMultiple = res.data;
      }
    });

    this.StoreService.getProductOrderFiles(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.FilesPreviewMultiple = res.data;
      }
    });

  }

  onItemSelect(item:any){
    // console.log(item);
    // console.log(this.selectedItems);
  }
  OnItemDeSelect(item:any){
    // console.log(item);
    // console.log(this.selectedItems);
  }
  onSelectAll(items: any){
    // console.log(items);
  }
  onDeSelectAll(items: any){
    // console.log(items);
  }

  checkKeyParam() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      
      if(this.recId > 0){} else {

        this.productForm.patchValue({
          Warehouse_Name: this.userData.first_name+' '+this.userData.last_name,
          Warehouse_Email: this.userData.email,
          Phone: this.userData.phone,
          Address: this.userData.address,
          Address2: this.userData.address2,
          City: this.userData.city,
          ZIP: this.userData.zip,
          State: this.userData.state,
          Country: this.userData.country
        });

        this.get_states(this.userData.country);
        
        jQuery(".address1").val(this.userData.address);

        if(this.userData.country == ''){
          this.productForm.patchValue({
            'Country': 'US',
          });
        }

        this.productForm.patchValue({
          'package_type': '02',
          'Shipment': 'Free',
          'taxable': 'No',
          'Discount ': ''
        });

        this.ShipmentType = 'Free';
        this.Taxable = 'No';

      }

      // get user token
      this.UserToken = localStorage.getItem("token");

    });
    if(typeof this.userData.SellerPackage != 'undefined' && this.userData.SellerPackage == 'Yes'){} else {
      this.changeRouter('member/subscription');
    }

    // get url params
    this.categorySlug = this.route.snapshot.params.category;
    // get query string
    this.getParams = this.route.snapshot.queryParamMap;
    this.getParams = qs.parse(this.getParams.params);

    // when searching with keyword from mobile view
    if (this.getParams && this.getParams.q) {
      this.qQueryString = this.getParams.q;
    }

    this.cond = {
      cid: this.CID,
    };
  }

  
  // get Products tags list from db
  get_product_categories() {
    let cond = {
      cid: this.CID,
    };
    this.CategoryService.getCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.catsList = res.data;
        }
      }, (err) => {});
  }

  get_product_packagetypes() {
    let cond = {
      cid: this.CID,
    };
    this.StoreService.getStoreUPSPackagingTypes(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          //console.log(res.data);
          this.packageTypeList = res.data;
          jQuery(".address1").val(this.userData.address);
          this.productForm.patchValue({
            State: this.userData.state,
          });

        }
      }, (err) => {});
  }

  makeRandom() {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const lengthOfCode = 8;
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }  

  processFile(files: any) { 

    if (files.length === 0) return;

    var err = '';
    const numberOfFiles = files.length;
    for (let i = 0; i < numberOfFiles; i++) {
      const value = files[i];
      if(typeof value != "undefined" && typeof value.type != "undefined"){
        var mimeType = value.type;
        if (mimeType.match(/image\/*/) == null) {        
          err = '1';
        }
      } else {
        err = '1';
      }
    }

    if(err == '1'){
      this.toastr.error("Only images are supported.", "Error!");
      return;
    }

    if(files && files[0]){      
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          //console.log(e.target.result);
          var rand = this.makeRandom();
          this.ImageUploadMultiple.push({
            randId: rand,
            filename: files[i].name,
            filesize: files[i].size,
            filetype: files[i].type,
            value: e.target.result,
          });
          this.ImagePreviewMultiple.push({
            ID: '',
            randId: rand,
            Image: e.target.result
          })
        };
        reader.readAsDataURL(files[i]);
      }
    }

  }

  processDocs(files: any) { 

    if (files.length === 0) return;

    var err = '';
    const numberOfFiles = files.length;
    for (let i = 0; i < numberOfFiles; i++) {
      const value = files[i];
      if(typeof value != "undefined" && typeof value.type != "undefined"){
        var mimeType = value.type;
        if (mimeType.match(/pdf\/*/) == null) {        
          err = '1';
        }
      } else {
        err = '1';
      }
    }

    if(err == '1'){
      this.toastr.error("Only pdf files are supported.", "Error!");
      return;
    }

    if(files && files[0]){      
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          //console.log(e.target.result);
          var rand = this.makeRandom();
          this.DocsUploadMultiple.push({
            randId: rand,
            filename: files[i].name,
            filesize: files[i].size,
            filetype: files[i].type,
            fileext:files[i].name.split('.').pop(),
            value:e.target.result,
          });
          this.DocsPreviewMultiple.push({
            ID: '',
            randId: rand,
            file_type:files[i].name.split('.').pop(),
            file_name: files[i].name,
            Image: e.target.result
          })

        };
        reader.readAsDataURL(files[i]);
      }
    }

  }

  processOrderFiles(files: any) { 

    console.log(files);
    if (files.length === 0) return;
    console.log(files);
    var err = '';
    const numberOfFiles = files.length;
    for (let i = 0; i < numberOfFiles; i++) {
      const value = files[i];
      if(typeof value != "undefined" && typeof value.type != "undefined"){
        var mimeType = value.type;
        if (mimeType.match(/pdf\/*/) == null) {        
          err = '1';
        }
      } else {
        err = '1';
      }
    }

    if(err == '1'){
      //this.toastr.error("Only files are supported.", "Error!");
      //return;
    }

    if(files && files[0]){      
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          //console.log(e.target.result);
          var rand = this.makeRandom();
          this.FilesUploadMultiple.push({
            randId: rand,
            filename: files[i].name,
            filesize: files[i].size,
            filetype: files[i].type,
            fileext:files[i].name.split('.').pop(),
            value:e.target.result,
          });
          this.FilesPreviewMultiple.push({
            ID: '',
            randId: rand,
            file_type:files[i].name.split('.').pop(),
            file_name: files[i].name,
            Image: e.target.result
          })
          
          console.log(this.FilesUploadMultiple);
          console.log(this.FilesPreviewMultiple);
          
        };
        reader.readAsDataURL(files[i]);
      }
    }

  }

  onSubmit(productData) {

    this.submitted = true;
    
    console.log('submitted');
    this.productForm.controls["Categories"].setErrors(null);
    this.productForm.controls["Product_Video"].setErrors(null);
    this.productForm.controls["Discount"].setErrors(null);
    this.productForm.controls["product_spec"].setErrors(null);
    this.productForm.controls["Warehouse_Name"].setErrors(null);
    this.productForm.controls["Warehouse_Email"].setErrors(null);
    this.productForm.controls["Phone"].setErrors(null);
    this.productForm.controls["Address"].setErrors(null);
    this.productForm.controls["Address2"].setErrors(null);
    this.productForm.controls["City"].setErrors(null);
    this.productForm.controls["State"].setErrors(null);
    this.productForm.controls["ZIP"].setErrors(null);
    this.productForm.controls["Latitude"].setErrors(null);
    this.productForm.controls["Longitude"].setErrors(null);
    this.productForm.controls["Product_Shipping_Free"].setErrors(null);
    this.productForm.controls["Product_TaxAmount"].setErrors(null);
 

    if (this.productForm.valid) {
      var tagArr = productData.Categories;
      if(tagArr.length){
        var tagArr2 = [];
        tagArr.map(function(val){
          if(typeof val.ID != "undefined" && val.ID != '')
            tagArr2.push(val.ID);
          else if(val != '')
            tagArr2.push(val);

          productData.Categories = tagArr2;
        });
      }
      productData["CID"] = this.CID;
      productData["ProductType"] = this.ProductType;
      productData["Product_Status"] = this.Product_Status;
      productData["creatorId"] = (typeof this.userData.id != "undefined" && this.userData.id != "" ? this.userData.id : '');
      productData['userName'] = this.userData.first_name+' '+this.userData.last_name;
      /*if(typeof this.ImageData != 'undefined' && this.ImageData != '')
        productData["ImageData"] = this.ImageData;*/

      if(typeof this.ImageUploadMultiple != 'undefined' && this.ImageUploadMultiple != '')
        productData["ImageUploadMultiple"] = this.ImageUploadMultiple;      

      if(typeof this.DocsUploadMultiple != 'undefined' && this.DocsUploadMultiple != '')
        productData["DocsUploadMultiple"] = this.DocsUploadMultiple;      

      if(typeof this.FilesUploadMultiple != 'undefined' && this.FilesUploadMultiple != '')
        productData["FilesUploadMultiple"] = this.FilesUploadMultiple;      

      productData["PProfilePic"] = this.PictureExist;
      //productData["removeImage"] = this.removeImage;

      
      //console.log(productData);return;
      
      // call service for edit user
      this.StoreService.SaveProductSeller(productData).subscribe(
        (res) => {
          // show message
          this.translate
            .get("PRODUCT_ADDED_SUCCESSFULLY")
            .subscribe((res: string) => {
              this.toastr.success(res, "Success!");
              this.ImageUploadMultiple = [];
              this.DocsUploadMultiple = [];
              this.FilesUploadMultiple = [];
              //this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Shop");
              
              //this.changeRouter('member/products?type='+this.ProductType);
              window.location.href = location.origin + '/member/products?type='+this.ProductType;
              
            });
          // reset from
          //this.productForm.reset();
        },
        (error: any) => {
          if (error.error.error) {
            this.toastr.error(error.error.error, "Error!");
          }
        }
      );
    }
  }

  RemovePic(imgObj): void {
    var imgId = imgObj.ID;
    var randId = typeof imgObj.randId != "undefined" ? imgObj.randId : '';
    // console.log(imgId);console.log(randId);
    // return;
    if(randId != ""){
      var imgPrev = this.ImagePreviewMultiple;
      for(var i=0;i<imgPrev.length;i++){
        if(typeof imgPrev[i].randId != 'undefined' && imgPrev[i].randId == randId){
          delete imgPrev[i];
        }
      }
      imgPrev = Object.values(imgPrev);
      this.ImagePreviewMultiple = imgPrev;

      var imgUpl = this.ImageUploadMultiple;
      for(var i=0;i<imgUpl.length;i++){
        if(typeof imgUpl[i].randId != 'undefined' && imgUpl[i].randId == randId){
          delete imgUpl[i];
        }
      }
      imgUpl = Object.values(imgUpl);
      this.ImageUploadMultiple = imgUpl;
    } else {
      if(confirm("Are you sure you want to delete this image")) {
        let cond = {
          CID: this.CID,
          recId: imgId
        };
        this.StoreService.deleteProductImagesSingle(cond).subscribe(res => {
          if (res && res.error == false) {
            var imgPrev = this.ImagePreviewMultiple;
            for(var i=0;i<imgPrev.length;i++){
              if(typeof imgPrev[i].ID != 'undefined' && imgPrev[i].ID == imgId){
                delete imgPrev[i];
              }
            }
            imgPrev = Object.values(imgPrev);
            this.ImagePreviewMultiple = imgPrev;
            this.toastr.success('Image deleted successfully', "Success!");
          } else {
            this.toastr.error("Error in deleting image. Try again later", "Error!");
          }
          //console.log(this.ImagePreviewMultiple);
        });
      }
    }
    // console.log(this.ImagePreviewMultiple);
    /*this.imageURL = "";
    this.PictureExist = "";
    this.ImageData = "";
    this.removeImage = "1";*/
  }

  RemoveDocs(imgObj): void {
    var imgId = imgObj.ID;
    var randId = typeof imgObj.randId != "undefined" ? imgObj.randId : '';
    // console.log(imgId);console.log(randId);
    // return;
    if(randId != ""){
      var imgPrev = this.DocsPreviewMultiple;
      for(var i=0;i<imgPrev.length;i++){
        if(typeof imgPrev[i].randId != 'undefined' && imgPrev[i].randId == randId){
          delete imgPrev[i];
        }
      }
      imgPrev = Object.values(imgPrev);
      this.DocsPreviewMultiple = imgPrev;

      var imgUpl = this.DocsUploadMultiple;
      for(var i=0;i<imgUpl.length;i++){
        if(typeof imgUpl[i].randId != 'undefined' && imgUpl[i].randId == randId){
          delete imgUpl[i];
        }
      }
      imgUpl = Object.values(imgUpl);
      this.DocsUploadMultiple = imgUpl;
    } else {
      if(confirm("Are you sure you want to delete this document")) {
        let cond = {
          CID: this.CID,
          recId: imgId
        };
        this.StoreService.deleteProductDocsSingle(cond).subscribe(res => {
          if (res && res.error == false) {
            var imgPrev = this.DocsPreviewMultiple;
            for(var i=0;i<imgPrev.length;i++){
              if(typeof imgPrev[i].ID != 'undefined' && imgPrev[i].ID == imgId){
                delete imgPrev[i];
              }
            }
            imgPrev = Object.values(imgPrev);
            this.DocsPreviewMultiple = imgPrev;
            this.toastr.success('Deleted successfully', "Success!");
          } else {
            this.toastr.error("Error in deleting document. Try again later", "Error!");
          }

        });
      }
    }
  }

  RemoveOrderFile(imgObj): void {
    var imgId = imgObj.ID;
    var randId = typeof imgObj.randId != "undefined" ? imgObj.randId : '';
    // console.log(imgId);console.log(randId);
    // return;
    if(randId != ""){
      var imgPrev = this.FilesPreviewMultiple;
      for(var i=0;i<imgPrev.length;i++){
        if(typeof imgPrev[i].randId != 'undefined' && imgPrev[i].randId == randId){
          delete imgPrev[i];
        }
      }
      imgPrev = Object.values(imgPrev);
      this.FilesPreviewMultiple = imgPrev;

      var imgUpl = this.FilesUploadMultiple;
      for(var i=0;i<imgUpl.length;i++){
        if(typeof imgUpl[i].randId != 'undefined' && imgUpl[i].randId == randId){
          delete imgUpl[i];
        }
      }
      imgUpl = Object.values(imgUpl);
      this.FilesUploadMultiple = imgUpl;
    } else {
      if(confirm("Are you sure you want to delete this document")) {
        let cond = {
          CID: this.CID,
          recId: imgId
        };
        this.StoreService.deleteProductOrderFiles(cond).subscribe(res => {
          if (res && res.error == false) {
            var imgPrev = this.FilesPreviewMultiple;
            for(var i=0;i<imgPrev.length;i++){
              if(typeof imgPrev[i].ID != 'undefined' && imgPrev[i].ID == imgId){
                delete imgPrev[i];
              }
            }
            imgPrev = Object.values(imgPrev);
            this.FilesPreviewMultiple = imgPrev;
            this.toastr.success('Deleted successfully', "Success!");
          } else {
            this.toastr.error("Error in deleting document. Try again later", "Error!");
          }

        });
      }
    }
  }


  removePackage(i): void {
    (this.productForm.get('packages') as FormArray).removeAt(i);
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  memberPage(): void{
    // this.changeRouter('shop/seller/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id+"?tabselected=Shop");
    this.changeRouter('member/products');
  }

  getAddress(place: object, addressName: string) {
    let address1 = "",
      streetNumber,
      street,
      city,
      state,
      country,
      postCode,
      Latitude,
      Longitude;
    streetNumber = this.getAddrComponent(place, { street_number: "long_name" });
    street = this.getAddrComponent(place, { route: "long_name" });
    country = this.getAddrComponent(place, { country: "short_name" });
    if (streetNumber) {
      address1 = streetNumber;
    }
    if (street) {
      address1 = address1 + " " + street;
    }

    city = this.getAddrComponent(place, { locality: "long_name" });
    state = this.getAddrComponent(place, {
      administrative_area_level_1: "long_name",
    });
    postCode = this.getAddrComponent(place, { postal_code: "long_name" });

    Latitude = place["geometry"]["location"].lat();
    Longitude = place["geometry"]["location"].lng();
    this.zone.run(() => (this.formattedAddress = place["formatted_address"]));

    jQuery(".address1").val(address1);
    this.productForm.controls["Address"].setValue(address1);
    this.productForm.controls["Address2"].setValue("");
    this.productForm.controls["City"].setValue(city);
    this.productForm.controls["State"].setValue(state);
    this.productForm.controls["ZIP"].setValue(postCode);
    this.productForm.controls["Country"].setValue(country);
    this.productForm.controls["Latitude"].setValue(Latitude);
    this.productForm.controls["Longitude"].setValue(Longitude);

    this.get_states(country);

    if (country == "TT") {
      this.productForm.controls.State.setValue("");
      this.productForm.controls.ZIP.setValue("");
    } else {
      this.productForm.controls.State.setValue(state);
      this.productForm.controls.ZIP.setValue(postCode);
    }

    jQuery(".address1").click();
  }

  getAddrComponent(place, componentTemplate) {
    let result;

    for (let i = 0; i < place.address_components.length; i++) {
      const addressType = place.address_components[i].types[0];
      if (componentTemplate[addressType]) {
        result = place.address_components[i][componentTemplate[addressType]];
        return result;
      }
    }
    return;
  }

  // for model 
  openModalPopup(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }


}