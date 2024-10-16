import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { UtilService } from '../../services/util.service';
import { People } from '../../interfaces/common.interface';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GlobalService } from '../../services/global.service';
import socket from '../../socket-client/socket';

@Component({
  selector: 'app-connection-list-panel',
  standalone: true,
  imports: [
    MenuModule,
    DialogModule,
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
export class ConnectionListPanelComponent {
  searchForm!: FormGroup;
  items: MenuItem[] | undefined;
  visible: boolean = false;
  chatList: People[] = [];
  foundPeople: People[] = [];
  loading: boolean = false;
  isPeopleFound: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private globalService: GlobalService,
    private utilService: UtilService,
  ) { }
  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      search: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]]
    });
    // this.items = [
    //   { label: '', }
    // ];
    socket.on("get-connections", (data) => {
      if (data.userId === this.globalService.authUser?.userId) {
        if (data.users && data.users.length > 0) {
          data.users.forEach((user: any) => {
            let people: People = {
              userId: user.connected_user_id as string,
              username: user.username as string,
              email: user.email as string,
            };
            this.chatList.push(people);
          });
        }
      }
    });
    socket.on("add-connection", (data) => {
      if (data.userId === this.globalService.authUser?.userId) {
        console.log(data);
      }
    });
    socket.emit("search-connection", { userId: this.globalService.authUser?.userId });
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
          this.loading = false;
          this.isPeopleFound = false;
          this.foundPeople = [];
        }
      });
    }
  }

  addToChatList(people: People) {
    this.chatList.push(people);
    let newChatDetails: { user_id: string | undefined, connected_user_id: string | undefined; } = {
      user_id: this.globalService.authUser?.userId,
      connected_user_id: people.userId,
    };
    socket.emit("add-connection", newChatDetails);
    this.visible = false;
    this.searchForm.reset();
    this.foundPeople = [];
  }

  handelUserSelect(people: People) {
    this.globalService.selectedUser = people;
    console.log(this.globalService.selectedUser);
  }

  resetState() {
    this.loading = false;
    this.foundPeople = [];
    this.searchForm.reset();
  }
}
