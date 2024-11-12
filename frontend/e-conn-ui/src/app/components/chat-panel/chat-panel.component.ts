import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { GlobalService } from '../../services/global.service';
import socket from '../../socket-client/socket';
import { SharedService } from '../../services/shared.service';
import { ChatDetail, People } from '../../interfaces/common.interface';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [
    AvatarModule,
    CommonModule,
    InputTextareaModule,
    FormsModule
  ],
  templateUrl: './chat-panel.component.html',
  styleUrl: './chat-panel.component.scss'
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  typedMessage: string = '';
  private peopleSelectEventSubscription!: Subscription;
  chatList: ChatDetail[] = [];
  fetchChatStatus: boolean = false;
  fetchChatLimit: number = 1000;
  fetchChatOffset: number = 0;
  chatFetchCount: number = 0;
  isMessageRead: boolean = false;
  @ViewChild('messages') messagesNode!: ElementRef;
  constructor(
    public globalService: GlobalService,
    private renderer: Renderer2,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.peopleSelectEventSubscription = this.sharedService.peopleSelectEvent.subscribe({
      next: (people: People) => {
        this.fetchChatStatus = true;
        this.fetchChatOffset = 0;
        this.chatList = [];
        socket.emit("individual-chats", { sender_id: this.globalService.authUser?.userId, receiver_id: people.userId, limit: this.fetchChatLimit, offset: this.fetchChatOffset });
        this.chatFetchCount = 0;
        this.isMessageRead = false;
        socket.emit("message-read", { byWho: this.globalService.authUser?.userId, sender: people.userId });
      }
    });
    socket.on("get-global-chats", (message) => {
      console.log(message);
    });
    socket.on("get-individual-chats", (chats: ChatDetail[]) => {
      this.chatList = [];
      if (chats.length > 0) {
        this.chatList.unshift(...chats);
        console.log(this.chatList);

        // chats.forEach((chat: ChatDetail) => {
        //   if (chat.sender_id === this.globalService.authUser?.userId) {
        //     const receivedMessageDiv = this.renderer.createElement('div');
        //     this.renderer.setAttribute(receivedMessageDiv, 'class', 'flex justify-content-end my-1 mx-4');
        //     const receivedMessageDivContent = this.renderer.createElement('div');
        //     this.renderer.setAttribute(receivedMessageDivContent, 'class', 'shadow-4 bg-primary-900 p-2 border-round-md');
        //     this.renderer.setAttribute(receivedMessageDivContent, 'data-id', chat.chat_id);
        //     const textMessage = this.renderer.createText(chat.content);
        //     this.renderer.appendChild(receivedMessageDivContent, textMessage);
        //     this.renderer.appendChild(receivedMessageDiv, receivedMessageDivContent);
        //     this.renderer.insertBefore(this.messagesNode.nativeElement, receivedMessageDiv, this.messagesNode.nativeElement.firstChild);
        //   } else {
        //     const receivedMessageDiv = this.renderer.createElement('div');
        //     this.renderer.setAttribute(receivedMessageDiv, 'class', 'flex justify-content-start my-1 mx-4');
        //     const receivedMessageDivContent = this.renderer.createElement('div');
        //     this.renderer.setAttribute(receivedMessageDivContent, 'class', 'shadow-4 bg-bluegray-800 p-2 border-round-md');
        //     this.renderer.setAttribute(receivedMessageDivContent, 'data-id', chat.chat_id);
        //     const textMessage = this.renderer.createText(chat.content);
        //     this.renderer.appendChild(receivedMessageDivContent, textMessage);
        //     this.renderer.appendChild(receivedMessageDiv, receivedMessageDivContent);
        //     this.renderer.insertBefore(this.messagesNode.nativeElement, receivedMessageDiv, this.messagesNode.nativeElement.firstChild);
        //   }
        // });
        this.fetchChatStatus = false;
        if (this.chatFetchCount === 0) {
          // this.messagesNode.nativeElement.scrollTop = this.messagesNode.nativeElement.scrollHeight;
          this.chatFetchCount = 1;
        }
      }
    });
    socket.on("private-message", ({ message, messageId, from, to, createdAt }) => {
      // console.log(this.globalService.selectedUser, from);
      // console.log(this.globalService.selectedUser?.userId === from);
      this.chatList.push({
        chat_id: messageId,
        content: message,
        sender_id: from,
        receiver_id: to,
        is_read: false,
        created_at: createdAt
      });
      // console.log(message, from, to);
      // if (this.globalService.selectedUser) {
      //   if (this.globalService.authUser?.userId === to) {
      //     const receivedMessageDiv = this.renderer.createElement('div');
      //     this.renderer.setAttribute(receivedMessageDiv, 'class', 'flex justify-content-start my-1 mx-4');
      //     const receivedMessageDivContent = this.renderer.createElement('div');
      //     this.renderer.setAttribute(receivedMessageDivContent, 'class', 'shadow-4 bg-bluegray-800 p-2 border-round-md');
      //     this.renderer.setAttribute(receivedMessageDivContent, 'data-id', messageId);
      //     const textMessage = this.renderer.createText(message);
      //     this.renderer.appendChild(receivedMessageDivContent, textMessage);
      //     this.renderer.appendChild(receivedMessageDiv, receivedMessageDivContent);
      //     // this.messagesNode.nativeElement.scrollTop = this.messagesNode.nativeElement.scrollHeight;
      //   } else {
      //     const sentMessageDiv = this.renderer.createElement('div');
      //     this.renderer.setAttribute(sentMessageDiv, 'class', 'flex justify-content-end my-1 mx-4');
      //     const sentMessageDivContent = this.renderer.createElement('div');
      //     this.renderer.setAttribute(sentMessageDivContent, 'class', 'shadow-4 bg-primary-900 p-2 border-round-md');
      //     this.renderer.setAttribute(sentMessageDivContent, 'data-id', messageId);
      //     const textMessage = this.renderer.createText(message);
      //     this.renderer.appendChild(sentMessageDivContent, textMessage);
      //     this.renderer.appendChild(sentMessageDiv, sentMessageDivContent);
      //     // this.renderer.appendChild(this.messagesNode.nativeElement, sentMessageDiv);
      //     // this.messagesNode.nativeElement.scrollTop = this.messagesNode.nativeElement.scrollHeight;
      //   }
      // }
      if (this.globalService.selectedUser && this.globalService.selectedUser?.userId === from) {
        // console.log('message read', messageId);
        socket.emit("message-read", { byWho: this.globalService.authUser?.userId, sender: this.globalService.selectedUser?.userId });
      }
    });
    socket.on("message-read", ({ byWho, sender }) => {
      this.isMessageRead = true;
      // const messageReadDiv = this.renderer.createElement('div');
      // this.renderer.setAttribute(messageReadDiv, 'class', 'flex justify-content-end my-1 mx-4');
      // const messageReadDivContent = this.renderer.createElement('div');
      // this.renderer.setAttribute(messageReadDivContent, 'class', 'shadow-4 bg-primary-900 p-2 border-round-md');
      // this.renderer.setAttribute(messageReadDivContent, 'data-id', chatId);
      // const textMessage = this.renderer.createText('message has been read');
      // this.renderer.appendChild(messageReadDivContent, textMessage);
      // this.renderer.appendChild(messageReadDiv, messageReadDivContent);
      // this.renderer.appendChild(this.messagesNode.nativeElement.lastChild, messageReadDiv);
    });
    socket.on("connect", () => {
      console.log("reconnected");
      if (this.globalService.selectedUser) {
        socket.emit("message-read", { byWho: this.globalService.authUser?.userId, sender: this.globalService.selectedUser?.userId });
        console.log(this.globalService.selectedUser);
      }
    });
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let userInput = this.typedMessage;
      // socket.emit("global-chats", { data: userInput });
      socket.emit("private-message", {
        message: userInput,
        to: this.globalService.selectedUser?.userId
      });
      this.typedMessage = '';
    }
  }

  onScroll(event: Event) {
    const scrollTop = this.messagesNode.nativeElement.scrollTop;
    // if (scrollTop < 50 && !this.fetchChatStatus) {
    //   const currentScrollHeight = this.messagesNode.nativeElement.scrollHeight;
    //   this.fetchChatStatus = true;
    //   this.fetchChatOffset = this.fetchChatOffset + this.fetchChatLimit;
    //   socket.emit("individual-chats", { sender_id: this.globalService.authUser?.userId, receiver_id: this.globalService.selectedUser?.userId, limit: this.fetchChatLimit, offset: this.fetchChatOffset });
    //   // const newScrollHeight = this.messagesNode.nativeElement.scrollHeight;
    //   // const hightDifference = newScrollHeight - currentScrollHeight;
    //   // this.messagesNode.nativeElement.scrollTop = scrollTop + hightDifference;
    // }

  }

  ngOnDestroy(): void {
    console.log('chat panel destroyed');
    this.peopleSelectEventSubscription.unsubscribe();
  }
}
