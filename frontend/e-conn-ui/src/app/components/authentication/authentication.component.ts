import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { GlobalService } from '../../services/global.service';
import { AuthData, People, ErrorResponse } from '../../interfaces/common.interface';
import socket from '../../socket-client/socket';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgOptimizedImage,
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
  providers: [],
  animations: [
    // create animation for fade in right side
    trigger('fadeInRight', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(100%)'
      })),
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => in', animate('500ms ease-in')),
    ]),
    // create animation for fade in left side
    trigger('fadeInLeft', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(-100%)'
      })),
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => in', animate('500ms ease-in')),
    ])
  ]

})
export class AuthenticationComponent implements OnInit {
  signinForm!: FormGroup;
  loadingStatus: boolean = false;
  showSigninForm: boolean = true;
  signupForm!: FormGroup;
  htmlTooltipContent: string = `<p>Password rule</p><div class="flex flex-column"><span>1 upper case letter</span><span>1 smaller case letter</span><span>1 digit</span><span>1 special character</span><span>8 or more character long</span></div>`;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private globalService: GlobalService,
  ) { }

  ngOnInit(): void {
    // initialize signin form
    this.signinForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    });
    // initialize signup form
    this.signupForm = this.formBuilder.group({
      username: ["", [Validators.required, Validators.minLength(3), Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z\s]*$/)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)]]
      // ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ])[A-Za-z\d-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ]{8,}$
    });
  }

  handelSignin() {
    const userData: AuthData = this.signinForm.value;
    this.loadingStatus = true;
    this.authService.signin(userData).subscribe({
      next: (response) => {
        this.loadingStatus = false;
        if (response.status === "success" && response.statusCode === 200 && !Array.isArray(response.userData)) {
          let userDetails: People = {
            username: response.userData?.username ?? '',
            email: response.userData?.email ?? '',
            user_id: response.userData?.user_id ?? '',
          };
          this.globalService.authUser = userDetails;
          window.localStorage.setItem("user", JSON.stringify(userDetails));
          socket.auth = {
            user_id: response.userData?.user_id ?? '',
          };
          socket.connect();
          this.globalService.isAuthenticated = true;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingStatus = false;
        let errorResponse: ErrorResponse = err.error;
        if (errorResponse.status === "error") {

        }
      }
    });
  }

  handelSignup() {
    const userData: AuthData = this.signupForm.value;
    this.loadingStatus = true;
    this.authService.signup(userData).subscribe({
      next: (response) => {
        if (response.status === "success" && response.statusCode === 201 && !Array.isArray(response.userData)) {
          this.loadingStatus = false;
          let userDetails: People = {
            username: response.userData?.username ?? '',
            email: response.userData?.email ?? '',
            user_id: response.userData?.user_id ?? '',
          };
          this.globalService.authUser = userDetails;
          window.localStorage.setItem("authUser", JSON.stringify(userDetails));
          socket.auth = {
            user_id: response.userData?.user_id ?? '',
          };
          socket.connect();
          this.globalService.isAuthenticated = true;
        }
      },
      error: (err: HttpErrorResponse) => {
        let errorResponse: ErrorResponse = err.error;
        if (errorResponse.status === "error") {
          this.loadingStatus = false;
        }
      }
    });
  }
  togglePasswordState(inputElement: HTMLInputElement) {
    if (inputElement.type === "password") {
      inputElement.type = "text";
    } else {
      inputElement.type = "password";
    }
  }
}
