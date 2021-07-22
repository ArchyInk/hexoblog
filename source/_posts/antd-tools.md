---
title: antd-tools详解（一）
date: 2021-07-22 16:44:24
tags: [AntDesignVue源码学习,工具,前端,node]
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

### complile

在`antd-tools\gulpfile.js`里能找到方法体

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

不过下班了，明天再来写                     																			2021/7/22 17:22

---

