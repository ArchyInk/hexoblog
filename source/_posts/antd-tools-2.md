---
title: antd-tools详解（二）
date: 2021-07-23 15:18:11
tags: [AntDesignVue源码学习,Ant-tools,前端,node]
---

### dist

趁热打铁，直接看打包的代码吧

`"dist": "node --max_old_space_size=8192 antd-tools/cli/run.js dist",`

也就是这个命令

`gulp`执行`dist`任务，在`antd-tools\gulpfile.js`里面找到`dist`任务

```
gulp.task(
  'dist',
  gulp.series(done => {
    dist(done);
  }),
);
```

没有做其他事情，就是单纯调用`dist`方法

```
function dist(done) {
  rimraf.sync(path.join(cwd, 'dist'));
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(getProjectPath('webpack.build.conf.js'));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);
    done(0);
  });
}
```

打包调用的就是`webpack`的方法了

但别以为就是这么一小段

`webpackConfig`Ant-tools可是对其进行了大量的处理

我只把其中需要注意的说一下

##### webpack.build.conf.js

在`webpack.build.conf.js`中

一上来就有个注释

```
// noParse still leave `require('./locale' + name)` in dist files
// ignore is better
// http://stackoverflow.com/q/25384360
```

我看了下sf，大意是指webpack给moment打包会把所有语言文件打包进去，大大增加包体积。

所以最好用`ignorePlugin`把他忽略了

这个`js`文件exports了两个config

一个是`webpackConfig`另一个是`webpackDarkConfig`

应该是两个主题不同的配置，导出不同的样式文件

看样子以后写主题也要用类似的方法了，写UI库的时候尝试一下。

##### getWebpackConfig.js

*尝试打包了一下，打包好慢，花了四分多钟*

这个文件可就大了，差不多300行，其中大多数是配置和对各种类型文件的处理，其中运用了大量的插件，很多都是打包必须的插件，我不是很感兴趣。

但有个插件我很感兴趣

`WebpackBar`

引入`const WebpackBar = require('webpackbar');`

用法很简单

```
new WebpackBar({
   name: '🚚  Ant Design Vue Tools',//这个图标ant-tools使用时并没有加载出来
   color: '#2f54eb',
}),
```

改成自己的

```
new WebpackBar({
   name: 'Archy',
   color: '#2570a1',
}),
```

![cool](/images/0723_4.jpg)

**没什么卵用，但这样很coolllllllllll！！！**

然后执行打包

```
// Development
    const uncompressedConfig = merge({}, config, {
      entry: {
        [distFileBaseName]: entry,
      },
      mode: 'development',
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      ],
    });

    // Production
    const prodConfig = merge({}, config, {
      entry: {
        [`${distFileBaseName}.min`]: entry,
      },
      mode: 'production',
      plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({
          minimize: true,
        }),
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      ],
      optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin({})],
      },
    });
```

打了两份代码，一份压缩的，一份没有压缩的

最后返回了配置。
