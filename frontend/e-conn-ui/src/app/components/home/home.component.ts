import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MenuPanelComponent } from "../menu-panel/menu-panel.component";
import { ConnectionListPanelComponent } from "../connection-list-panel/connection-list-panel.component";
import { ChatPanelComponent } from "../chat-panel/chat-panel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
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
