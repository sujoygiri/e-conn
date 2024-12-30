import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from "../navbar/navbar.component";
import { SideNavigationPanelItem } from '../../interfaces/common.interface';
import { GlobalService } from '../../services/global.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-menu-panel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './menu-panel.component.html',
  styleUrl: './menu-panel.component.scss'
})
export class MenuPanelComponent implements OnInit {
  sideNavigationPanelItems: SideNavigationPanelItem[] | undefined;
  selectedMenuItem!: SideNavigationPanelItem;
  authUser: string | undefined = undefined;
  profileMenuItem!: SideNavigationPanelItem;
  constructor(
    private globalService: GlobalService,
    private sharedService: SharedService
  ) { }
  ngOnInit() {
    this.authUser = this.globalService.authUser?.username;
    this.sideNavigationPanelItems = [
      {
        label: 'Activity',
        icon: 'bi bi-bell',
        filledIcon: 'bi bi-bell-fill',
        iconClass: 'text-xl',
      },
      {
        label: 'Chats',
        icon: 'bi bi-chat-dots',
        filledIcon: 'bi bi-chat-dots-fill',
        iconClass: 'text-xl',
      },
      // {
      //   
      // }
    ];
    this.profileMenuItem = {
      label: 'Profile',
      icon: 'bi bi-person-circle',
      iconClass: 'text-xl',
      styleClass: 'flex'
    };
    this.selectedMenuItem = this.sideNavigationPanelItems[1];
    this.globalService.selectedMenuItem = this.sideNavigationPanelItems[1];
  }

  handelMenuItemSelect(selectedMenu: SideNavigationPanelItem) {
    this.sharedService.triggerMenuItemClickedEvent(selectedMenu);
    this.selectedMenuItem = selectedMenu;
    this.globalService.selectedMenuItem = selectedMenu;
  }
}
