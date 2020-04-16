<h1 align="center">Welcome to express-simple-routes 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/express-simple-routes" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/express-simple-routes.svg">
  </a>
  <a href="https://github.com/olliecee/express-simple-routes#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/olliecee/express-simple-routes/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
</p>

> Simple Routes makes it easy to import all your routes in any directory with optional authentication using Express.js 

This package has the following features:
<ul>
    <li>Get and use all routes in any directory</li>
    <li>Easily make routes private or public</li>
    <li>Protect private routes</li>
    <li>Provide basic authentication via authorization header</li>
    <li><small>- new -</small> Provide user context for your routes (needs authentication enabled)</li>
</ul>

### 🏠 [Homepage](https://github.com/olliecee/express-simple-routes#readme)

## Requirements
> express 4.x or higher

## Install

```sh
npm install express-simple-routes --save
```

## Usage

```javascript
const express = require('express')
const simple = require('express-simple-routes')
const authMiddleware = require('/custom/middleware') // optional

const app = simple(express)

app
.authenticate(authMiddleware) // optional
.routes({
    paths: ['src/routes', 'graphql/routes'],
    ignore: ['index.js']
})
.listen(4000, () => {
    console.log('🚀 Server` ready');
});
```

`src/routes/example.js`
```javascript
module.exports = [
    {
        method: 'POST',
        url: '/example',
        auth: false,
        handler: (req, res, context, next) => {
            
            // Non-authenticated route
            
            res.json({
                id: 1,
                first: 'Ollie',
                last: 'Cee'
            })
        }
    },
    {
        method: 'POST',
        url: '/example/auth',
        auth: true,
        handler: (req, res, { user }, next) => {

            // User context is passed into every route if its 
            // protected. To protect a route you must have a 
            // truthy value in auth

            res.json(user)
        }
    }
]
```

### Methods
#### authenticate([authMiddleware]), optional
This is whats going to allow you to return user context to your routes. You need to create authentication middleware 
that accepts a Bearer token in the authorization property from the header. 

This is optional and you can do this with just Express using `app.use()` if you want more customizations.

| Property | Description | Input | Output |
| --- | --- | --- | --- |
| authMiddleware | This controls whether or not a user is allowed to view content and provides user context into your [handler] | token | {User Object} |

##### Examples
Middleware (`authMiddleware.js`)
```javascript
module.exports = authMiddleware(token) {
    if (!isValidToken(token)) {
        // handle what your app does with an invalid token
    }
    return User.getByToken(token)
};
```
Entry point (`index.js`)
```javascript
const authMiddleware = require('authMiddleware')

app.authenticate(authMiddleware)
```
***
#### routes([options]), required
This method call should happen before calling the `listen` method. The `routes` method checks all routes in every module in every directory to see if it is a valid to be used for execution.

```javascript
app.routes({
    routes: [path.resolve(__dirname, 'routes')],
    ignore: ['index.js']
})
```

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| routes | Accepts a list of directories of routes to use with Express | Array[String] | `[]` |
| ignore | Controls which files get ignored in your route directories | Array[String] | `[]`

***
#### listen([port], [expressCallback]), required
This method call should be the last one. It is essentially the Express instance launching the application with our routes.
```javascript
app.routes(options)
   .listen(1234, () => {
      console.log('You:          Wow, amazing! Is it just this easy?')
      console.log('SimpleRoutes: Yes, now go build an amazing app!')
   })
```

## Author

👤 **olliecee <hello@olliecee.com> (https://olliecee.com)**

* Website: [olliecee.com](https://olliecee.com)
* Github: [@olliecee](https://github.com/olliecee)
* LinkedIn: [@linkedin.com\/in\/olliecee](https://linkedin.com/in/linkedin.com\/in\/olliecee)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/olliecee/express-simple-routes/issues). You can also take a look at the [contributing guide](https://github.com/olliecee/express-simple-routes/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!
