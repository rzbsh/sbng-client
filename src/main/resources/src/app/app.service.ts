import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';

export class Foo {
  constructor(
    public id: number,
    public name: string) { }
}

@Injectable()
export class AppService {

  storage: Storage = sessionStorage;

  constructor(
    private _http: HttpClient,
	private router: Router,
	private cookieService: CookieService) { }

  retrieveToken() {
    let headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    });
    this._http.post('auth/token', {}, { headers: headers })
      .subscribe(
        data => this.saveToken(data),
        err => alert('Invalid Credentials')
      );
  }

  saveToken(token) {
    var expireDate = new Date().getTime() + (1000 * token.expires_in);
    //Cookie.set("access_token", token.access_token, expireDate);
    this.cookieService.set("access_token", token.access_token, expireDate);
    //this.storage.setItem('token', 'test: '+token.access_token);

    alert('Saved Access token');
    this.router.navigate(['/']);
  }

  getResource(resourceUrl): Observable<any> {
    var headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': 'Bearer ' + this.cookieService.get('access_token')
    });
    alert("Access Token: " + this.cookieService.get('access_token'));
    //alert(this.storage.getItem('token'))

    return this._http.get(resourceUrl, { headers: headers })
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }

  checkCredentials() {
    alert('Check Credentials: ' + this.cookieService.check('access_token'));
    return (this.cookieService.check('access_token'));
  }

  logout() {
    let headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    });

    this._http.post('auth/refresh/revoke', {}, { headers: headers })
      .subscribe(
        data => {
        	this.cookieService.delete('access_token');
        	window.location.href = 'http://78.47.114.254:8089/';
        	},
        err => alert('Could not logout')
      );
  }

  refreshAccessToken() {
    let headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    });
    this._http.post('auth/refresh', {}, {headers: headers })
      .subscribe(
        data => this.saveToken(data),
        err => alert('Invalid Credentials')
      );
  }
}
