import { Injectable } from '@angular/core';
import { Cancion } from 'src/app/clases/Cancion';



@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  public letra: {words:string, second:number}[] = []
  public fileName: string = '';
  public cancion: Cancion= new Cancion();

}
