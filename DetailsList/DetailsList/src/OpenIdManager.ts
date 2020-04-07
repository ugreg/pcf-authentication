import * as https from "https";
import { UserManager } from "oidc-client";

import * as env from "../../../env/env.json";

export class OpenIdManager {
    // TODO: Send sign cert to ISV
    //
    //
    // something running on dynamics server side to BASE 64 encode and SSA sign the thing
    //
    // create JWT (sign it on server)
    // have plugin fire and sign this
    // or use azure functions
    //
    // use TS to get bearer token for user?
    //
    // id
    // azureactivedirectoryobjectid - possiblly null
    // internalemailaddress
    // 
    //
    // dynamics sends signed JWT to ISV
    // isv provides and stores key to allow for API access with no expire time
    private static instance: OpenIdManager;
    public userManager: UserManager;
    public expirersAt: number;
    public bearerToken: string;
    public authenticated: boolean;

    constructor() {
        this.userManager = new UserManager({
			authority: env.authority,
			client_id: env.clientId,
			redirect_uri: env.redirectUris[0],
			scope: env.scope,
			response_type: "token",
			loadUserInfo: false
		});
		this.userManager.events.addUserLoaded((user) => {
            if (window.location.href.indexOf("signin-oidc") !== -1) {
				console.log(user);
                console.log("Authorization: " + user.token_type + ' ' + user.access_token);
            }
        });
        this.userManager.events.addSilentRenewError((e) => {
            console.log("silent renew error", e.message);
        });

        this.userManager.events.addAccessTokenExpired(() => {
            console.log("token expired");
        });

        this.userManager.signinPopupCallback();            

        if (document.cookie.split(';').filter((item) => item.trim().startsWith('commonDataServiceToken=')).length) {
            var cookie = document.cookie.replace(/(?:(?:^|.*;\s*)commonDataServiceToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");            
            this.bearerToken = cookie;            
            this.authenticated = true;
        } else {
            this.bearerToken = "";            
            this.authenticated = false;
        }
    }
    
    public getInstance(): OpenIdManager {
        if (OpenIdManager.instance) {
            return OpenIdManager.instance;
        } else {
            OpenIdManager.instance = new OpenIdManager();
            return OpenIdManager.instance;
        }
    }
    
    public getToken(): void { 
        // TODO: replace openid connect
        // with isv API that gives non expiring api bearer token
        if (!this.authenticated) {            
            this.userManager.signinPopup({
                popupWindowFeatures : 'location=no,toolbar=no,width=680,height=700'
            })
            .then((user) => {
                console.log(user);
                console.log("user" + JSON.stringify(user));
                this.bearerToken = user.access_token;            
                this.expirersAt = user.expires_at;
                document.cookie = 'commonDataServiceToken=' + this.bearerToken + '; expires=Fri, 19 Jun 2021 20:47:11 UTC;';
            })
            .catch(function(error) {
                console.error('error while logging in through the popup', error);
            });
        }
    }    
}
