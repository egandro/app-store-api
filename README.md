# app-store-api

Turns [app-store-scraper](https://github.com/facundoolano/app-store-scraper/) into a RESTful API.

This port is inspired by [google-play-api](https://github.com/facundoolano/google-play-api) as there was no app store version available.

To run locally:

```
npm install
npm start
```

## Example requests

The parameters for each endpoint are taken directly from app-store-scraper. For a full reference check its [documentation](https://github.com/facundoolano/app-store-scraper/#usage).

Get the top free apps (default list)

```http
GET /api/apps/
```

Get the top free apps with full detail

```http
GET /api/apps/?fullDetail=true
```

Get the top selling action games in russia

```http
GET /api/apps/?collection=topselling_paid&category=GAME_ACTION&country=ru
```

Get an app detail

```http
GET /api/apps/org.wikimedia.wikipedia/
```

You can also use the `id` instead of the `appId`

```http
GET /api/apps/324715238/
```

Get an app detail in spanish

```http
GET /api/apps/org.wikimedia.wikipedia/?lang=es
```

Get app required privacy with full descriptions
(use the `id` not the `appId`)

```http
GET /api/apps/324715238/privacy/
```

Get similar apps

```http
GET /api/apps/org.wikimedia.wikipedia/similar/
```

Get an app's reviews
(use the `id` not the `appId`)

```http
GET /api/apps/324715238/reviews/
```

Get an app's ratings
(upstream library is buggy - use the `id` not the `appId`)

```http
GET /api/apps/org.wikimedia.wikipedia/ratings/
```

Search apps

```http
GET /api/apps/?q=facebook
```

Get search suggestions for a partial term

```http
GET /api/apps/?suggest=face
```

Get apps by developer

```http
GET /api/developers/324715241/
```
