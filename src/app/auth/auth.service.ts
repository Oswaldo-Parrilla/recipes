import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { UserModel } from './user.model';
import {Router} from '@angular/router';


export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  user = new BehaviorSubject<UserModel>(null);
  private tokenExpirationTimer: any;
  constructor(private http: HttpClient, private router: Router) {
  }

  newUserSignup(mail: string, pass: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDe5_DRqo4tSIwkLp5-4Kgbmx_U0FQGO2g',
      {
        email: mail,
        password: pass,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError), tap(resData => {
        this.handleAuthentication(
          resData.email,
          resData.localId,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
  }

  login(mail: string, pass: string) {
    return this.http.post<AuthResponseData>(
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDe5_DRqo4tSIwkLp5-4Kgbmx_U0FQGO2g',
      {
        email: mail,
        password: pass,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(
        resData.email,
        resData.localId,
        resData.idToken,
        +resData.expiresIn
      );
    }));
  }

  autoLogout() {
    const userData: {
      email: string; idUser: string; token: string; tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const loadedUser = new UserModel(userData.email, userData.idUser, userData.token, new Date(userData.tokenExpirationDate));
    if (loadedUser.tokenn) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData.tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLoGout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLoGout(expirationDate: number) {
    console.log(expirationDate);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDate);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number) {
    const expeditionData = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new UserModel(email, userId, token, expeditionData);
    this.user.next(user);
    this.autoLoGout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorResp: HttpErrorResponse) {
      let errorMessage = 'A unknown error ocurred!';
      if (!errorResp.error || !errorResp.error.error) {
        return throwError(errorMessage);
      }
      switch (errorResp.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'This email exists alrady';
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'This email does no exist.';
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'This password is not correct.';
          break;
      }
      return throwError(errorMessage);
    }

}
