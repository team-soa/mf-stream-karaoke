import { Injectable } from '@angular/core';
import { Cancion } from 'src/app/clases/Cancion';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  public letra: {words:string, second:number}[] = []
  public fileName: string = '';
  // public cancion: Cancion = new Cancion();
  public cancion: Cancion = {
    "nombre": "Summer",
    "artista": "Calvin Harris",
    "letra": [
      {
        "second": 1,
        "words": "When I met you in the summer"
      },
      {
        "second": 3,
        "words": "To my heartbeat sound"
      },
      {
        "second": 5,
        "words": "We fell in love"
      },
      {
        "second": 8,
        "words": "As the leaf..."
      },
      {
        "second": 11,
        "words": ""
      }
    ],
    _id: '',
    album: '',
    owner: '',
    url: '../assets/input1.wav',
    filename: ''
  }
}
