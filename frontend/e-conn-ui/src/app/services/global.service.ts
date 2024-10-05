import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  username: string | undefined = "";
  constructor() { }
}
