'use strict';

import express from 'express';
import store from 'app-store-scraper';
import path from 'path';
import qs from 'querystring';

const router = express.Router();

const toList = (apps) => ({ results: apps });

const cleanUrls = (req) => (app) => Object.assign({}, app, {
  playstoreUrl: app.url,
  url: buildUrl(req, 'apps/' + app.appId),
  privacy: buildUrl(req, 'apps/' + app.appId + '/privacy'),
  similar: buildUrl(req, 'apps/' + app.appId + '/similar'),
  reviews: buildUrl(req, 'apps/' + app.appId + '/reviews'),
  ratings: buildUrl(req, 'apps/' + app.appId + '/ratings'),
  developer: {
    devId: app.developerId,
    url: buildUrl(req, 'developers/' + qs.escape(app.developerId))
  },
});

const buildUrl = (req, subpath) =>
  req.protocol + '://' + path.join(req.get('host'), req.baseUrl, subpath);

/* Index */
router.get('/', (req, res) =>
  res.json({
    apps: buildUrl(req, 'apps'),
    developers: buildUrl(req, 'developers'),
  }));

/* App search */
router.get('/apps/', function (req, res, next) {
  if (!req.query.q) {
    return next();
  }

  const opts = Object.assign({ term: req.query.q }, req.query);

  store.search(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* Search suggest */
router.get('/apps/', function (req, res, next) {
  if (!req.query.suggest) {
    return next();
  }

  const toJSON = (term) => ({
    term,
    url: buildUrl(req, '/apps/') + '?' + qs.stringify({ q: term })
  });

  store.suggest({ term: req.query.suggest })
    .then((terms) => terms.map(toJSON))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App list */
router.get('/apps/', function (req, res, next) {
  function paginate(apps) {
    const num = parseInt(req.query.num || '60');
    const start = parseInt(req.query.start || '0');

    if (start - num >= 0) {
      req.query.start = start - num;
      apps.prev = buildUrl(req, '/apps/') + '?' + qs.stringify(req.query);
    }

    if (start + num <= 500) {
      req.query.start = start + num;
      apps.next = buildUrl(req, '/apps/') + '?' + qs.stringify(req.query);
    }

    return apps;
  }

  store.list(req.query)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList).then(paginate)
    .then(res.json.bind(res))
    .catch(next);
});

/* App detail */
router.get('/apps/:appId', function (req, res, next) {
  const opts = Object.assign(appReq(req.params.appId), req.query);
  store.app(opts)
    .then(cleanUrls(req))
    .then(res.json.bind(res))
    .catch(next);
});

/* Similar apps */
router.get('/apps/:appId/similar', function (req, res, next) {
  const opts = Object.assign(appReq(req.params.appId), req.query);
  store.similar(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App privacy */
router.get('/apps/:appId/privacy', function (req, res, next) {
  const opts = Object.assign(appReq(req.params.appId), req.query);
  store.privacy(opts)
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* App reviews */
router.get('/apps/:appId/reviews', function (req, res, next) {
  function paginate(apps) {
    const page = parseInt(req.query.page || '0');

    const subpath = '/apps/' + req.params.appId + '/reviews/';
    if (page > 0) {
      req.query.page = page - 1;
      apps.prev = buildUrl(req, subpath) + '?' + qs.stringify(req.query);
    }

    if (apps.results.length) {
      req.query.page = page + 1;
      apps.next = buildUrl(req, subpath) + '?' + qs.stringify(req.query);
    }

    return apps;
  }

  const opts = Object.assign(appReq(req.params.appId), req.query);
  store.reviews(opts)
    .then(toList)
    .then(paginate)
    .then(res.json.bind(res))
    .catch(next);
});

/* App ratings */
router.get('/apps/:appId/ratings', function (req, res, next) {
  const opts = Object.assign(appReq(req.params.appId), req.query);
  store.ratings(opts)
    .then(toList)
    .then(res.json.bind(res))
    .catch(next);
});

/* Apps by developer */
router.get('/developers/:devId/', function (req, res, next) {
  const opts = Object.assign({ devId: req.params.devId }, req.query);

  store.developer(opts)
    .then((apps) => apps.map(cleanUrls(req)))
    .then((apps) => ({
      devId: req.params.devId,
      apps
    }))
    .then(res.json.bind(res))
    .catch(next);
});

/* Developer list (not supported) */
router.get('/developers/', (req, res) =>
  res.status(400).json({
    message: 'Please specify a developer id.',
    example: buildUrl(req, '/developers/' + '324715241' /* Wikimedia Foundation */)
  }));


function errorHandler(err, req, res, next) {
  res.status(400).json({ message: err.message });
  next();
}

function appReq(appId) {
  if(/^\d+$/.test(appId)) {
    return { id: appId };
  }
  return { appId: appId };
}

router.use(errorHandler);

export default router;
