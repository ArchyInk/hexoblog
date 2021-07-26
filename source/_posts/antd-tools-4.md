---
title: antd-tools详解（四）
date: 2021-07-26 13:52:04
tags: [AntDesignVue源码学习,Ant-tools,前端,node]
---

上午调休半天。

---

直接来看` "pub": "node --max_old_space_size=8192 antd-tools/cli/run.js pub"`这句命令的代码

```
gulp.task(
  'pub',
  gulp.series('check-git', 'compile', 'dist', done => {
    // if (!process.env.GITHUB_TOKEN) {
    //   console.log('no GitHub token found, skip');
    // } else {
    //   pub(done);
    // }
    pub(done);
  }),
);
```

按顺序执行`check-git`,`compile`和`dist`三个任务

`compile`和`dist`已经看过了

直接看`check-git`看语义应该是`git`验证相关

```
gulp.task(
  'check-git',
  gulp.series(done => {
    runCmd('git', ['status', '--porcelain'], (code, result) => {
      if (/^\?\?/m.test(result)) {
        return done(`There are untracked files in the working tree.\n${result}
      `);
      }
      if (/^([ADRM]| [ADRM])/m.test(result)) {
        return done(`There are uncommitted changes in the working tree.\n${result}
      `);
      }
      return done();
    });
  }),
);
```

执行了`runCmd`方法，看起来像是执行命令行命令的方法

```
function runCmd(cmd, _args, fn) {
  const args = _args || [];
  const runner = require('child_process').spawn(cmd, args, {
    // keep color
    stdio: 'inherit',
    env: getRunCmdEnv(),
  });

  runner.on('close', code => {
    if (fn) {
      fn(code);
    }
  });
}
```

有些知识盲区，查一下

> `child_process.spawn(command[, args][, options])`
>
> **command：** 将要运行的命令
>
> **args：** Array 字符串参数数组
>
> **options Object**
>
> - `cwd` `String` 子进程的当前工作目录
> - `env` `Object` 环境变量键值对
> - `stdio` `Array|String` 子进程的 `stdio` 配置
> - `detached` `Boolean` 这个子进程将会变成进程组的领导
> - `uid` `Number` 设置用户进程的 ID
> - `gid` `Number` 设置进程组的 ID

`options`里面`stdio`传入了`inherit`,相当于子进程将使用父进程的标准输入输出。

其他参数还有

>`options.stdio` 选项用于配置在父进程和子进程之间建立的管道。 默认情况下，子进程的标准输入、标准输出和标准错误被重定向到 `ChildProcess`对象上相应的 `subprocess.stdin`、`subprocess.stdout` 和 `subprocess.stderr`流。 这相当于将 `options.stdio` 设置为等于 `['pipe', 'pipe', 'pipe']`。
>
>为方便起见，`options.stdio` 可能是以下字符串之一：
>
>- `'pipe'`: 相当于 `['pipe', 'pipe', 'pipe']`（默认）
>- `'overlapped'`: 相当于 `['overlapped', 'overlapped', 'overlapped']`
>- `'ignore'`: 相当于 `['ignore', 'ignore', 'ignore']`
>- `'inherit'`: 相当于 `['inherit', 'inherit', 'inherit']` 或 `[0, 1, 2]`

[参考](http://nodejs.cn/api/child_process.html#child_process_event_spawn)

`env`传入了`getRunCmdEnv()`

研究一下

```

module.exports = function getRunCmdEnv() {
  const env = {};
  Object.keys(process.env).forEach(key => {
    env[key] = process.env[key];
  });
  // make sure `antd-tools/node_modules/.bin` in the PATH env
  const nodeModulesBinDir = path.join(__dirname, '../../node_modules/.bin');

  Object.entries(env)
    .filter(
      v =>
        v
          .slice(0, 1)
          .pop()
          .toLowerCase() === 'path',
    )
    .forEach(v => {
      const key = v.slice(0, 1).pop();
      env[key] = env[key] ? `${nodeModulesBinDir}:${env[key]}` : nodeModulesBinDir;
    });
  return env;
};
```

对`env`进行了修改，确保`antd-tools/node_modules/.bin`在环境变量中，但只在这个进程里有用。

没啥好看的，具体实现就是一堆高阶函数。

回到`check-git`，实质就是执行了`git status --porcelain`命令，就是展示改动状态。

但是`pub`命令实质就是编译并打包，最后执行`pub`方法。

```
function pub(done) {
  const notOk = !packageJson.version.match(/^\d+\.\d+\.\d+$/);
  let tagString;
  if (argv['npm-tag']) {
    tagString = argv['npm-tag'];
  }
  if (!tagString && notOk) {
    tagString = 'next';
  }
  if (packageJson.scripts['pre-publish']) {
    runCmd('npm', ['run', 'pre-publish'], code2 => {
      if (code2) {
        done(code2);
        return;
      }
      publish(tagString, done);
    });
  } else {
    publish(tagString, done);
  }
}
```

调用了`guard`任务，其实是一个错误警报

然后调用`publish`真正的发布方法，其中又调用了`tag`方法，发布配置，包括邮箱地址等等和执行`gitpush`命令，还有`githubRelease`方法，应该是开源信息，不是很懂，非常的详尽。

**但我应该不会用。**

---

到此为止，`antd-tools`源码就看完了，具体可能会用到的其实就是`compile`和`dist`，其他的`publish`要用也会改简单一点，毕竟我只是一个人，并不需要大公司那种团队协作必需的详尽流程。

`generator-webtypes`是个比较方便的功能，可能会写一个`vscode`版本的。



主要是学习了写命令行工具的方法，学习了很多知识，收益颇丰(*^▽^*)

`Ant-Tools`完结，接下来看下`ant-design`的结构。
