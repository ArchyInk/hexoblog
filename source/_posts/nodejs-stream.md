---
title: nodejs-stream流
date: 2021-07-23 10:38:18
tags: [node,stream]
---

看antd-tools源码，发现自己对node流还是不是很理解，再巩固一下

参考[知乎-破晓](https://zhuanlan.zhihu.com/p/36728655)

觉得写得挺清楚，可以直接去看

### 什么是流

> 流是数据的集合 - 就像数组或者字符串。
>
> 他们之间的区别是流可能不是一次性获取到的，它们不需要匹配内存。
>
> 这让流在处理大容量数据，或者从一个额外的源每次获取一块数据的时候变得非常强大。

#### 先来创建文件

这个文件在[参考文章](https://zhuanlan.zhihu.com/p/36728655)里面说有大概400MB，但我创建出来只有56.2MB左右，应该是原作者算错了，57个字节乘100万行，应该就是56M左右。

```
const fs = require('fs');
const file = fs.createWriteStream('./big.file');
for(let  i = 0;i<=1e6;i++) {
    file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit. \n');
}
file.end();
```

#### 再来读取文件

然后新建一个stream-server.js用node服务器读取big.file

```
const fs = require('fs');
const server = require('http').createServer();
server.on('request', (req, res) => {
    fs.readFile('./big.file', (err, data) => {
        if(err) throw err;
        res.end(data);
    })
});
server.listen(8000);
```

然后 `node strea,-server.js`启动，到`localhost:8000`

会看到一大串字符出现的同时，右边滚动条在不断上划，说明数据在不断变多

打开控制台Network,会看到

![f12](/images/0723_1.jpg)

就像水流一样不断地注入浏览器



可能这就是(stream)流名字的由来



但是我们在谷歌浏览器标题栏右键打开任务管理器后发现，这个网页内存占用非常的大，达到了170wK(这里的K是不是Kb？)

![任务管理器](/images/0723_2.jpg)

为什么呢？

我们之前的方式就像把水倒到水缸里，但是我们只需要一点点用水，水缸里的水就浪费了水缸的空间。

所以现在我们需要换种方式。

```
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  const src = fs.createReadStream('./big.file');
  src.pipe(res);
});

server.listen(8000);
```

`pipe`就是管道的意思，这种方式就是相当于我们不用水缸了，直接用水龙头，用多少接多少，不用浪费水缸的地方了，毕竟房价挺贵的，一个水缸放现在一两万了。

然后我们再运行，看内存占用

![任务管理器](/images/0723_3.jpg)

我擦，怎么没变

翻车了-、-

咋回事儿呢，扎回事儿呢，歪！？



换成cmd `curl localhost:8000 `也是没看到内存有区别， 都是一样的卡，难道osx和windows堆内存的管理不同？还是我对pipe的理解有误。

希望有人看到可以帮我解答一下

***所以以上文字可能都是错的！***

#### 四种基本流

> 在 Node.js 中有四种基本的流类型：Readable（可读流），Writable（可写流），Duplex（双向流），Transform（转换流）。
>
> - 可读流是数据可以被消费的源的抽象。一个例子就是 fs.createReadStream 方法。
> - 可读流是数据可以被写入目标的抽象。一个例子就是 fs.createWriteStream 方法。
> - 双向流即是可读的也是可写的。一个例子是 TCP socket。
> - 转换流是基于双向流的，可以在读或者写的时候被用来更改或者转换数据。一个例子是 zlib.createGzip 使用 gzip 算法压缩数据。你可以将转换流想象成一个函数，它的输入是可写流，输出是可读流。你或许也听过将转换流成为“通过流（through streams）”。

#### pipe 方法

> 通常建议使用 pipe 方法或者事件来消费流，但是不要混合使用它们。通常当你使用 pipe 方法时，不需要使用事件，但是如果你学要用更多自定义的方式使用流，那么就需要使用事件的方式。

#### Stream事件

以下建议去看原文，因为再写我应该也是照搬了，都是api里的东西。

[知乎-破晓](https://zhuanlan.zhihu.com/p/36728655)
