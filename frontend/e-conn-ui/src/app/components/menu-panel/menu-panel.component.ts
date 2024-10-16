import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-menu-panel',
  standalone: true,
  imports: [
    MenuModule,
    NavbarComponent
  ],
  templateUrl: './menu-panel.component.html',
  styleUrl: './menu-panel.component.scss'
})
export class MenuPanelComponent implements OnInit {
  items: MenuItem[] | undefined;
  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-bars', iconClass: 'main-menu', command: () => { }
      },
      { icon: 'pi pi-home' },
      { icon: 'pi pi-chart-line' },
      { icon: 'pi pi-list' },
      { icon: 'pi pi-inbox' }
    ];
  }
}
