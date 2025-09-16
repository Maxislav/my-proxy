# proxy server

## start
````
yarn install 
yarn run tsc-be:w
yarn run dev
````

## deploy and run

````
yarn run super-prod
yarn global add pm2
pm2 start ecosystem.config.js
````

## note
```
http port: 9999
https port: 9191
```

## username pass

```
const expectedUsername = 'my';
const expectedPassword = 'pass';
```