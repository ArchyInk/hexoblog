---
title: antd-tools详解（三）
date: 2021-07-23 16:26:06
tags: [AntDesignVue源码学习,Ant-tools,前端,node]
---

我突然发现

`"generator-webtypes": "tsc -p antd-tools/generator-types/tsconfig.json && node antd-tools/generator-types/index.js"`

这个工具并不是使用的`gulp`进行的任务，先看一下

### generator-webtypes 

看了下竟然是根据文档生成JetBrains代码提示的

用法还挺复杂，还没找到文档，只有自己看了

```
  parseAndWrite({
    version: pkg.version,
    name: 'types',
    path: path.resolve(rootPath, './v2-doc/src/docs'),
    // default match lang
    test: /index\.md/,
    outputDir: path.resolve(rootPath, './vetur'), 
    tagPrefix: 'a-',
  });
```

调用是这么调用的，`test`匹配规则我改成了`index.md`，原来是`es-US.md`

`async function readMarkdown(options: Options)`

先读取markdown文档

上面的调用的方法的话，那就得在`./v2-doc/src/docs`里面放文档

然后formatter一下

formatter方法里面做了一下几件事

1. 并且根据文件名生成组件名，他会直接把短横线删除并且把驼峰式转为前缀加短横线模式
2. 检索文件中的table，根据table名称来决定放在那个数组里
3. 如果table名称是API，并且里面包含了插槽（slot等)字段，会把这一行信息放进，slots[]
4. 如果table名称是API，但没有包含slot，则放进attributes[]
5. 如果table名称是events，会把事件放进，events[]
6. 如果table名称里面包含了组件名称，并且不是events，则说明是额外的子组件，则执行上面的所有流程

挺复杂的，但意外的觉得好用，如果我不是个vscode忠实用户的话。



想给vscode写一个了。

就这么愉快地决定了。



---

周末啦，下班啦 2021/7/23 17:37

---

