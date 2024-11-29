import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { UtilService } from '../../services/util.service';
import { People, PeopleAndMessage, SideNavigationPanelItem } from '../../interfaces/common.interface';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GlobalService } from '../../services/global.service';
import socket from '../../socket-client/socket';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-connection-list-panel',
  standalone: true,
  imports: [
    MenuModule,
    DialogModule,
    RippleModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    CommonModule,
    AvatarModule,
    ProgressSpinnerModule
  ],
  templateUrl: './connection-list-panel.component.html',
  styleUrl: './connection-list-panel.component.scss'
})
export class ConnectionListPanelComponent implements OnDestroy {
  searchForm!: FormGroup;
  items: MenuItem[] | undefined;
  moreChatOptionsItems: MenuItem[] | undefined;
  visible: boolean = false;
  chatList: PeopleAndMessage[] = [];
  foundPeople: People[] = [];
  loading: boolean = false;
  isPeopleFound: boolean = false;
  selectedPeople: People = {} as People;
  private menuItemClickEventSubscription!: Subscription;
  constructor(
    private formBuilder: FormBuilder,
    public globalService: GlobalService,
    private utilService: UtilService,
    private sharedService: SharedService,
  ) { }
  ngOnInit() {
    this.moreChatOptionsItems = [
      { label: 'Delete', icon: 'pi pi-trash' },
      { label: 'Block', icon: 'pi pi-lock' },
      {
        label: 'Report',
        icon: 'pi pi-exclamation-triangle',
        command: () => {
          this.chatList[0].username = 'Keshob';
          console.log("hi report");

        }
      },
    ];
    this.searchForm = this.formBuilder.group({
      search: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]]
    });
    socket.on("get-connected-people-messages", (data) => {
      if (data.userId === this.globalService.authUser?.userId) {
        if (data.users && data.users.length > 0) {
          data.users.forEach((user: PeopleAndMessage) => {
            let peopleAndMessage: PeopleAndMessage = {
              connected_user_id: user.connected_user_id,
              username: user.username,
              email: user.email,
              last_message: user.last_message,
              total_unread_chats: user.total_unread_chats,
              last_message_time: user.last_message_time,
            };
            this.chatList.push(peopleAndMessage);
          });
        }
      }
    });
    socket.on("add-connection", (data) => {
      if (data.userId === this.globalService.authUser?.userId) {
        console.log(data);
      }
    });
    socket.emit("get-connected-people-messages", { userId: this.globalService.authUser?.userId });
    this.menuItemClickEventSubscription = this.sharedService.menuItemClickedEvent.subscribe({
      next: (menuItem: SideNavigationPanelItem) => {
        console.log(menuItem);
      }
    });
  }
  addConnection() {
    this.visible = true;
  }

  searchPeople() {
    if (this.searchForm.valid) {
      this.loading = true;
      const email = this.searchForm.get('search')?.value;
      this.utilService.searchUser(email).subscribe({
        next: (res) => {
          this.loading = false;
          this.isPeopleFound = true;
          let foundPeopleDetail: People = {
            username: res.username as string,
            email: res.email as string,
            userId: res.userId as string
          };
          this.foundPeople.push(foundPeopleDetail);
        },
        error: (err) => {
          this.foundPeople = [];
          this.loading = false;
          this.isPeopleFound = false;
        }
      });
    }
  }

  addToChatList(people: People) {
    // this.chatList.push(peopleAndMessage);
    // let newChatDetails: { user_id: string | undefined, connected_user_id: string | undefined; } = {
    //   user_id: this.globalService.authUser?.userId,
    //   connected_user_id: peopleAndMessage.connected_user_id,
    // };
    // socket.emit("add-connection", newChatDetails);
    // this.visible = false;
    // this.searchForm.reset();
    // this.foundPeople = [];
  }

  handelUserSelect(peopleAndMessage: PeopleAndMessage) {
    this.selectedPeople = {
      username: peopleAndMessage.username,
      email: peopleAndMessage.email,
      userId: peopleAndMessage.connected_user_id,
    };
    this.globalService.selectedUser = this.selectedPeople;
    this.sharedService.triggerPeopleSelectEvent(this.selectedPeople);
  }

  resetState() {
    this.loading = false;
    this.foundPeople = [];
    this.searchForm.reset();
    this.isPeopleFound = false;
  }

  ngOnDestroy(): void {
    this.menuItemClickEventSubscription.unsubscribe();
  }
}
