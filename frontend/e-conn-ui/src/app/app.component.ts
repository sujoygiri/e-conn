import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from './services/auth.service';
import { GlobalService } from './services/global.service';
import { People } from './interfaces/common.interface';
import socket from './socket-client/socket';
import { LoadingScreenComponent } from "./components/loading-screen/loading-screen.component";
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { HomeComponent } from "./components/home/home.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoadingScreenComponent,
    HomeComponent,
    AuthenticationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'e-conn-ui';
  loading: boolean = true;
  currentUrl: string = "";
  constructor(
    private authService: AuthService,
    public globalService: GlobalService,
  ) {
  }

  ngOnInit(): void {
    this.authService.verifyUser().subscribe({
      next: (response) => {
        if (response.status === "success" && response.data && !Array.isArray(response.data)) {
          let userDetails: People = {
            username: response.data['username'] ?? '',
            email: response.data['email'] ?? '',
            user_id: response.data['user_id'] ?? '',
          };
          this.globalService.authUser = userDetails;
          window.localStorage.setItem("userData", JSON.stringify(userDetails));
          this.loading = false;
          this.globalService.isAuthenticated = true;
          socket.auth = {
            user_id: response.data['user_id'],
          };
          socket.connect();
        }
      },
      error: (err) => {
        this.loading = false;
        this.globalService.isAuthenticated = false;
      }
    });
  }
}
