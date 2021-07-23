---
title: antd-tools详解（一）
date: 2021-07-22 16:44:24
tags: [AntDesignVue源码学习,Ant-tools,前端,node]
---

首先看看antd-design-vue根目录中的[package.json](https://github.com/vueComponent/ant-design-vue/blob/next/package.json)

从中可以看到antd-tools里面使用的工具有哪些

```
"compile": "node antd-tools/cli/run.js compile",

"generator-webtypes": "tsc -p antd-tools/generator-types/tsconfig.json && node antd-tools/generator-types/index.js",

"pub": "node --max_old_space_size=8192 antd-tools/cli/run.js pub",

"pub-with-ci": "node antd-tools/cli/run.js pub-with-ci",

"prepublish": "node antd-tools/cli/run.js guard",

"dist": "node --max_old_space_size=8192 antd-tools/cli/run.js dist",
```

目前看就是这6个工具

根据命令语义看

```
compile 编译
generator-webtypes 初始化
pub 发布 
pub-with-ci 在ci下pub（不懂） 
prepublish 预发布
dist 打包
```

一个个看吧

### compile

在`antd-tools\gulpfile.js`里能找到代码

```
gulp.task(
  'compile',
  gulp.series(gulp.parallel('compile-with-es', 'compile-with-lib'), done => {
    done();
  }),
);
```

`gulp.series()`和`gulp.parallel()`是gulp中的组合任务，允许将多个独立的任务组合为一个更大的操作，`series()` 和 `parallel()` 可以互相嵌套至任意深度。如果需要让任务（task）按顺序执行，请使用 `series()` 方法。对于希望以最大并发来运行的任务（tasks），可以使用 `parallel()` 方法将它们组合起来。

上面的意思就是创建一个名为`compile`的任务，这个任务是先执行并发的`compile-with-es`和`compile-with-lib`，然后执行回调。(这个回调貌似不是必要的？)

然后我们再来看看`compile-with-es`和`compile-with-lib`

##### compile-with-es

```
gulp.task('compile-with-es', done => {
  console.log('[Parallel] Compile to es...');
  compile(false).on('finish', done);
});
```

##### compile-with-lib

```
gulp.task('compile-with-lib', done => {
  console.log('[Parallel] Compile to js...');
  compile().on('finish', done);
});
```

看起来都是对`compile`的执行，然后来看看`compile`方法，也就是核心代码。

##### compile

```
function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);
  const less = gulp
    .src(['components/**/*.less'])
    .pipe(
      through2.obj(function (file, encoding, next) {
        this.push(file.clone());
        if (
          file.path.match(/\/style\/index\.less$/) ||
          file.path.match(/\/style\/v2-compatible-reset\.less$/)
        ) {
          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch(e => {
              console.error(e);
            });
        } else {
          next();
        }
      }),
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));
  const assets = gulp
    .src(['components/**/*.@(png|svg)'])
    .pipe(gulp.dest(modules === false ? esDir : libDir));
  let error = 0;
  const source = [
    'components/**/*.js',
    'components/**/*.jsx',
    'components/**/*.tsx',
    'components/**/*.ts',
    'typings/**/*.d.ts',
    '!components/*/__tests__/*',
  ];

  const tsResult = gulp.src(source).pipe(
    ts(tsConfig, {
      error(e) {
        tsDefaultReporter.error(e);
        error = 1;
      },
      finish: tsDefaultReporter.finish,
    }),
  );

  function check() {
    if (error && !argv['ignore-error']) {
      process.exit(1);
    }
  }

  tsResult.on('finish', check);
  tsResult.on('end', check);
  const tsFilesStream = babelify(tsResult.js, modules);
  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir));
  return merge2([less, tsFilesStream, tsd, assets]);
}
```

---

下班了，明天再来写           2021/7/22 17:22

---

继续            2021/7/23/ 10:09

---

*第一句就没看懂*

*`rimraf.sync(modules !== false ? libDir : esDir);`*

*rimraf是引入的插件`const rimraf = require('rimraf');`*

*名字很奇怪*

查了下是对rm -rf的包封装，那就不奇怪了

那这句话就是对旧包的删除了

不过编译的话第一步确实应该清理旧包，大意了，竟然没联想到



less变量是一个较长的链式调用，得拉出来单独看看

```
 const less = gulp
    .src(['components/**/*.less'])				    
    .pipe(											
      through2.obj(function (file, encoding, next) {
        this.push(file.clone());
        if (
          file.path.match(/\/style\/index\.less$/) ||
          file.path.match(/\/style\/v2-compatible-reset\.less$/)
        ) {
          transformLess(file.path)
            .then(css => {
              file.contents = Buffer.from(css);
              file.path = file.path.replace(/\.less$/, '.css');
              this.push(file);
              next();
            })
            .catch(e => {
              console.error(e);
            });
        } else {
          next();
        }
      }),
    )
    .pipe(gulp.dest(modules === false ? esDir : libDir));
```

`gulp.src()`创建流，文件系统中读取文件然后生成一个 Node 流（stream）。

`.pipe() `方法，用于连接转换流（Transform streams）或可写流（Writable streams），我理解的是文件操作写在这里面。

`through2` 听说使用gulp会常用到，但我还是第一次见，是对`transform stream`封装。

什么是transform stream呢，我也不知道，虽然我大学学习java出生，但看来我的java学的真的不行啊。

MDN是这么说的

> 在`TransformStream`所述的接口 [流API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 表示一组可变形的数据。

看来我得专门去巩固一下node的流了,单独开个文，等会儿回来

---

2021/7/23 10:55

---

2021/7/23 13:50 大概的巩固了一下stream，回来继续研究antd-tools

---

那么`through2.obj`里面就是对流的处理

一个`if`判断，对

` file.path.match(/\/style\/index\.less$/) ` 

`file.path.match(/\/style\/v2-compatible-reset\.less$/)`

这两种匹配或逻辑成立的时候特殊判断

这两种less有什么特殊的地方吗？

那就要看看怎么特殊处理的

```
 transformLess(file.path)
     .then(css => {
         file.contents = Buffer.from(css);
         file.path = file.path.replace(/\.less$/, '.css');
         this.push(file);
         next();
     })
     .catch(e => {
     	console.error(e);
     });
```

调用了`transformLess`方法

`transformLess`在同目录下,看来不是只有这个地方用了

```
function transformLess(lessFile, config = {}) {
  const { cwd = process.cwd() } = config;
  const resolvedLessFile = path.resolve(cwd, lessFile);

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, '');

  // Do less compile
  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [new NpmImportPlugin({ prefix: '~' })],
    javascriptEnabled: true,
  };
  return less
    .render(data, lessOpts)
    .then(result => postcss([autoprefixer]).process(result.css, { from: undefined }))
    .then(r => {
      return r.css;
    });
}
```

`  const { cwd = process.cwd() } = config;`
`const resolvedLessFile = path.resolve(cwd, lessFile);`

获取了less目录

读取文件流

然后`  data = data.replace(/^\uFEFF/, '');`删除文件中的\uFEFF,这是个啥？

> 文本保存时包含了BOM（Byte Order Mark，字节顺序标记，出现在文本文件头部，Unicode编码标准中用于标识文件是采用哪种格式的编码）,导致出现\uFEFF

又出现一个BOM= - =

接下来有句注释 `//Do less compile`

说明下面就是做less的编译了

`lessOpts`赋值就不用看了，直接看返回值`less.render().then().then()`

猜也能猜到是把less编译成css

**可是咋看来看去，还是用的less的API呢，我看这么久是为了啥？**

但中间用了个插件还是可以注意下`less-plugin-npm-import`

这个插件可以从npm包里面导入less

*但从两个匹配的less里面并没有看到从npm中引入的less文件*

*不知道为什么要用这个插件？*

*或者我没找到？*

*做完这些，就是调用`gulp.dest()`这个写入文件系统的方法了*

*到此链式调用理解完了*

***我真是啰嗦啊***

**看来看去，就是对less.render的调用**

**这一长串就是less的编译打包**

回到`compile`本身

接着下面分别是对

`components/**/*.@(png|svg)`

`components/**/*.js`

`components/**/*.jsx`

`components/**/*.tsx`

`components/**/*.ts`

`typings/**/*.d.ts`

`!components/*/__tests__/*`

的编译整理

其中ts特殊处理了一下，引入了`const ts = require('gulp-typescript');`

然后调用`ts(tsConfig,{})`



对错误情况进行了处理。

然后进行了babel处理

` const tsFilesStream = babelify(tsResult.js, modules);`

babel化之后在写入文件

babel化简单来说把 JavaScript 中 es2015/2016/2017/2046 的新语法转化为 es5，让低端运行环境(如浏览器和 node )能够认识并执行。

**非常牛逼的工具，解决了前端工作者一大痛点。**



最后一句话

` return merge2([less, tsFilesStream, tsd, assets]);`

把所有流按队列整合为一个流

---

妈的，也不复杂的东西我怎么写了这么多，以后写文得精简了

