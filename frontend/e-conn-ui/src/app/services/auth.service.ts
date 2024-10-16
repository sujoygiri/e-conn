import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResponse, AuthData } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  signup(userData: AuthData) {
    const URL = `http://localhost:6969/api/v1/auth/signup`;
    return this.httpClient.post<SuccessResponse>(URL, userData, {
      withCredentials: true
    });
  }

  signin(userData: AuthData) {
    const URL = `http://localhost:6969/api/v1/auth/signin`;
    return this.httpClient.post<SuccessResponse>(URL, userData, {
      withCredentials: true
    });
  }

  verifyUser() {
    const URL = `http://localhost:6969/api/v1/auth/verify`;
    return this.httpClient.get<SuccessResponse>(URL, {
      withCredentials: true,
    });
  }

}
