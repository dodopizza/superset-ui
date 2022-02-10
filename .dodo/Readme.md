# How to connect superset and superset-ui?

After you published the plugin to dodopizza npm:

- you need to update the version of the plugin in `superset/superset-frontend/package.json`
- you need to redeploy `superset` using `superset-plugins` repo's actions

## How to deploy plugins to dodopizza npm?

1. After finishing all the coding and checking, go to the `package.json` of that plugin and update
   the version

```
"version": "0.1.0", => "version": "0.2.0",
```

2. Check that you have npmrc set to dodopizza

```
npmrc dodopizza
```

You should see something like this:

```
Removing old .npmrc (default)
Activating .npmrc "dodopizza"
```

3. Do not forget to put it back to default later

```
npmrc

Available npmrcs:

 * default
   dodopizza
```

3. Do `npm publish`

3.1 If you see this:

```
npm ERR! code ENEEDAUTH
npm ERR! need auth This command requires you to be logged in.
npm ERR! need auth You need to authorize this machine using `npm adduser`
```

Then you did not do npmrc properly.

3.2 If you see this:

```
npm notice === Tarball Details ===
npm notice name:          @dodopizza/superset-plugin-chart-echarts
npm notice version:       0.2.0
npm notice filename:      @dodopizza/superset-plugin-chart-echarts-0.2.0.tgz
npm notice package size:  4.9 MB
npm notice unpacked size: 6.3 MB
npm notice shasum:        fb3155d1e9e5a5f8a1fe466b7a854cd604a031a7
npm notice integrity:     sha512-e8eRd9Nv/DX4F[...]A0o/zTI2Pm3Yg==
npm notice total files:   436
npm notice
+ @dodopizza/superset-plugin-chart-echarts@0.2.0
```

Then you did everything correctly. Checkkout the superset-ui repo and you ll see the updated
package.

4. You are amazing
