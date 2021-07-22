---
title: 开发cli必备的commander工具
date: 2021-07-22 10:42:17
tags: [AntDesignVue源码学习，前端，node]
---

开发cli必备

文档，竟然有中文，对我这种四级都没过得辣鸡太友好了

[Commander.js](https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md)

首先

## Install

```
npm install commander
```

## Declaring

```
const { program } = require('commander');
```

## API

### version

```
program.version('0.0.1').parse(process.argv);
//console 
//node commander.js -V
0.0.1
program.version('0.0.1','-v,--version').parse(process.argv);
//console 
//node commander.js -v or --version
0.0.1
```

### option

Commander 使用`.option()` 方法来定义选项，同时可以附加选项的简介。每个选项可以定义一个短选项名称（-后面接单个字符）和一个长选项名称（--后面接一个或多个单词），使用逗号、空格或`|`分隔。

选项可以通过在`Command`对象上调用`.opts()`方法来获取。对于多个单词的长选项，使用驼峰法获取，例如`--template-engine`选项通过`program.opts().templateEngine`获取。

```
program
  .version('0.0.1', '-v, --version')
  .option('-d, --debug', 'debug')
  .option('-s, --small', 'small')
  .option('-p, --type <type>', 'type')

program.parse(process.argv)

const options = program.opts()
if (options.debug) console.log(options)
console.log('details:')
if (options.small) console.log('- small')
if (options.type) console.log(`- ${options.type}`)

//node commander.js -h
Usage: commander [options]

Options:
  -v, --version      output the version number
  -d, --debug        debug
  -s, --small        small
  -p, --type <type>  type
  -h, --help         display help for command

//node commander -d
{debug:true}
details:

//node comander -d -s 
{debug:true,small:true}
details:
- smaill 

//node comander -d -s -t chinese
{debug:true,small:true,type:chinese}
details:
- smaill 
- chinese

```

选项可以设置默认值

```
//选项可以设置一个默认值。
program
  .option('-c, --cheese <type>', 'add the specified type of cheese', 'blue');
program.parse();

console.log(`cheese: ${program.opts().cheese}`);
```

#### 其他的选项类型

**取反选项**
可以定义一个以`no-`开头的`boolean`型长选项。在命令行中使用该选项时，会将对应选项的值置为false。当只定义了带`no-`的选项，未定义对应不带`no-`的选项时，该选项的默认值会被置为true。

如果已经定义了`--foo`，那么再定义`--no-foo`并不会改变它本来的默认值。可以为一个`boolean`类型的选项指定一个默认的布尔值，在命令行里可以重写它的值。

```
program
  .version('0.0.1', '-v, --version')
  .option('-o, --option','show options')
  .option('--no-gf', 'no object')

program.parse(process.argv)

const options = program.opts()
if (options.option) console.log(options)
//node commander -o
{ gf: true, option: true }
//node commander -o --no-gf
{ gf: false, option: true }
```

**选项的参数使用方括号声明表示参数是可选参数（如 `--optional [value]`）。**

该选项在不带参数时可用作boolean选项，在带有参数时则从参数中得到值。

**选项的参数使用尖括号声明表示参数是必填参数（如 `--optional <value>`）。**

必填选项要么设有默认值，要么必须在命令行中输入，对应的属性字段在解析时必定会有赋值。该方法其余参数与`.option`一致。

**选项的参数使用...前缀表示参数是变长参数（如`--optional <...value>`)。**

在命令行中，用户可以输入多个参数，解析后会以数组形式存储在对应属性字段中。在输入下一个选项前（-或--开头），用户输入的指令均会被视作变长参数。与普通参数一样的是，可以通过`--`标记当前命令的结束。

**其他选项配置**

大多数情况下，选项均可通过`.option()`方法添加。但对某些不常见的用例，也可以直接构造`Option`对象，对选项进行更详尽的配置。

```
const { program, Option } = require('commander')

program
  .addOption(new Option('-s, --secret').hideHelp())
  .addOption(
    new Option('-t, --timeout <delay>', 'timeout in seconds').default(
      60,
      'one minute'
    )
  )
  .addOption(
    new Option('-d, --drink <size>', 'drink size').choices([
      'small',
      'medium',
      'large',
    ])
  )
program.parse()
console.log('Options: ', program.opts());

//node commander --help
Usage: commander [options]

Options:
  -t, --timeout <delay>  timeout in seconds (default: one minute)
  -d, --drink <size>     drink size (choices: "small", "medium", "large")
  -h, --help             display help for command
  
//node commander -s
Options:  { timeout: 60, secret: true }

//node commander -d big
error: option '-d, --drink <size>' argument 'big' is invalid. Allowed choices are small, medium, large.
```

**自定义选项处理**

选项的参数可以通过自定义函数来处理，该函数接收两个参数：用户新输入的参数值和当前已有的参数值（即上一次调用自定义处理函数后的返回值），返回新的选项参数值。

自定义函数适用场景包括参数类型转换，参数暂存，或者其他自定义处理的场景。



**有点多，时间原因不每一个都看完了**

**把常用的看了理解了**

**总不能一次性把所有知识全学完吧**

