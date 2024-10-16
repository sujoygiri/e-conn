import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { GlobalService } from '../../services/global.service';
import { CommonModule } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import socket from '../../socket-client/socket';

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
export class ChatPanelComponent implements OnInit {
  typedMessage: string = '';
  @ViewChild("messages", { static: false }) messagesNode!: ElementRef;
  constructor(
    public globalService: GlobalService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    socket.on("private-message", ({ message, from, to }) => {
      if (this.globalService.authUser?.userId === to) {
        const receivedMessageDiv = this.renderer.createElement('div');
        this.renderer.setAttribute(receivedMessageDiv, 'class', 'flex justify-content-start my-1 mx-4');
        const receivedMessageDivContent = this.renderer.createElement('div');
        this.renderer.setAttribute(receivedMessageDivContent, 'class', 'shadow-4 bg-bluegray-800 p-2 border-round-md');
        const textMessage = this.renderer.createText(message);
        this.renderer.appendChild(receivedMessageDivContent, textMessage);
        this.renderer.appendChild(receivedMessageDiv, receivedMessageDivContent);
        this.renderer.appendChild(this.messagesNode.nativeElement, receivedMessageDiv);
      }
    });
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let userInput = this.typedMessage;
      socket.emit("private-message", {
        message: userInput,
        to: this.globalService.selectedUser?.userId
      });
      this.typedMessage = '';
      const sentMessageDiv = this.renderer.createElement('div');
      this.renderer.setAttribute(sentMessageDiv, 'class', 'flex justify-content-end my-1 mx-4');
      const sentMessageDivContent = this.renderer.createElement('div');
      this.renderer.setAttribute(sentMessageDivContent, 'class', 'shadow-4 bg-primary-900 p-2 border-round-md');
      const textMessage = this.renderer.createText(userInput);
      this.renderer.appendChild(sentMessageDivContent, textMessage);
      this.renderer.appendChild(sentMessageDiv, sentMessageDivContent);
      this.renderer.appendChild(this.messagesNode.nativeElement, sentMessageDiv);
    }
  }
}
