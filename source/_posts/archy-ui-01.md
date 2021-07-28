---
title: 开发一个自己的组件库ArchyUi（一）
date: 2021-07-28 10:23:54
tags: [ArchyUI，前端]
---

### 前言

毕业在公司上班快一年了，目前也负责了几个项目的前端。

这半年负责的一个新项目底下有十来个系统，所有系统的基础框架是我写的，但当时时间很紧，公司之前也没有好的前端技术沉淀，所以是从零开始写的框架，没有稳定版本，也没有形成依赖包，甚至没有测试过。导致后来开发后，基础框架有修改，需要所有系统手动修改基础框架的内容。现在项目快结束了（真是他妈的一次痛苦的项目经历）。开始沉淀技术，形成稳定版本，并形成本地的npm依赖包。不会开源，因为开源需要申请。但会分享一些开发过程。

### 借鉴

之前也看过了[Ant-Design-Vue](https://github.com/vueComponent/ant-design-vue/blob/next)源码，目前也准备在此基础上进行开发。想完全从零开发，效率低下而且我还没那个水平。

### 规划

1. 建好项目结构
2. 写好工具
3. 开发组件
4. 测试npmLink
5. 完成

### 项目结构

首先用`vue create archyui`新建`vue3`项目

然后是最轻松的建项目环节，借鉴了一下[Ant-Design-Vue](https://github.com/vueComponent/ant-design-vue/blob/next)，最后是这样的

![目录](/images/0728_1.jpg)

```
assets-基础资源
components-组件
docs-文档
examples-展示组件，开发中用于组件调试，开发完用于组件库展示
icons-图标
node_modules-三方依赖
tests-测试
tools-工具
types-ts类型定义
```

### 工具开发

之前把Ant-design工具的源码拉出来看了，也写了解析，[这里](http://archy.ink/antd-tools-1/)

##### examples

首先是把`examples`用起来

先把`package.json`,`scripts`命令改一下

```
  "scripts": {
    "example-serve": "vue-cli-service serve",
    "example-build": "vue-cli-service build"
  },
```

用作起程序和打包

然后新建个`vue.config.js`

```
module.exports = {
  pages: {
    index: {
      entry: 'examples/index.js',
      template: 'examples/index.html',
    },
  }
}
```

改一下`template`路径和`js`路径

至于`examples`文件夹里面有什么，其实暂时就是最基础的运行程序

```
//examples/index.html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Cache-Control"
      content="no-cache, no-store, must-revalidate"
    />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>Archy UI</title>
    <link rel="shortcut icon" type="image/x-icon" href="./favicon.ico" />
  </head>

  <body>
    <noscript>
      <strong>JS加载失败</strong>
    </noscript>
    <div id="app" style="padding: 50px"></div>
  </body>
</html>
```

```
//examples/App.vue
<template>
  <h1>Archy UI</div>
  <HelloWorld />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { HelloWorld } from "../components";

@Options({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  data() {
    return {
    };
  }
}
</script>

<style lang="less"></style>

```

```
//examples/index.js
import { createApp, version } from 'vue'
import App from './App.vue'

const pkg = require('../package.json')

console.log('Vue version:' + version)
console.log('Archy UI version:' + pkg.version);

const app = createApp(App)

app.mount('#app')

```

最后执行

`yarn example-server`

成功运行

![界面](/images/0728_2.jpg)

##### jest测试

以前没用过单元测试，这次学习一下

但遇到了个问题

`import { shallowMount } from '@vue/test-utils'`

这句话一直报错`找不到模块“@vue/test-utils”或其相应的类型声明`

排查了一下，发现`@vue/test-utils``2.0.0-rc.11`不知道为什么`dist`里面没有类型声明文件了

`package.json`里面固定了一下版本`"@vue/test-utils": "2.0.0-rc.10"`就可以了

顺便`package.json`里面把命令加了`"test:unit": "vue-cli-service test:unit"`

然后输入`yarn test:unit example`

![测试成功](/images/0728_3.jpg)

##### 命令行工具开发

先三连

`yarn add colorful --dev`

`yarn add gulp --dev`

`yarn add commander --dev`

三个工具之前都是介绍过的

[colorful](http://archy.ink/colorful/)

[gulp](http://archy.ink/gulp/)

[commander](http://archy.ink/commander/)

顺便再介绍一个[炫酷的东西](https://patorjk.com/software/taag/),生成Banner，像这样

```
                     .__                .__ 
_____ _______   ____ |  |__ ___.__.__ __|__|
\__  \\_  __ \_/ ___\|  |  <   |  |  |  \  |
 / __ \|  | \/\  \___|   Y  \___  |  |  /  |
(____  /__|    \___  >___|  / ____|____/|__|
     \/            \/     \/\/              
```

先来个帮助命令

在`package.json`里面加两个脚本

```
    "tools": "node tools/cli/index.js",
    "ui-help": "node tools/cli/help.js"
```

建一个对象`_scripts`用来存储帮助信息

```
  "_scripts": {
    "example-serve": "run example serve,use for developing debug and show components after finished ",
    "example-build": "build example for show components page",
    "test:unit": "unit test",
    "tools": "run tools,the source code path is /tools/",
    "ui-help": "run ui help"
  },
```

然后在`tools`下新建`cli/index.js`和`cli/help.js`

没什么好讲的，直接上代码

```
/*
 * @Author: Archy
 * @Date: 2021-07-28 16:05:16
 * @LastEditors: Archy
 * @LastEditTime: 2021-07-28 16:31:02
 * @FilePath: \archyui\tools\cli\help.js
 * @description:
 */
'use strict'

require('colorful').colorful()
require('colorful').isatty = true
const program = require('commander')
const pkg = require('../../package.json')

program.version(
  `
  version:${pkg.version.to.bold.blue.color}
  `,
  '-v, --version',
  `display current ${'ArchyUI'.to.bold.blue.color} version`
)

program.addHelpText('beforeAll', `
█████╗  ██████╗  ██████╗██╗  ██╗██╗   ██╗██╗   ██╗██╗
██╔══██╗██╔══██╗██╔════╝██║  ██║╚██╗ ██╔╝██║   ██║██║
███████║██████╔╝██║     ███████║ ╚████╔╝ ██║   ██║██║
██╔══██║██╔══██╗██║     ██╔══██║  ╚██╔╝  ██║   ██║██║
██║  ██║██║  ██║╚██████╗██║  ██║   ██║   ╚██████╔╝██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝

`.to.bold.blue.color)
program.name('yarn or npm run').usage('[scripts] options')
program.helpOption(false)

Object.entries(pkg._scripts).forEach((item) => {
  program.option(item[0], item[1])
})

program.parse(process.argv)

const proc = program.runningCommand

if (proc) {
  proc.on('close', process.exit.bind(process))
  proc.on('error', () => {
    process.exit(1)
  })
}

program.help()

```

```
/*
 * @Author: Archy
 * @Date: 2021-07-28 14:32:12
 * @LastEditors: Archy
 * @LastEditTime: 2021-07-28 16:26:44
 * @FilePath: \archyui\tools\cli\index.js
 * @description: 
 */
'use strict'

require('colorful').colorful()
require('colorful').isatty = true
const program = require('commander')
const pkg = require('../../package.json')

program.version(
  `
  █████╗  ██████╗  ██████╗██╗  ██╗██╗   ██╗██╗   ██╗██╗
  ██╔══██╗██╔══██╗██╔════╝██║  ██║╚██╗ ██╔╝██║   ██║██║
  ███████║██████╔╝██║     ███████║ ╚████╔╝ ██║   ██║██║
  ██╔══██║██╔══██╗██║     ██╔══██║  ╚██╔╝  ██║   ██║██║
  ██║  ██║██║  ██║╚██████╗██║  ██║   ██║   ╚██████╔╝██║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝

  
  version:${pkg.version.to.bold.blue.color}
  `,
  '-v, --version',
  `display current ${'ArchyUi'.to.bold.blue.color} version`
)
program.option('-h, --help', `display ${'help'.to.bold.blue.color} for command`)

program.addHelpText(
  'beforeAll',
  '✂  ArchyUI Tools'.to.bold.blue.color,
)
program.name('<yarn tools|npm run tools>')
program.parse(process.argv)
const proc = program.runningCommand

if (proc) {
  proc.on('close', process.exit.bind(process))
  proc.on('error', () => {
    process.exit(1)
  })
}

const subCmd = program.args[0]
if (!subCmd) {
  program.help()
}

```

**注意**

关于`banner`要注意的是

`\`要用`\\`代替，不然无法显示

里面涉及到很多`commander`	的方法，不懂的话建议去看文档[Commander.js](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md)写得很清楚

测试一下，在根目录输入`yarn ui-help`

![1](/images/0728_4.jpg)

输入`yarn tools`

![1](/images/0728_5.jpg)

