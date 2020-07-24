import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class LoggingService {

  lastLong: string;

  printLong(message: string) {
      console.log(message);
      console.log(this.lastLong);
      this.lastLong = message;
  }
}
