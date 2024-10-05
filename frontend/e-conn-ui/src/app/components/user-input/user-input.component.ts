import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import socket from '../../socket-client/socket';

@Component({
  selector: 'app-user-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-input.component.html',
  styleUrl: './user-input.component.scss'
})
export class UserInputComponent implements OnInit {

  @ViewChild("message") messageNode!: ElementRef;

  userInputForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private renderer: Renderer2) { }

  ngOnInit(): void {
    socket.on('connect', () => {
      console.log(socket.id);
    });
    this.userInputForm = this.formBuilder.group({
      userInput: ['', [Validators.required]]
    });
    socket.on("post-message", (message) => {
      console.log(socket.id === message[1]);
      console.log(message);

      const item = this.renderer.createElement('li');
      item.textContent = message;
      this.renderer.appendChild(this.messageNode.nativeElement, item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  handelPost() {
    let userInput = this.userInputForm.value.userInput;
    socket.emit("post-message", userInput);
    this.userInputForm.reset("");
  }
}
