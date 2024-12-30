import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { People, SuccessResponse } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private httpClient: HttpClient) { }


}
