# express-discord-oauth2
An example on how to use Discord's OAuth2 in Node.js using Express

## Instalation
1. Install Node.JS [here](https://nodejs.org/)
2. To install the dependencies, run `npm install`

## Configuration
* `port`: The port the website will use
* `oauth2`:
  * `redirect_uri`: URI that you'll be redirected after Discord authorization
  * `client_id`: Your Discord application ID
  * `client_secret`: Your Discord application secret
  * `scopes`: Scopes that will be requested
  
  Discord's OAuth2 API docs: https://discord.com/developers/docs/topics/oauth2
  * `cookie`:
    * `maxAge`: Max age of cookies in milliseconds

----------------
You can read about Discord's OAuth2 API [here](https://discord.dev/topics/oauth2)
