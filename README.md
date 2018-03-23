### 背景
SimplePosts是一个基于[Dingo Blog](https://github.com/dingoblog/dingo)内核进一步简化的博客系统。后台改用AdminLTE2面板，前台改用了hux的theme。

### 截图
![Dingo](http://ygjs-static-hz.oss-cn-beijing.aliyuncs.com/images/2018-03-22/TIM%E6%88%AA%E5%9B%BE20180322174243.png)

### 安装
```
$ go get github.com/luohao-brian/SimplePosts
```

### 数据库
SimplePosts使用mysql，配置文件db.json,  默认配置如下：

```
{
    "db_host":"127.0.0.1",
    "db_port":3306,
    "db_user":"root",
    "db_pass":"root",
    "db_name":"dingo"
}
```
使用之前，参考如下命令创建数据库：
```
mysql -uroot -proot -e "create database dingo;"
```



### 使用
```
$ cd $GOPATH/src/github.com/luohao-brian/SimplePosts
$ go run main.go --port 8000
```
