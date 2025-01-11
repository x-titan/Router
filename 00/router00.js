class Router_ {
  constructor(basePath = '') {
    this.basePath = basePath; // Базовый путь для текущего роутера
    this.routes = []; // Хранилище маршрутов
    this.subRouters = []; // Хранилище вложенных роутеров
  }

  // Добавление маршрута
  addRoute(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  // Подключение вложенного роутера
  use(basePath, subRouter) {
    subRouter.basePath = this.basePath + basePath; // Привязываем вложенный роутер к базовому пути
    this.subRouters.push(subRouter);
  }

  // Обработка запроса
  handleRequest(method, url) {
    // Проверяем маршруты текущего роутера
    for (let route of this.routes) {
      const fullPath = this.basePath + route.path;
      const params = this.matchRoute(fullPath, url);
      if (params && route.method === method) {
        return route.handler(params);
      }
    }

    // Если не найдено — передаём запрос вложенным роутерам
    for (let subRouter of this.subRouters) {
      const result = subRouter.handleRequest(method, url);
      if (result) return result; // Если вложенный роутер обработал запрос, выходим
    }

    console.log(`Маршрут для ${method} ${url} не найден`);
  }

  // Сопоставление маршрута
  matchRoute(routePath, requestPath) {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    if (routeParts.length !== requestParts.length) return null;

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1); // Убираем ":"
        params[paramName] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return null; // Если часть маршрута не совпала, возвращаем null
      }
    }
    return params;
  }
}

// --- Пример использования вложенных роутеров ---

// Главный роутер
const mainRouter = new Router_();

// Роутер для пользователей
const userRouter = new Router_();
userRouter.addRoute('GET', '/', () => {
  console.log('Список пользователей');
});
userRouter.addRoute('GET', '/:id', (params) => {
  console.log(`Пользователь с ID: ${params.id}`);
});

// Роутер для постов пользователя
const postRouter = new Router_();
postRouter.addRoute('GET', '/', (params) => {
  console.log(`Список постов пользователя с ID: ${params.id}`);
});
postRouter.addRoute('GET', '/:postId', (params) => {
  console.log(
    `Пост с ID: ${params.postId} пользователя с ID: ${params.id}`
  );
});

// Подключаем вложенные роутеры
userRouter.use('/:id/posts', postRouter);
mainRouter.use('/users', userRouter);

// --- Обработка запросов ---
mainRouter.handleRequest('GET', '/users'); // Список пользователей
mainRouter.handleRequest('GET', '/users/123'); // Пользователь с ID: 123
mainRouter.handleRequest('GET', '/users/123/posts'); // Список постов пользователя с ID: 123
mainRouter.handleRequest('GET', '/users/123/posts/456'); // Пост с ID: 456 пользователя с ID: 123
mainRouter.handleRequest('GET', '/products'); // Маршрут не найден
