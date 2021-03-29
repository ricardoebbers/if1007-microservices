import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User, Token } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(username, password) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      })
    }
    return this.http.post<Token>(`${environment.strateegiaApi}/users/v1/auth/signin`, '', httpOptions)
      .pipe(map(token => {
        const user = new User();
        user.username = username;
        user.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        return token;
      }));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }
}