import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { UserService } from "../../../services/auth/user.service";

import { ToastrService } from "ngx-toastr";

// Import environment config file.
import { environment } from "../../../../environments/environment";
import { CategoryService } from "../../../services/category/category.service";
import { VideoService } from "../../../services/video/video.service";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-member-add-video",
  templateUrl: "./add-video.component.html",
  styleUrls: ["./add-video.component.sass","../../../../assets/css/memberpage.css"],
})
export class AddVideoComponent implements OnInit {
  videoForm: FormGroup;
  CID: Number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  MARKETPLACE: boolean = environment.config.MARKETPLACE;
  videoList: Array<any>;
  newUUid: string;
  UserToken: string;
  videoData: any;
  videoSingle:any;
  userData: any;
  getParams: any;
  cond: any;
  qQueryString: any;
  categorySlug: string;
  categoryList: any;
  channelList: any;
  tagList: any;
  findSelectedCategories: any;
  localStorage: any;
  memberID: string;
  sameUserView: string;
  ImageData: any;
  imageFile: any;
  imageURL: any;
  videoFile: any;
  videoURL: any;
  PictureExist: any;
  VideoExist: any;
  editor: any;
  multiSelectTags: any;
  recId: any;
  removeImage: any;
  removeVideo: any;
  submitted = false;
  videoIcon = 'assets/images/videoicon.png';
  _Uploading = false;
  tags: any;
  vvideoURL: any;
  FetchedVideo: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private UserService: UserService,
    private CategoryService: CategoryService,
    private VideoService: VideoService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) {
    // Set translate language
    translate.setDefaultLang("en");
    // Generate new uuid for product cart
    this.newUUid = uuid.v4();
  }

  ngOnInit() {

    this.vvideoURL = '';
    this.videoData = "";
    this.ImageData = "";
    this.videoURL = "";
    this.PictureExist = false;
    this.FetchedVideo = false;
    this.tags = [];
    this.recId = this.route.snapshot.params.videoId;
    if(this.recId > 0){
      this.load_video_data();
    }
    this.checkKeyParam();
    this.get_video_categories();
    this.get_video_channels();
    this.get_video_tags();
    this.multiSelectTags = {
      primaryKey: "ID",
      labelKey: "name",
      enableCheckAll: false
    }

    this.videoForm = this.formBuilder.group({
      id: [""],
      Video_Url: ["", Validators.required],
      title: ["", Validators.required],
      desc: [""],
      category: ["", Validators.required],
      channel: [""],
      duration: [""],
      videoupload: [""],
      tags: [""],
      Video_Type: [""],
      Video_Source: [""],
      Video_Unique_Id: [""],
      Video_Time:[""],
      Video_Thumbnail_Large:[""]
    });
  }

  checkKeyParam() {
    // brodcast data for login user
    this.userData = "";
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe((userData) => {
      this.userData = userData;
      this.userData;
      // get user token
      this.UserToken = localStorage.getItem("token");
    });
    if(this.userData != null){
      if(typeof this.userData.id != "undefined" && this.userData.id != "" && this.userData.id == this.memberID){
        this.sameUserView = '1';
      }
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

  onAdd(item) {
    this.tags.push(item.value);
  }

  SetVideoURL(value): void {
    this.vvideoURL = value;
  }

  GetVideoMeta(){

    if(this.vvideoURL != ''){

      let cond = {
        cid: this.CID,
        vvideoURL: this.vvideoURL
      };
      this.VideoService.getVideoMeta(cond).subscribe(res => {
        if (res && res.data) {

          this.FetchedVideo = true;

          this.videoForm.patchValue({
            title: res.data.title,
            desc: res.data.description,
            Video_Unique_Id: res.data.uniqueId,
            Video_Time: res.data.duration,
            Video_Thumbnail_Large: res.data.thumbnail_large,
            Video_Source: 'youtube',
            Video_Type: 'youtube'
          });

          this.imageURL = res.data.thumbnail_large;

        }
      }, (err) => {});
    }else{
      this.toastr.error('Enter Video URL first.');
    }
  }

  load_video_data(){
    let cond = {
      cid: this.CID,
      recId: this.recId
    };
    this.VideoService.getVideoDetailsSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.videoSingle = res.data[0];
        let _Tags = res.data[0].Tags;
        this.tags = _Tags.split(",");

        this.videoForm.patchValue({
          title: res.data[0].Video_Title,
          Video_Url: res.data[0].Video_Url,
          Video_Type: res.data[0].Video_Type,
          Video_Source: res.data[0].Video_Source,
          Video_Unique_Id: res.data[0].Video_Unique_Id,
          Video_Time: res.data[0].Video_Time,
          Video_Thumbnail_Large: res.data[0].Video_Thumbnail_Large,
          desc: res.data[0].Video_Description,
          category: res.data[0].CategoryId,
          channel: res.data[0].ChannelId,
          duration: res.data[0].Video_Time,
          id: res.data[0].ID,
          tags: this.tags
        });
        if(res.data[0].Video_Url != ''){
          this.videoURL = this.videoIcon;
          this.VideoExist = true;
        }
        if(res.data[0].Video_Thumbnail_Large != ''){
          this.imageURL = res.data[0].Video_Thumbnail_Large;
        }
      }
    }, (err) => {});
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
  
  // get Video channel list from db
  get_video_channels() {
    let cond = {
      cid: this.CID,
    };
    this.VideoService.getVideoChannels(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.channelList = res.data;
        }
      }, (err) => {});
  }

  // get Video categories list from db
  get_video_categories() {
    let cond = {
      cid: this.CID,
    };
    this.VideoService.getVideoCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.categoryList = res.data;
        }
      }, (err) => {});
  }

  // get Video tags list from db
  get_video_tags() {
    let cond = {
      cid: this.CID,
    };
    this.VideoService.getPVideoTagsMember(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
            this.tagList = res.data;
        }
      }, (err) => {});
  }

  processFile(files: any) {
    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error("Only images are supported.", "Error!");
      return;
    }
    var reader = new FileReader();
    this.imageFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageURL = reader.result;
      this.ImageData = {
        filename: this.imageFile.name,
        filesize: this.imageFile.size,
        filetype: this.imageFile.type,
        value: reader.result,
      };
      this.removeImage = "1";
    };
  }

  processFileVideo(files: any) {
    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/video\/*/) == null) {
      this.toastr.error("Only video files are supported.", "Error!");
      return;
    }
    var reader = new FileReader();
    this.videoFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.videoURL = this.videoIcon;//reader.result;
      this.videoData = {
        filename: this.videoFile.name,
        filesize: this.videoFile.size,
        filetype: this.videoFile.type,
        value: reader.result,
      };
      this.removeVideo = "1";
    };
  }

  onSubmit(videoData) {
    this.submitted = true;

    if (this.videoForm.valid) {
      this._Uploading = true;
      videoData['CID'] = this.CID;
      videoData['authToken'] = localStorage.getItem("token");
      videoData['VideoData'] = this.videoData;
      videoData['ImageData'] = this.ImageData;
      videoData['tags'] = this.tags;
      videoData['userId'] = this.userData.id;
      videoData['userName'] = this.userData.first_name+' '+this.userData.last_name;
      videoData["creatorId"] = (typeof this.userData.id != "undefined" && this.userData.id != "" ? this.userData.id : '');
      videoData["removeImage"] = this.removeImage;
      videoData["removeVideo"] = this.removeVideo;
      

      videoData["categoryName"] = '';
      this.categoryList.map(function(v){
        if(v.ID = videoData.category){
          videoData["categoryName"] = v.name;
        }
      });
      this.VideoService.addVideo(videoData).subscribe((res) => {
        this.toastr.success('Updated Successfully.', 'Success!');
        //this.changeRouter('member/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id);
        this.changeRouter('member/products?type=Videos');
      }, (error: any) => {
        if (error.error.error) {
          this._Uploading = false;
          this.toastr.error(error.error.error, 'Error!');
        }
      });
      // console.log(videoData);return;
    }
  }

  RemovePic(): void {
    this.imageURL = "";
    this.PictureExist = "";
    this.ImageData = "";
    this.removeImage = "1";
  }

  RemoveVdo(): void {
    this.videoURL = "";
    this.VideoExist = "";
    this.videoData = "";
    this.removeVideo = "1";
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  memberPage(): void{
    //this.changeRouter('member/'+this.userData.first_name+'-'+this.userData.last_name+"-"+this.userData.id);
    this.changeRouter('member/products?type=Videos');
  }
}