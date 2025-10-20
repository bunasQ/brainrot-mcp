import open, { apps } from 'open';

await open('https://google.com', {
  app: {
    name: apps.chrome,
    arguments: ['--autoplay-policy=no-user-gesture-require']
  }
});
