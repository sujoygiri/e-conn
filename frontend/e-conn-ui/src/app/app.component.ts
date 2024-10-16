import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';

import { UserInputComponent } from "./components/user-input/user-input.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { LoadingScreenComponent } from "./components/loading-screen/loading-screen.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';
import { GlobalService } from './services/global.service';
import { People } from './interfaces/common.interface';
import socket from './socket-client/socket';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    UserInputComponent,
    LoadingScreenComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'e-conn-ui';
  loading: boolean = true;
  currentUrl: string = "";
  constructor(
    private primengConfig: PrimeNGConfig,
    private authService: AuthService,
    private router: Router,
    private globalService: GlobalService,
  ) {
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });
    this.authService.verifyUser().subscribe({
      next: (response) => {
        if (response.status === "success" && response.statusCode === 200) {
          let userDetails: People = {
            username: response.username as string,
            email: response.email as string,
            userId: response.userId as string,
          };
          this.globalService.authUser = userDetails;
          window.localStorage.setItem("userData", JSON.stringify(userDetails));
          this.loading = false;
          socket.auth = {
            userId: response.userId,
          };
          socket.connect();
          this.router.navigateByUrl("/");
        }
      },
      error: (err) => {
        this.loading = false;
        switch (this.currentUrl) {
          case "/signin":
          case "/signup":
            break;
          default: {
            this.currentUrl = "/signin";
            break;
          }
        }
        this.router.navigateByUrl(this.currentUrl);
      }
    });
  }
}
