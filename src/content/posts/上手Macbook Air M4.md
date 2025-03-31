---
title: 上手Macbook Air M4
pubDate: 2025-03-26
categories: ['Articles', '生活记录', 'macos']
description: '第一次上手macos'
slug: 'using-macbook-air-for-first-time'
---

借着国补，入手了第一台mac，配置是M4 Air，24g内存+256g硬盘，在这里记录下第一次上手macos过程中遇到的一些问题。

这篇文章会持续更新我的使用体验。

## 更新

### 还没有解决的

1. 桌面到底在哪里啊
1. 怎么输入`option`/`command`的图像
1. android/macos在同一局域网下的文件传输

### 已经解决的

1. 如何在macos上截图

    `shift+command+3` / `shift+command+4`将截图内容保存至桌面。

    `control+shift+command+3` / `control+shift+command+4`截图到剪贴板。
    
1. 输入法
    
    安装了`rime`和鼠须管，目前体验还可以，需要注意添加输入法的地方，有一点弯弯绕绕。

## 第一印象

确实很轻，体验感不错，但第一次用mac感觉很不习惯，这里列一些平时在windows下常用的操作：

1. `win`键打开开始菜单，输入应用名称快速启动
    
    目前看来，启动应用程序在下面的docker（？是这么叫么）中的launch pad，里面能找到所有安装的app。mac应该也有一些能够快速启动app的方式，需要研究一下`raycast`？

1. Capslock切换大小写

    比起shift，我更常使用caps来输入大小写，mac上好像没有对应的按键？

1. 许多快捷键没有找到，需要一个shortcut cheatsheet.

    记录下现在找到的一些快捷键，以及一些我觉得可能需要的快捷键
    
   1. 强制退出 `command+option+esc`
   1. 切换到桌面（windows下的`win+d`）
   1. 一键最大化（windows下的`win+up`)

## 常用软件和一些mac生态

翻墙： monocloud自带的macos app

包管理： `homebrew`，安装和更新似乎非常慢，经常卡死

终端和shell： `zsh`是自带的，terminal尝试下`ghostty`。但我之前一直不知道terminal和shell两者到底是什么关系，借着用macos的机会可以好好搞清楚。

轻度开发和编辑： `vscode`, `cursor`
