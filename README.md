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

> Simple Routes can use single or multiple directories of routes with optional authentication middleware and filters. 

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
const routes = require('express-simple-routes')
const authMiddleware = require('/custom/middleware') // optional

const app = express()

routes(app, {
    routes: ['src/routes', 'graphql/routes'],
    ignore: ['index.js']
})
    .authenticate(authMiddleware), // optional
    .validate()
    .listen(4000, () => {
        console.log('🚀 Server ready')
    })
```

`src/routes/example.js`
```
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
        url: '/example',
        auth: true,
        handler: (req, res, { user }, next) => {

            // User context is passed into every route if its 
            // protected. To protect a route you must have a 
            // truthy value in auth

            res.send(user)
        }
    },
]
```

### Application
#### routes(expressInstance, [options])
| Property | Description | Type | Default |
| --- | --- | --- | --- |
| routes | This is used to obtain all modules in the array of directories you provide | Array | `["src/routes"]` |
| ignore | Controls which files get ignored in your route directories | Array | `[]`

### Methods
#### authenticate([authMiddleware]), optional
| Property | Description | Type | Default |
| --- | --- | --- | --- |
| authMiddleware | This controls whether or not a user is allowed to view content and provides user context into your [handler] | Function | null |

##### Examples
Middleware (`authMiddleware.js`)
```javascript
module.exports = authMiddleware(token) {
    if (!isValidToken(token)) {
        // ..
    }
    return User.getByToken(token)
};
```
Entry point (`index.js`)
```javascript
const autMiddleware = require('authMiddleware')

route(app, [options])
    .authenticate(authMiddleware)
```
***
#### validate(), required
```javascript
route(app, [options])
    .validate()
```
***
#### listen([port], [expressCallback]), required
```javascript
route(app, [options])
    .validate()
    .listen(1234, () => {
        console.log('Yay the server started with all our routes!')          
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
