import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  constructor(
    public globalService: GlobalService
  ) { }
  ngOnInit(): void {
    
  }
}
