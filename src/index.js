import fs from 'fs';
import path from 'path';

// Lets get rowdy baby
export default function simple(expressInstance) {
  const METHOD_ENUMS = {
    // This list come directly from Express's supported METHOD list
    CHECKOUT: 'checkout',
    COPY: 'copy',
    DELETE: 'delete',
    GET: 'get',
    HEAD: 'head',
    LOCK: 'lock',
    MERGE: 'merge',
    MKACTIVITY: 'mkactivity',
    MKCOL: 'mkcol',
    MOVE: 'move',
    ['M-SEARCH']: 'm-search',
    NOTIFY: 'notify',
    OPTIONS: 'options',
    PATCH: 'patch',
    POST: 'post',
    PURGE: 'purge',
    PUT: 'put',
    REPORT: 'report',
    SEARCH: 'search',
    SUBSCRIBE: 'subscribe',
    TRACE: 'trace',
    UNLOCK: 'unlock',
    UNSUBSCRIBE: 'unsubscribe'
  };

  function getModulesByPath(directory) {
    const modulePath = path.resolve(directory);
    const modules = fs.readdirSync(modulePath);

    return {
      modulePath,
      modules
    }
  }

  function getAllModulesInPath(paths) {
    if (paths instanceof String || typeof paths === 'string') {
      const { modulePath, modules } = getModulesByPath(paths);
      return [{
        modulePath,
        modules
      }]
    }
    return paths.reduce((acc, path) => {
      const { modulePath, modules } = getModulesByPath(path);
      acc.push({
        modulePath,
        modules
      });
      return acc;
    }, [])
  }

  function getAllRoutesByModules(modulesPaths, ignore) {
    let allRoutes = [];

    for (const { modules, modulePath } of modulesPaths) {
      for (const module of modules) {
        if (ignore instanceof String || typeof ignore === 'string') {
          if (ignore === module) {
            continue
          }
        }
        if (ignore.some(file => file === module)) {
          continue
        }
        let routes;

        // The import version of this is way too verbose but may be faster to execute. Relies on the job queue.
        routes = require(path.resolve(modulePath, module));
        routes = routeValidator(routes);

        allRoutes = allRoutes.concat(routes)
      }
    }

    return allRoutes
  }

  function routeValidator(routes, allowedKeys = ['method', 'url', 'handler', 'auth']) {
    if (routes.default) {
      routes = routes.default
    }

    const filteredRoutes = [];

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];

      if (!allowedKeys.every(allowedKey => route[allowedKey] !== undefined && route[allowedKey] !== null)) {
        continue
      }

      const method = route.method.toUpperCase();

      if (METHOD_ENUMS[method]) {
        route.method = METHOD_ENUMS[method];
      } else {
        continue
      }

      filteredRoutes.push(route)
    }

    return filteredRoutes
  }

  function simpleRoutesAuthenticator(routes) {
    routes.forEach(({ method, url, handler, auth }) => {
      this[method](url, function authCallback(req, res, next) {
        const user = req.context && req.context.user ? req.context.user : null;
        const context = new Object(null);
        context.user = user;
        delete req.context;

        // Authentication enabled route
        if (auth && !user) {
          res.send('Authenticated identities only')
        }

        handler(req, res, context, next);
      })
    });
  }

  return function main() {
    this.authenticate = function(middleware) {
      this.use(function(request, response, next) {
        let user, token, context = {
          user: null
        };

        if (request && request.headers && request.headers.authorization) {
          token = request.headers.authorization;
          token = token.replace('Bearer ', '');

          if (token && middleware) {
            try {
              user = middleware(token);
            } catch {
              user = null;
              console.error('simple-express-routes: Your authentication middleware threw an error')
            }
            if (user instanceof Promise) {
              middleware
                .then(result => user = result)
                .catch(() => {
                  user = null;
                  console.error('simple-express-routes: Your authentication middleware returned a promise that failed')
                })
            }
            context.user = user
          }
        }

        request.context = context;
        next()
      });

      return this
    };

    this.routes = function({ paths = [], ignore = [] }) {
      // Aggregate all modules per path
      const modules = getAllModulesInPath(paths);

      // Aggregate all routes per module
      const routes = getAllRoutesByModules(modules, ignore);

      // Protect routes (if specified) and add to the Express instance
      simpleRoutesAuthenticator.call(this, routes);

      return this
    };

    return this
  }.call(expressInstance())
}
