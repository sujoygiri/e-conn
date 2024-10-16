import { Injectable } from '@angular/core';
import { People } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  authUser: People | undefined = undefined;
  selectedUser: People | undefined = undefined;
  constructor() { }
}
