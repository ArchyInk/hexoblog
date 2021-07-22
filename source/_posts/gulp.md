---
title: antd-tools中的gulp
date: 2021-07-22 15:14:23
tags: [AntDesignVue源码学习,前端,node]
---

首先三连

`npm install --global gulp-cli`

`npm install --save-dev gulp`

`gulp --version`

```
>gulp --version
CLI version: 2.3.0
Local version: 4.0.2
```



**测试**

创建gulpfile.js文件

```
function defaultTask(cb) {
  // place code for your default task here
  cb();
}

exports.default = defaultTask
```

在该目录下

`>gulp`

如需运行多个任务（task），可以执行 `gulp <task> <othertask>`

```
>gulp
[14:31:47] Using gulpfile D:\sgd_cd_pro\test\node\gulpfile.js
[14:31:47] Starting 'default'...
[14:31:47] Finished 'default' after 1.69 ms
```

**gulp和webpack的区别**

gulp注重前端开发流程，将我们重复繁琐的工作自动化执行和打包。

webpack注重模块化开发，把所有的文件模块化。

懂这个区别，也就大概能看懂AntDesignVue源码中使用gulp的意义了

**runTask**

Ant Design Vue里面有这样一个方法

```
function runTask(toRun) {
  const metadata = { task: toRun };
  // Gulp >= 4.0.0 (doesn't support events)
  const taskInstance = gulp.task(toRun);
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    taskInstance.apply(gulp);
    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    gulp.emit('task_err', err);
  }
}
```

函数名语义是执行任务，这个方法就是将命令行参数转换为gulp中的task即任务执行

所以后面我们来一个一个理解antd-tools这里面的工具有什么作用

