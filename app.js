const express = require('express')
const config = require('./config.json')
const FormData = require('form-data')
const fetch = require('node-fetch')
const app = express()
const ejs = require('ejs')
app.use(require('express-session')(config.session))
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
    if (req.headers.cookie == undefined) {
        console.log('No Cookies Found')
        res.render('index.html', { signedIn: false, tokenRefreshed: 'false', json: {} })
    }
    if (req.headers.cookie !== undefined) {
        console.log('Cookies Found')
        if (req.headers.cookie.includes('bearer_token') == false) {
            console.log('No Bearer Token Found')
            if (req.headers.cookie.includes('refresh_token') == true) {
                console.log('Refresh Token Found')
                res.redirect('/login/refresh')
            }
            else {
                console.log('No Refresh Token Found')
                res.redirect('/login')
            }
        }
        else {
            console.log('Bearer Token Found')
            var bearer_token = req.headers.cookie.split('bearer_token=')[1].split(';')[0]
            var data = await fetch(`https://discord.com/api/users/@me`, {headers: { Authorization: `Bearer ${bearer_token}` } }) // Fetching user data
            var json = await data.json()
            if (req.query.tokenrefreshed == 'true') {
                console.log('Token Refreshed')
                res.render('index.html', { signedIn: true, tokenRefreshed: true, json })
            }
            else {
                res.render('index.html', { signedIn: true, tokenRefreshed: false, json })
            }
        }
    }
})

app.get('/login', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize` +
                 `?client_id=${config.oauth2.client_id}` +
                 `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
                 `&response_type=code&scope=${encodeURIComponent(config.oauth2.scopes.join(" "))}`)
})

app.get('/login/callback', async (req, res) => {
    const accessCode = req.query.code
    if (!accessCode) {return res.redirect('/401')}

    // Creating form to make request
    const data = new FormData()
    data.append('client_id', config.oauth2.client_id)
    data.append('client_secret', config.oauth2.client_secret)
    data.append('grant_type', 'authorization_code')
    data.append('redirect_uri', config.oauth2.redirect_uri)
    data.append('scope', 'identify')
    data.append('code', accessCode)

    // Making request to oauth2/token to get the Bearer token
    const json = await (await fetch('https://discord.com/api/oauth2/token', {method: 'POST', body: data})).json()

    // Setting cookie with Bearer token
    res.cookie("bearer_token", json.access_token, { maxAge: json.expires_in * 1000 })
    res.cookie("refresh_token", json.refresh_token)
    res.redirect('/') // Redirecting to main page
})

app.get('/login/refresh', async (req, res) => {
    const refreshToken = req.headers.cookie.split('refresh_token=')[1].split(';')[0]
    if (!refreshToken && !undefined) {return res.redirect('/401')}
    else {console.log('Refresh Token Found')}

    // Creating form to make request
    const data = new FormData()
    data.append('client_id', config.oauth2.client_id)
    data.append('client_secret', config.oauth2.client_secret)
    data.append('grant_type', 'refresh_token')
    data.append('refresh_token', refreshToken)

    // Making request to oauth2/token to get the Bearer token
    const json = await (await fetch('https://discord.com/api/oauth2/token', {method: 'POST', body: data})).json()

    // Setting cookie with Bearer token
    res.cookie("bearer_token", json.access_token, { maxAge: json.expires_in * 1000 })
    res.cookie("refresh_token", json.refresh_token)
    console.log('New Bearer and Refresh tokens set')
    res.redirect('/?tokenrefreshed=true') // Redirecting to main page
})

app.get('/logout', (req, res) => {
    var json = req.headers.cookie.split(';')
    res.clearCookie("bearer_token", json[0].replace('bearer_token=', ''))
    res.clearCookie("refresh_token", json[1].replace(' refresh_token=', ''))
    res.render('logout.html')
})

app.get('/error', (req, res) => {
    res.render('error.html')
})

app.get('/401', (req, res) => {
    res.render('401.html')
})

app.get('/404', (req, res) => {
    res.render('404.html')
})

app.get('*', (req, res) => {
    var route = req.url
    res.render('404.html', { route })
})

// Starting our application
app.listen(config.port, () => {
    console.log(`Listening at http://localhost:${config.port}/`)
})