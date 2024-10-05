import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';

import { AuthService } from '../../services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { TooltipModule } from 'primeng/tooltip';
import { ErrorResponse, UserData } from '../../interfaces/common.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-signup',
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
    MessagesModule,
    TooltipModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  providers: [MessageService]
})
export class SignupComponent {
  signupForm!: FormGroup;
  messages!: Message[];
  htmlTooltipContent: string = `<p>Password rule</p><div class="flex flex-column"><span>1 upper case letter</span><span>1 smaller case letter</span><span>1 digit</span><span>1 special character</span><span>8 or more character long</span></div>`;
  loadingStatus: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private globalService: GlobalService
  ) { }
  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      username: ["", [Validators.required, Validators.minLength(3), Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z\s]*$/)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)]]
      // ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ])[A-Za-z\d-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/\\ ]{8,}$
    });
  }
  handelSignup() {
    const userData: UserData = this.signupForm.value;
    this.loadingStatus = true;
    this.authService.signup(userData).subscribe({
      next: (response) => {
        if (response.status === "success" && response.statusCode === 201) {
          this.loadingStatus = false;
          this.globalService.username = response.username;
          this.router.navigateByUrl("/");
        }
      },
      error: (err: HttpErrorResponse) => {
        let errorResponse: ErrorResponse = err.error;
        if (errorResponse.status === "error") {
          this.loadingStatus = false;
          this.messageService.add({
            severity: errorResponse.status,
            detail: errorResponse.message
          });
        }
      }
    });
  }
}
