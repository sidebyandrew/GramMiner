# 操作指南

For English , read [README-EN.md](README-EN.md)


## 一，前提条件

本代码在 MacBook 环境测试成功。

如果你是Window或者Linux等环境，你需要自己编译 TON 源代码，并将其中的 ton/build/crypto/pow-miner 文件复制到本项目中。
TON的编译过程见：https://github.com/ton-blockchain/ton

注意，一定要用 '--recursive' 去 clone 代码，因为其中有submodule。
```git clone --recursive  git@github.com:ton-blockchain/ton.git```

## 二、运行

1. 首先, 需要安装 Nodejs https://nodejs.org/en ，已安装则下一步
2. 新建一个 .env 文件，输入 MNEMONIC='a b c d e f g...'，其中a b c 为你的助记词
3. 安装依赖，命令行输入  yarn install
4. 执行脚本  yarn run start


## 三、问题

1. 本脚本只在我的 MacBook 环境测试，Window或者Linux等环境没有验证，理论上可行，
2. 执行脚本异常，再试几次
3. 如果还有问题，Telegram 联系 @andrew_tonx (不保证有空回答)


## 四、答谢

如果脚本对你有帮助，欢迎打赏 Andrew 的钱包地址：
UQBOop4AF9RNh2DG1N1yZfzFM28vZNUlRjAtjphOEVMd0j-8

