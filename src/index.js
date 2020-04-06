import fs from 'fs';
import path from 'path';

// Lets get rowdy baby
export default function SimpleRoutes(expressInstance, { routes: routesDirectory = ['src/routes'], ignore = [] }) {
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

  function getAllModulesInPath() {
    if (routesDirectory instanceof String || typeof routesDirectory === 'string') {
      const { modulePath, modules } = getModulesByPath(routesDirectory);
      return [{
        modulePath,
        modules
      }]
    }
    return routesDirectory.reduce((acc, path) => {
      const { modulePath, modules } = getModulesByPath(path);
      acc.push({
        modulePath,
        modules
      });
      return acc;
    }, [])
  }

  function getAllRoutesByModules(modulesPaths) {
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

        routes = require(path.resolve(modulePath, module));
        routes = routeValidator(routes);

        allRoutes = allRoutes.concat(routes)
      }
    }

    return allRoutes
  }

  const routeValidator = function(routes, allowedKeys = ['method', 'url', 'handler', 'auth']) {
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
  };

  function simpleRoutesAuthenticator(routes) {
    routes.forEach(({ method, url, handler, auth }) => {
      expressInstance[method](url, function(req, res, next) {
        if (auth && !req.context.user) {
          res.send('Authenticated identities only')
        } else {
          // To support different kinds of contexts in the future (if need be). Possible 1.5 feature!
          // const context = { ...req.context };
          const context = new Object(null);
          context.user = req.context.user;
          delete req.context;
          handler(req, res, context, next);
        }
      })
    });
  }

  // Public API
  return {
    authenticate: function(authenicator) {
      // Authentication middleware
      expressInstance.use(function(request, response, next) {
        let token, context = {
          user: null
        };

        if (request && request.headers && request.headers.authorization) {
          token = request.headers.authorization;
          token = token.replace('Bearer ', '');

          if (token && authenicator) {
            context.user = authenicator(token);
          }
        }

        request.context = context;
        next()
      });

      return this
    },
    validate: function(callback) {
      // Aggregate all modules per path
      const modules = getAllModulesInPath();

      // Aggregate all routes per module
      const routes = getAllRoutesByModules(modules);

      // Protect routes (if specified) and add to the Express instance
      simpleRoutesAuthenticator(routes);

      if (callback) {
        callback(routes);
      }

      return this
    },
    listen: function(options, callback) {
      expressInstance.listen.apply(expressInstance, [options, callback]);

      return this
    }
  };
}
