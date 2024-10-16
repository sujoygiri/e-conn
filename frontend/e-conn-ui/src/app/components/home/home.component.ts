import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { NavbarComponent } from '../navbar/navbar.component';
import { MenuPanelComponent } from "../menu-panel/menu-panel.component";
import { ConnectionListPanelComponent } from "../connection-list-panel/connection-list-panel.component";
import { ChatPanelComponent } from "../chat-panel/chat-panel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    DividerModule,
    NavbarComponent,
    MenuPanelComponent,
    ConnectionListPanelComponent,
    ChatPanelComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {

  }
}
