import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';

import { UserInputComponent } from "./components/user-input/user-input.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { LoadingScreenComponent } from "./components/loading-screen/loading-screen.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    UserInputComponent,
    NavbarComponent,
    LoadingScreenComponent,

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'e-conn-ui';
  loading: boolean = true;
  constructor(private primengConfig: PrimeNGConfig) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    // setTimeout(() => {
    //   this.loading = false; // Hide splash screen after loading
    // }, 20000); // Adjust the duration as needed
  }
}
