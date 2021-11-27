import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Cancion } from 'src/app/clases/Cancion';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  URL = 'http://20.114.105.27:4003/songs'

  constructor(private cookieService: CookieService, private http: HttpClient){}

  // public letra: {words:string, second:number}[] = []
  // public fileName: string = '';
  // // public cancion: Cancion = new Cancion();
  // public cancion: Cancion = {
  //   "nombre": "Summer",
  //   "artista": "Calvin Harris",
  //   "letra": [
  //     {
  //       "second": 1,
  //       "words": "When I met you in the summer"
  //     },
  //     {
  //       "second": 3,
  //       "words": "To my heartbeat sound"
  //     },
  //     {
  //       "second": 5,
  //       "words": "We fell in love"
  //     },
  //     {
  //       "second": 8,
  //       "words": "As the leaf..."
  //     },
  //     {
  //       "second": 11,
  //       "words": ""
  //     }
  //   ],
  //   _id: '',
  //   album: '',
  //   owner: '',
  //   url: '../assets/input1.wav',
  //   filename: ''
  // }

  public getSong(id:string): Observable<Cancion> {
    return this.http.get<Cancion>(this.URL + '/' + id, {headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))});
  }

  public sendAudio(blob: Blob, lyrics: string, language: string):Observable<number> {
    // return this.http.post(this.URL );
    let URL = 'http://20.88.192.88:4006/api/Speech';
    const formData = new FormData();
    formData.set("soundFile", blob);
    return this.http.post<number>(URL, formData, {params: { language: language, phrase: lyrics },headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))});

  }
}
