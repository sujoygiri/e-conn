import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';

import { NavbarComponent } from "../navbar/navbar.component";
import { SideNavigationPanelItem } from '../../interfaces/common.interface';
import { GlobalService } from '../../services/global.service';
import { SharedService } from '../../services/shared.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-menu-panel',
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    TooltipModule
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
        icon: 'notifications',
        iconClass: 'text-3xl',
        styleClass: 'material-icons-outlined'
      },
      {
        label: 'Chats',
        icon: 'chat',
        iconClass: 'text-2xl',
        styleClass: 'material-icons-outlined'
      },
      // {
      //   
      // }
    ];
    this.profileMenuItem = {
      label: 'Profile',
      icon: 'pi pi-user',
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
