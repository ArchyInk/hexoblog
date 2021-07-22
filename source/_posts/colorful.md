---
title: colorful工具
date: 2021-07-21 15:04:58
tags: [AntDesignVue源码学习,前端]
---

### colorful

antd-tools/cli/index.js里面有`require('colorful').colorful()`

npm里有介绍，是在终端里显示颜色的

```javascript
require('colorful').colorful()
require('colorful').isatty = true;

console.log('hello'.to.red.color);
```

终端显示就是红色的hello，具体用法暂时不去了解，但是很cool

