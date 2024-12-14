import { Injectable } from '@angular/core';
import { People, SideNavigationPanelItem } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  isAuthenticated: boolean = false;
  authUser: People | undefined = undefined;
  selectedUser: People | undefined = undefined;
  selectedMenuItem: SideNavigationPanelItem | undefined = undefined;
  constructor() { }
}
