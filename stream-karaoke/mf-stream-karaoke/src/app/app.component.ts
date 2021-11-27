import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from 'src/services/player.service';
import { Cancion } from './clases/Cancion';
import * as Recorder from 'recorder-js';

import * as RecordRTC from 'recordrtc';
import { fromEvent } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { hostViewClassName } from '@angular/compiler';
// @ts-ignore
import audioBufferToWav from './audioBufferToWav';

@Component({
  selector: 'mf-stream-karaoke',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mf-stream-karaoke';

  public bubbles = [{ "cssClass": "one" }];
  public isPlaying = false; //Let controls the loop when the song is playing
  public isAudioLoaded = false;
  public song: Cancion = new Cancion(); // the object that will contain the data of the song 
  public lyrics = ""; // the lyrics shown at the top of the screen (main lyrics)
  public nextLyrics = ""; // lyrics to sing after tha ones playing at the moment
  public currentSecs = 0.0; // let me know how many seconds have passed 
  audio = new Audio(); // audio object
  timeDifference = 0;
  public score = 0;

  constructor(private router: Router, private player: PlayerService, private cookie: CookieService) { }

  async ngOnInit() {

    // this.song = this.player.cancion; // we get the song object from the PlayerService
    await this.validating();
    console.log(this.song)
    this.loadAudio(); // Loads the audio and lyrics

    this.player.postArtist(this.song).subscribe(resp => {
      console.log('hola',this.song, resp)
    })
    // await this.player.postArtist(this.song).toPromise();
    await this.player.postSong(this.song).toPromise();

  }

  /**
   * The first action is to load the audio and lyrics
   */
  loadAudio() {
    this.loadLyrics(); //load lyrics
    this.audio.src = this.song.url; // set the source of the audio
    this.audio.load(); // loads the audio
    setTimeout(() => { this.isAudioLoaded = true }, 1300); // wait 1.3 seconds to let the audio load peacefully
  }

  /**
   * Loads the lyrics on the screen
   */
  loadLyrics() {
    let lyrics = this.song.letra; // get the timed lyrics from the song object
    this.lyrics = lyrics[0].words; // set the first lyrics for starter screen
    this.nextLyrics = lyrics[1].words; // set the second lyrics to show

    this.timeDifference = lyrics[1].second - lyrics[0].second;
  }

  /**
   * Lets play and pause the audio
   */
  playAudio() {

    // the audio is stopped and loaded
    if (!this.isPlaying && this.isAudioLoaded) {
      this.audio.play();
      this.isPlaying = true;
      this.refresh(); // We run the karaoke function

    } else {
      // the audio is playing so we pause the audio
      this.audio.pause();
      this.isPlaying = false;
    }

  }

  /**
   * Stops the audio and resets it
   */
  stopAudio() {
    this.loadLyrics();
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }

  /**
   * This is the main function of the karaoke
   */
  refresh() {
    let currentPos = this.currentSecs; // seconds that have played along
    let lyrics = this.song.letra; // get the timed lyrics
    let self = this; // variable switch from this to self
    const interval = setInterval(() => { // set an interval to execute the following code each 0.01 seconds
      // When the audio is playing
      if (self.isPlaying) {
        currentPos = parseFloat(currentPos.toFixed(2));
        self.currentSecs = currentPos;
        lyrics.forEach(async song => { // remember that lyrics are composed of {second: number, words: string} objects
          // If we are at the second where some lyric should play
          if (song.second == currentPos && currentPos >= 1) {
            let blob =  this.recording(this.timeDifference * 1000);

            // update the lyrics
            this.lyrics = song.words;
            let tmpIndex = lyrics.findIndex(tmpsong => (tmpsong.second == song.second));

            if (lyrics[tmpIndex + 1]) {
              this.nextLyrics = lyrics[tmpIndex + 1].words;
              this.timeDifference = lyrics[tmpIndex + 1].second - song.second;
            } else {
              this.nextLyrics = "";
              this.timeDifference = 5;
            }

          }
        })
        currentPos += 0.01;
        // if the words are empty
      } else if (this.lyrics === "") {
        // break out the loop and reset the audio
        clearInterval(interval); this.stopAudio()
      } else {
        // if the audio is paused please break out too
        clearInterval(interval);
      }

    }, 10);
  }

  CloseWindow() {
    this.stopAudio();
    this.router.navigate(['/VistaPrincipal']);
  }

  generateBubble() {
    this.bubbles.push({ "cssClass": "two" });
  }

  newSearch$ = fromEvent(window, "newStream");


  async validating() {
    console.log(this.cookie.get("streamCancion"))
    let idSong = this.cookie.get("streamCancion");
    this.song = await this.player.getSong(idSong).toPromise();
    // this.player.getSong(idSong).subscribe(song => {
    //   console.log("Brayan, felicidades", song)
    //   this.song = song;
    // });


  }

  async recording(sleepTime: number): Promise<Blob> {
    // @ts-ignore
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    let options: RecordRTC.Options = {

      }
      let recorder = new RecordRTC.RecordRTCPromisesHandler(stream, {
        mimeType: "audio/webm;codecs=pcm",
        numberOfAudioChannels: 1,
        sampleRate:23000,
        desiredSampRate: 23000,
        bufferSize: 8192,
        bitsPerSecond: 32000

      });
      recorder.startRecording();

      const sleep = (m: number) => new Promise(r => setTimeout(r, m));
      await sleep(sleepTime);

      await recorder.stopRecording();
      let blob = await recorder.getBlob();


      return new Promise((resolve, reject) => {

        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
          arrayBuffer = event.target!.result;
        };
        var a = document.createElement("a");
        document.body.appendChild(a);

        fileReader.readAsArrayBuffer(blob);
        let tmp = this;

        fileReader.onloadend = function (d) {
          // @ts-ignore
          audioCtx.decodeAudioData(fileReader.result,
            async function (buffer) {
              var wavBuffer: ArrayBuffer = audioBufferToWav(buffer);
              let wavBlob = new Blob([wavBuffer]);
              let tmpscore = await tmp.player.sendAudio(wavBlob, tmp.lyrics, "en").toPromise();
              console.log("años de Brayan", tmpscore)
              tmp.score = tmp.score + tmpscore;
              resolve(wavBlob);
            },
            function (e) { console.log(e); }
          );
        };
      });
    }
  }
