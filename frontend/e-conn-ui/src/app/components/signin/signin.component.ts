import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Router, RouterModule } from '@angular/router';

import { ErrorResponse, People, AuthData } from '../../interfaces/common.interface';
import { Message, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { GlobalService } from '../../services/global.service';
import socket from '../../socket-client/socket';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    RouterModule,
    NgOptimizedImage,
    MessagesModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
  providers: [MessageService]
})
export class SigninComponent {
  signinForm!: FormGroup;
  messages!: Message[];
  loadingStatus: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private globalService: GlobalService,
  ) { }
  ngOnInit(): void {
    this.signinForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]]
    });
  }
  handelSignin() {
    const userData: AuthData = this.signinForm.value;
    this.loadingStatus = true;
    this.authService.signin(userData).subscribe({
      next: (response) => {
        this.loadingStatus = false;
        if (response.status === "success" && response.statusCode === 200) {
          let userDetails: People = {
            username: response.username as string,
            email: response.email as string,
            userId: response.userId as string,
          };
          this.globalService.authUser = userDetails;
          window.localStorage.setItem("user", JSON.stringify(userDetails));
          socket.auth = {
            userId: response.userId,
          };
          socket.connect();
          this.router.navigateByUrl("/");
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingStatus = false;
        let errorResponse: ErrorResponse = err.error;
        if (errorResponse.status === "error") {
          this.messageService.add({
            severity: errorResponse.status,
            detail: errorResponse.message
          });
        }
      }
    });

  }
}
