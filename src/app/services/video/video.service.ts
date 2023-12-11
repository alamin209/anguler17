import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import * as qs from 'qs';

// Import environment config file.
import { environment } from '../../../environments/environment';
import {IUser, IManufacturer, IForgotPassword, IResetPassword,IWishList,IUserAddress,ILikeVideo,IFavoriteVideo,IQueueVideo} from '../../client-schema';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  // Define the class property.
  private url: string = environment.config.API_URL
  private apikey: string = environment.config.APIKEY
  private httpOptions: any;

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        apikey: this.apikey,
        authorization: localStorage.getItem("token") || "",
		'Cache-Control':  'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
    };
  }

    
  /**
   * Upload Video
   */
  uploadVideo(Data: IUser): Observable<any> {
      return this.http.post<[]>(this.url + 'upload_video', Data, this.httpOptions);
  }

  /**
   * Upload Video
   */
  updateVideo(Data: IUser): Observable<any> {
      return this.http.post<[]>(this.url + 'update_video', Data, this.httpOptions);
  }

  /**
   * Add Video
   */
  addVideo(Data: IUser): Observable<any> {
      return this.http.post<[]>(this.url + 'add_video', Data, this.httpOptions);
  }
  
  //get video categories
  getVideoCategories(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'video/categories?' + qs.stringify(cond), this.httpOptions);
  }
  
  //get video channels
  getVideoChannels(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'video/channels?' + qs.stringify(cond), this.httpOptions);
  }
  
  //get videos
  getVideos(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get-videos', Data, this.httpOptions);
    //return this.http.post<[]>(this.url + 'get-videos?' + qs.stringify(cond), this.httpOptions);
  }
  
  //get recent videos
  getRecentVideos(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get-recent-videos', Data, this.httpOptions);
  }
  
  
  
  // get video details
  getVideoDetails(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'video-details?' + qs.stringify(cond), this.httpOptions);
  }

  // get video details
  getVideoDetailsSingle(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'video-details-single?' + qs.stringify(cond), this.httpOptions);
  }
  
  // fetch user videos
  getUserVideos(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get_user_videos', Data, this.httpOptions);
  }
  
  // fetch user videos  and blogs
  getUserBlogsVideos(Data: IUser): Observable<any> {
    return this.http.post<[]>(this.url + 'get_user_blogs_videos', Data, this.httpOptions);
  }
  
  // like video
  LikeVideo(Data: ILikeVideo): Observable<any> {
    return this.http.post<[]>(this.url + 'like_video', Data, this.httpOptions);
  }
  
  // like video
  AddtoLibrary(Data: IFavoriteVideo): Observable<any> {
    return this.http.post<[]>(this.url + 'add_to_favorites', Data, this.httpOptions);
  }
  
  // like video
  Watchlater(Data: IQueueVideo): Observable<any> {
    return this.http.post<[]>(this.url + 'watch_later', Data, this.httpOptions);
  }
  
  // get Video tags
  getPVideoTags(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get-video-tags?' + qs.stringify(cond), this.httpOptions);
  }
  
  // subscribe video channel
  SubscribeChannel(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'subscribe-channel?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get Subscriptions
  getSubscriptions(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get-subscriptions?' + qs.stringify(cond), this.httpOptions);
  }

  // save product QA
  SaveVideoPostMember(data): Observable<any> {
    return this.http.post<[]>(this.url + 'add_edit_video_member', data, this.httpOptions);
  }

  // remove user resource
  DeleteVideoPostMember(cond): Observable<any> {
    return this.http.get<[]>(
      this.url + "delete_video?" + qs.stringify(cond),
      this.httpOptions
    );
  }

  // get Video tags member
  getPVideoTagsMember(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get-video-tags-member?' + qs.stringify(cond), this.httpOptions);
  }

  searchVideos(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'search_videos?' + qs.stringify(cond), this.httpOptions);
  }
  
  // get video details
  getVideoMeta(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'video-meta-details?' + qs.stringify(cond), this.httpOptions);
  }

  // fetch videos by shortcode
  getLatestVideosShortCode(cond): Observable<any> {
    return this.http.get<[]>(this.url + 'get_latest_videos_shortcode?' + qs.stringify(cond), this.httpOptions);
  }
  
}

