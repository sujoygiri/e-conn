import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { People, SuccessResponse } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private httpClient: HttpClient) { }

  searchUser(email: string) {
    const URL = `http://localhost:6969/api/v1/util/search`;
    return this.httpClient.post<SuccessResponse>(URL, { email }, { withCredentials: true });
  }
}
