# bot-typescript

Starter kit for TypeScript bot for Automa

Please read the [Bot Development](https://docs.automa.app/bot-development) docs to understand how an [Automa][automa] bot works and how to develop it.

- `/automa` endpoint is the receiver for the webhook from [Automa][automa]
- `update` function in `src/update.ts` is the logic responsible for updating code.
- `AUTOMA_WEBHOOK_SECRET` environment variable is available to be set instead of hard-coding it.

### Production

Start the app in production mode:

```sh
pnpm build
NODE_ENV=production pnpm start
```

Needs [git](https://git-scm.org) to be installed on production.

### Development

Start the app in development mode:

```sh
pnpm dev
pnpm start # In separate tab
```

### Testing

Run tests with:

```sh
pnpm build
pnpm test
```

### Stack

- Uses [fastify](https://fastify.io/) as a server.

[automa]: https://automa.app
