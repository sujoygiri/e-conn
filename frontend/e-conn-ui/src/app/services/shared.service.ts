import { EventEmitter, Injectable } from '@angular/core';
import { People, SideNavigationPanelItem } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public menuItemClickedEvent: EventEmitter<SideNavigationPanelItem> = new EventEmitter();
  public peopleSelectEvent: EventEmitter<People> = new EventEmitter();
  constructor() { }
  triggerMenuItemClickedEvent(menuItem: SideNavigationPanelItem) {
    this.menuItemClickedEvent.emit(menuItem);
  }
  triggerPeopleSelectEvent(people: People) {
    this.peopleSelectEvent.emit(people);
  }
}
