import {Component, ComponentFactoryResolver, OnDestroy, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthResponseData, AuthService } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router} from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})

export class AuthComponent implements OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;
  private closeSub: Subscription;

  constructor(private builder: FormBuilder,
              private authSrv: AuthService,
              private route: Router,
              private componentFactoryResolver: ComponentFactoryResolver) {}

  signupForm: FormGroup = this.builder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  submit(form) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;
    if (this.isLoginMode) {
      authObs = this.authSrv.login(email, password);
    } else {
      authObs = this.authSrv.newUserSignup(email, password);
    }
    authObs.subscribe(
       respData => {
        console.log(respData);
        this.isLoading = false;
        this.route.navigate(['/recipes']);
      },
       errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.showError(errorMessage);
        this.isLoading = false;
      });
    this.signupForm.reset();
  }

  onHandleError() {
    this.error = null;
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

  private showError(message: string) {
    //const alertCmp = new AlertComponent
    const alertCmpResolver = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();
    const componentRef = hostViewContainerRef.createComponent(alertCmpResolver);
    componentRef.instance.message = message;
    this.closeSub = componentRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }
}
