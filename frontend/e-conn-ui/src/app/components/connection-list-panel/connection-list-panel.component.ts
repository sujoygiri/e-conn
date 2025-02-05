import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { UtilService } from '../../services/util.service';
import { CustomError, DropDownItem, People, Message, SideNavigationPanelItem, SuccessResponse } from '../../interfaces/common.interface';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../services/global.service';
import socket from '../../socket-client/socket';
import { SharedService } from '../../services/shared.service';
import { HideOnClickOutsideDirective } from '../../directives/hide-on-click-outside.directive';
import { validateEmail } from '../../utils/inputValidation';

export interface PrivateChat {
  connected_user_id: string;
  content: string | null;
  email: string;
  is_read: string | null;
  last_chat_time: string | null;
  message_type: string | null;
  new_chats_count: number;
  sender_id: string | null;
  username: string;
}

@Component({
  selector: 'app-connection-list-panel',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HideOnClickOutsideDirective,
  ],
  templateUrl: './connection-list-panel.component.html',
  styleUrl: './connection-list-panel.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),  // Initial state
        animate('300ms ease-in', style({ opacity: 1 })), // Fade in
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })) // Fade out
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0, position: 'absolute' }), // Start off-screen (left)
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 })) // Slide in
      ]),
      transition(':leave', [
        animate('100ms ease-out', style({ transform: 'translateX(-100%)', opacity: 1 })) // Slide out to the right
      ])
    ]),
  ]
})
export class ConnectionListPanelComponent implements AfterViewInit, OnDestroy {
  searchForm!: FormGroup;
  moreChatOptionsItems: DropDownItem[] | undefined;
  chatsList: PrivateChat[] = [];
  foundPeople: People[] = [];
  loading: boolean = false;
  isPeopleFound: boolean = false;
  selectedPeople: People = {} as People;
  isMoreOptionsVisible: boolean = false;
  isNewPrivateChatPanelVisible: boolean = false;
  isNewGroupPanelVisible: boolean = false;
  isNewGroupInfoPanelVisible: boolean = false;
  groupMembers: People[] = [];
  alreadyConnectedPeople: People[] = [];
  private menuItemClickEventSubscription!: Subscription;
  @ViewChild("groupDescription", { static: false }) groupDescription!: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    public globalService: GlobalService,
    private utilService: UtilService,
    private sharedService: SharedService,
  ) { }
  ngOnInit() {
    this.moreChatOptionsItems = [
      {
        title: "New Group",
        icon: "bi bi-people-fill",
        iconClass: "text-2xl",
        command: () => {
          socket.emit("search-connected-people", { user_id: this.globalService.authUser?.user_id });
          this.openOrCloseOverlayPanel("new-group");
        }
      },
      { title: "New Broadcast", icon: "bi bi-broadcast", iconClass: "text-2xl" },
      { title: "Starred Messages", icon: "bi bi-star-fill", iconClass: "text-2xl" },
      { title: "Settings", icon: "bi bi-gear-fill", iconClass: "text-2xl" },
    ];
    this.searchForm = this.formBuilder.group({
      search: ['', [Validators.required, Validators.email]]
    });
    // socket.on("search-connected-people", (data) => {
    //   if (data.user_id === this.globalService.authUser?.user_id) {
    //     if (data.users && data.users.length > 0) {
    //       this.alreadyConnectedPeople = data.users;
    //     }
    //   }
    // });
    socket.on("search-new-user", (response: SuccessResponse) => {
      if (response.status === "success" && response.data && Array.isArray(response.data['user'])) {
        console.log(response);
        response.data['user'].forEach((people: People) => {
          this.foundPeople.push(people);
        });
      }
    });
    socket.emit("get-connections", { user_id: this.globalService.authUser?.user_id });
    socket.on("get-connections", (response: SuccessResponse) => {
      if (response.status === "success" && response.data) {
        this.chatsList = response.data['privateChatConnections'];
      }
    });

    // socket.on("get-connected-people-messages", (data) => {
    //   if (data.user_id === this.globalService.authUser?.user_id) {
    //     if (data.users && data.users.length > 0) {
    //       data.users.forEach((user: (People & Message)) => {
    //         let peopleAndMessage: (People & Message) = {
    //           user_id: user.user_id,
    //           username: user.username,
    //           email: user.email,
    //           content: user.content,
    //           new_messages_count: user.new_messages_count,
    //           created_at: user.created_at,
    //           message_type: user.message_type
    //         };
    //         this.chatList.push(peopleAndMessage);
    //       });
    //     }
    //   }
    // });
    // socket.on("add-connection", (data) => {
    //   if (data.user_id === this.globalService.authUser?.user_id) {
    //     console.log(data);
    //   }
    // });
    // socket.on("sent-error", (error: CustomError) => {
    //   console.log(error);
    // });
    // socket.emit("get-connected-people-messages", { user_id: this.globalService.authUser?.user_id });
    this.menuItemClickEventSubscription = this.sharedService.menuItemClickedEvent.subscribe({
      next: (menuItem: SideNavigationPanelItem) => {
        console.log(menuItem);
      }
    });
  }

  ngAfterViewInit() {

    // this.groupDescription.nativeElement.addEventListener('input', () => {
    //   console.log("hi");

    //   const text = this.groupDescription.nativeElement.innerText.trim();
    //   this.groupDescription.nativeElement.innerText = '';
    //   if (text) {
    //     console.log(text);
    //   }
    // });
  }

  searchPeople(event: Event, searchType: string) {
    const targetInput = event.target as HTMLInputElement;
    const targetInputValue = targetInput.value;
    switch (searchType) {
      case "private":
        // this.loading = true;
        const isValidEmail = validateEmail(targetInputValue);
        if (isValidEmail) {
          socket.emit("search-new-user", { email: targetInputValue });
        }
        break;
      case "group":
        this.isPeopleFound = false;
        this.foundPeople = [];
        break;
      default:
        break;
    }
  }

  startPrivateChat(people: People) {
    this.isNewPrivateChatPanelVisible = false;
    let peopleAndMessage: PrivateChat = {
      connected_user_id: people.user_id,
      username: people.username,
      email: people.email,
      content: "Start a conversation...",
      new_chats_count: 0,
      last_chat_time: "",
      message_type: "text",
      is_read: null,
      sender_id: null, // need to update this when sending message or receiving message
    };
    let isAlreadyConnected = this.chatsList.find((chat) => chat.connected_user_id === people.user_id);
    if (!isAlreadyConnected) {
      let created_at = new Date().toISOString();
      socket.emit("new-connection", { user_id: this.globalService.authUser?.user_id, connected_user_id: people.user_id, created_at }, (response: SuccessResponse) => {
        console.log(response);
        this.chatsList.unshift(peopleAndMessage);
      });
    }
    this.globalService.selectedUser = people;
    this.sharedService.triggerPeopleSelectEvent(people);
  }

  openOrCloseOverlayPanel(panelType: string) {
    switch (panelType) {
      case "new-private-chat":
        this.isNewPrivateChatPanelVisible = !this.isNewPrivateChatPanelVisible;
        break;
      case "new-group":
        this.isNewGroupPanelVisible = !this.isNewGroupPanelVisible;
        if (!this.isNewGroupPanelVisible) {
          this.groupMembers = [];
        }
        break;
      case "more-options":
        this.isMoreOptionsVisible = true;
        break;
      case "new-group-info":
        this.isNewGroupInfoPanelVisible = !this.isNewGroupInfoPanelVisible;
        break;
      default:
        break;
    }
  }

  demo(event: Event) {
    console.log((event.target as HTMLInputElement | HTMLTextAreaElement).value);

  }

  handelGroupDescriptionFieldStyle(event: Event) {
    if (event.target) {
      (event.target as HTMLElement).style.overflow = 'hidden';
      (event.target as HTMLElement).style.height = 'auto';
      (event.target as HTMLElement).style.height = (event.target as HTMLElement).scrollHeight + 'px';
    }
    // console.log(event.target);
    // groupDescriptionElement.innerText = '';
  }

  addOrRemoveGroupMember(people: People, isAdd: boolean) {
    if (isAdd) {
      this.groupMembers.push(people);
      this.alreadyConnectedPeople = this.alreadyConnectedPeople.filter((member) => member.user_id !== people.user_id);
    } else {
      this.groupMembers = this.groupMembers.filter((member) => member.user_id !== people.user_id);
      this.alreadyConnectedPeople.push(people);
    }
  }

  addToChatList(people: People) {
    // this.chatList.push(peopleAndMessage);
    // let newChatDetails: { user_id: string | undefined, connected_user_id: string | undefined; } = {
    //   user_id: this.globalService.authUser?.user_id,
    //   connected_user_id: peopleAndMessage.connected_user_id,
    // };
    // socket.emit("add-connection", newChatDetails);
    // this.visible = false;
    // this.searchForm.reset();
    // this.foundPeople = [];
  }

  handelUserSelect(people: PrivateChat) {
    this.selectedPeople = {
      username: people.username,
      email: people.email,
      user_id: people.connected_user_id
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

  toggleMoreOptionsDropdown() {
    this.isMoreOptionsVisible = !this.isMoreOptionsVisible;
  }

  ngOnDestroy(): void {
    this.menuItemClickEventSubscription.unsubscribe();
  }
}
