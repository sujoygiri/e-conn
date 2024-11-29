import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResponse, AuthData } from '../interfaces/common.interface';
import { configData } from '../utils/data.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  hostURL: string = configData.hostURL;

  constructor(private httpClient: HttpClient) { }

  signup(userData: AuthData) {
    const URL = `${this.hostURL}/api/v1/auth/signup`;
    return this.httpClient.post<SuccessResponse>(URL, userData, {
      withCredentials: true
    });
  }

  signin(userData: AuthData) {
    const URL = `${this.hostURL}/api/v1/auth/signin`;
    return this.httpClient.post<SuccessResponse>(URL, userData, {
      withCredentials: true
    });
  }

  verifyUser() {
    const URL = `${this.hostURL}/api/v1/auth/verify`;
    return this.httpClient.get<SuccessResponse>(URL, {
      withCredentials: true,
    });
  }

}
