# FEAT-P1-OPS 测试报告 — 运营学员/项目/派单

- **执行时间**: 2026-09-15T07:04:38.927Z
- **关联 AC**: AC-P1-03
- **测试角色**: 运营
- **总体结论**: ✅ **通过**

## 测试用例

### FEAT-P1-OPS 运营创建学员与项目并发布

- **结果**: ✅ PASS
- **耗时**: 3170 ms



## 测试步骤（设计）

1. 启动本地后端 `:3000` 与前端 `:5173`
2. Chrome 浏览器自动化执行用户操作
3. 断言页面可见性与 API 权限
4. 每步全页截图存档

## 截图证据

- [FEAT-P1-OPS-project-created.png](../screenshots/FEAT-P1-OPS-project-created.png)
- [FEAT-P1-OPS-project-published.png](../screenshots/FEAT-P1-OPS-project-published.png)
- [FEAT-P1-OPS-student-created.png](../screenshots/FEAT-P1-OPS-student-created.png)

## 后端日志摘录

```
{"level":30,"time":1789455844316,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sx","req":{"method":"GET","url":"/api/v1/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":55675},"msg":"incoming request"}
{"level":30,"time":1789455844317,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sx","res":{"statusCode":200},"responseTime":1.019099999917671,"msg":"request completed"}
{"level":30,"time":1789455844318,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sy","req":{"method":"GET","url":"/api/v1/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":55677},"msg":"incoming request"}
{"level":30,"time":1789455844319,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sy","res":{"statusCode":200},"responseTime":0.8388000000268221,"msg":"request completed"}
{"level":30,"time":1789455844372,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sz","req":{"method":"GET","url":"/api/v1/projects/13","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":55679},"msg":"incoming request"}
{"level":30,"time":1789455844374,"pid":25208,"hostname":"XS-202511210729","reqId":"req-sz","res":{"statusCode":200},"responseTime":1.3296000000555068,"msg":"request completed"}
{"level":30,"time":1789455844376,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t0","req":{"method":"GET","url":"/api/v1/projects/13","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":58738},"msg":"incoming request"}
{"level":30,"time":1789455844378,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t0","res":{"statusCode":200},"responseTime":1.349999999976717,"msg":"request completed"}
{"level":30,"time":1789455844413,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t1","req":{"method":"POST","url":"/api/v1/projects/13/coaching-records","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":56297},"msg":"incoming request"}
{"level":30,"time":1789455844416,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t1","res":{"statusCode":201},"responseTime":2.728400000021793,"msg":"request completed"}
{"level":30,"time":1789455844446,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t2","req":{"method":"POST","url":"/api/v1/projects/13/deliverables","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":60167},"msg":"incoming request"}
{"level":30,"time":1789455844450,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t2","res":{"statusCode":201},"responseTime":3.185399999958463,"msg":"request completed"}
{"level":30,"time":1789455845890,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t3","req":{"method":"POST","url":"/api/v1/auth/login","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":63888},"msg":"incoming request"}
{"level":30,"time":1789455845935,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t3","res":{"statusCode":200},"responseTime":44.910900000017136,"msg":"request completed"}
{"level":30,"time":1789455845946,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t4","req":{"method":"GET","url":"/api/v1/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":63891},"msg":"incoming request"}
{"level":30,"time":1789455845948,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t4","res":{"statusCode":200},"responseTime":1.8810999999986961,"msg":"request completed"}
{"level":30,"time":1789455845950,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t5","req":{"method":"GET","url":"/api/v1/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":63894},"msg":"incoming request"}
{"level":30,"time":1789455845951,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t5","res":{"statusCode":200},"responseTime":1.2606999999843538,"msg":"request completed"}
{"level":30,"time":1789455845997,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t6","req":{"method":"GET","url":"/api/v1/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":63896},"msg":"incoming request"}
{"level":30,"time":1789455845998,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t6","res":{"statusCode":200},"responseTime":0.9602999999187887,"msg":"request completed"}
{"level":30,"time":1789455846000,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t7","req":{"method":"GET","url":"/api/v1/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":63898},"msg":"incoming request"}
{"level":30,"time":1789455846001,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t7","res":{"statusCode":200},"responseTime":0.8980999999912456,"msg":"request completed"}
{"level":30,"time":1789455846047,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t8","req":{"method":"GET","url":"/api/v1/projects/13","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":56992},"msg":"incoming request"}
{"level":30,"time":1789455846048,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t8","res":{"statusCode":200},"responseTime":1.1341999999713153,"msg":"request completed"}
{"level":30,"time":1789455846050,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t9","req":{"method":"GET","url":"/api/v1/projects/13","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":57657},"msg":"incoming request"}
{"level":30,"time":1789455846051,"pid":25208,"hostname":"XS-202511210729","reqId":"req-t9","res":{"statusCode":200},"responseTime":1.023200000054203,"msg":"request completed"}
{"level":30,"time":1789455846105,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ta","req":{"method":"POST","url":"/api/v1/projects/13/completion/submit","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":60164},"msg":"incoming request"}
{"level":30,"time":1789455846109,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ta","res":{"statusCode":200},"responseTime":4.101400000043213,"msg":"request completed"}
{"level":30,"time":1789455846114,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tb","req":{"method":"GET","url":"/api/v1/projects/13","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":49986},"msg":"incoming request"}
{"level":30,"time":1789455846115,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tb","res":{"statusCode":200},"responseTime":1.1552000000374392,"msg":"request completed"}
{"level":30,"time":1789455851447,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tc","req":{"method":"POST","url":"/api/v1/auth/login","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":54256},"msg":"incoming request"}
{"level":30,"time":1789455851493,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tc","res":{"statusCode":200},"responseTime":46.15969999996014,"msg":"request completed"}
{"level":30,"time":1789455851522,"pid":25208,"hostname":"XS-202511210729","reqId":"req-td","req":{"method":"GET","url":"/api/v1/ops/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":54258},"msg":"incoming request"}
{"level":30,"time":1789455851523,"pid":25208,"hostname":"XS-202511210729","reqId":"req-td","res":{"statusCode":200},"responseTime":1.0593000000808388,"msg":"request completed"}
{"level":30,"time":1789455851525,"pid":25208,"hostname":"XS-202511210729","reqId":"req-te","req":{"method":"GET","url":"/api/v1/ops/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":54260},"msg":"incoming request"}
{"level":30,"time":1789455851526,"pid":25208,"hostname":"XS-202511210729","reqId":"req-te","res":{"statusCode":200},"responseTime":0.8355000000447035,"msg":"request completed"}
{"level":30,"time":1789455851570,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tf","req":{"method":"GET","url":"/api/v1/ops/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64556},"msg":"incoming request"}
{"level":30,"time":1789455851571,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tg","req":{"method":"GET","url":"/api/v1/ops/students","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64557},"msg":"incoming request"}
{"level":30,"time":1789455851571,"pid":25208,"hostname":"XS-202511210729","reqId":"req-th","req":{"method":"GET","url":"/api/v1/ops/experts","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64558},"msg":"incoming request"}
{"level":30,"time":1789455851571,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ti","req":{"method":"GET","url":"/api/v1/dictionaries/all","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64560},"msg":"incoming request"}
{"level":30,"time":1789455851572,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tf","res":{"statusCode":200},"responseTime":1.2815000000409782,"msg":"request completed"}
{"level":30,"time":1789455851572,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tg","res":{"statusCode":200},"responseTime":0.932799999951385,"msg":"request completed"}
{"level":30,"time":1789455851572,"pid":25208,"hostname":"XS-202511210729","reqId":"req-th","res":{"statusCode":200},"responseTime":0.8022999999811873,"msg":"request completed"}
{"level":30,"time":1789455851572,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ti","res":{"statusCode":200},"responseTime":0.7848000000230968,"msg":"request completed"}
{"level":30,"time":1789455851577,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tj","req":{"method":"GET","url":"/api/v1/ops/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50403},"msg":"incoming request"}
{"level":30,"time":1789455851577,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tk","req":{"method":"GET","url":"/api/v1/ops/students","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50404},"msg":"incoming request"}
{"level":30,"time":1789455851577,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tl","req":{"method":"GET","url":"/api/v1/ops/experts","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50405},"msg":"incoming request"}
{"level":30,"time":1789455851577,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tm","req":{"method":"GET","url":"/api/v1/dictionaries/all","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50406},"msg":"incoming request"}
{"level":30,"time":1789455851578,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tk","res":{"statusCode":200},"responseTime":1.1516999999294057,"msg":"request completed"}
{"level":30,"time":1789455851578,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tj","res":{"statusCode":200},"responseTime":1.5825999999651685,"msg":"request completed"}
{"level":30,"time":1789455851579,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tl","res":{"statusCode":200},"responseTime":1.2951999999349937,"msg":"request completed"}
{"level":30,"time":1789455851579,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tm","res":{"statusCode":200},"responseTime":1.313800000003539,"msg":"request completed"}
{"level":30,"time":1789455851608,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tn","req":{"method":"POST","url":"/api/v1/ops/projects/13/completion/confirm","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":51824},"msg":"incoming request"}
{"level":30,"time":1789455851611,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tn","res":{"statusCode":200},"responseTime":3.2036000000080094,"msg":"request completed"}
{"level":30,"time":1789455851617,"pid":25208,"hostname":"XS-202511210729","reqId":"req-to","req":{"method":"GET","url":"/api/v1/ops/projects","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50530},"msg":"incoming request"}
{"level":30,"time":1789455851617,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tp","req":{"method":"GET","url":"/api/v1/ops/students","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50531},"msg":"incoming request"}
{"level":30,"time":1789455851617,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tq","req":{"method":"GET","url":"/api/v1/ops/experts","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50532},"msg":"incoming request"}
{"level":30,"time":1789455851617,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tr","req":{"method":"GET","url":"/api/v1/dictionaries/all","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":50533},"msg":"incoming request"}
{"level":30,"time":1789455851617,"pid":25208,"hostname":"XS-202511210729","reqId":"req-to","res":{"statusCode":200},"responseTime":0.8122999999905005,"msg":"request completed"}
{"level":30,"time":1789455851618,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tp","res":{"statusCode":200},"responseTime":0.6766000000061467,"msg":"request completed"}
{"level":30,"time":1789455851618,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tq","res":{"statusCode":200},"responseTime":0.6267999999690801,"msg":"request completed"}
{"level":30,"time":1789455851618,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tr","res":{"statusCode":200},"responseTime":0.7227999999886379,"msg":"request completed"}
{"level":30,"time":1789455854213,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ts","req":{"method":"POST","url":"/api/v1/auth/login","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64731},"msg":"incoming request"}
{"level":30,"time":1789455854258,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ts","res":{"statusCode":200},"responseTime":45.35200000007171,"msg":"request completed"}
{"level":30,"time":1789455854270,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tt","req":{"method":"GET","url":"/api/v1/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64733},"msg":"incoming request"}
{"level":30,"time":1789455854272,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tt","res":{"statusCode":200},"responseTime":1.4950999999418855,"msg":"request completed"}
{"level":30,"time":1789455854273,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tu","req":{"method":"GET","url":"/api/v1/dashboard","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64735},"msg":"incoming request"}
{"level":30,"time":1789455854274,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tu","res":{"statusCode":200},"responseTime":0.9363000000594184,"msg":"request completed"}
{"level":30,"time":1789455854319,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tv","req":{"method":"GET","url":"/api/v1/income/summary","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64738},"msg":"incoming request"}
{"level":30,"time":1789455854319,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tw","req":{"method":"GET","url":"/api/v1/income/transactions","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64741},"msg":"incoming request"}
{"level":30,"time":1789455854320,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tv","res":{"statusCode":200},"responseTime":0.8802999999606982,"msg":"request completed"}
{"level":30,"time":1789455854320,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tw","res":{"statusCode":200},"responseTime":0.8268999999854714,"msg":"request completed"}
{"level":30,"time":1789455854321,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tx","req":{"method":"GET","url":"/api/v1/income/summary","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":60780},"msg":"incoming request"}
{"level":30,"time":1789455854322,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ty","req":{"method":"GET","url":"/api/v1/income/transactions","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":60782},"msg":"incoming request"}
{"level":30,"time":1789455854322,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tx","res":{"statusCode":200},"responseTime":0.7999999999301508,"msg":"request completed"}
{"level":30,"time":1789455854322,"pid":25208,"hostname":"XS-202511210729","reqId":"req-ty","res":{"statusCode":200},"responseTime":0.6809999999823049,"msg":"request completed"}
{"level":30,"time":1789455854815,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tz","req":{"method":"POST","url":"/api/v1/auth/login","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64506},"msg":"incoming request"}
{"level":30,"time":1789455854858,"pid":25208,"hostname":"XS-202511210729","reqId":"req-tz","res":{"statusCode":200},"responseTime":43.52859999996144,"msg":"request completed"}
{"level":30,"time":1789455854863,"pid":25208,"hostname":"XS-202511210729","reqId":"req-u0","req":{"method":"GET","url":"/api/v1/admin/experts/certifications","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":64506},"msg":"incoming request"}
{"level":30,"time":1789455854863,"pid":25208,"hostname":"XS-202511210729","reqId":"req-u0","res":{"statusCode":403},"responseTime":0.3260000000009313,"msg":"request completed"}
```

## 备注

- 测试数据使用时间戳后缀，避免与历史数据冲突
- 权限用例 AC-P1-02 通过 API 直接验证运营 Token 无法访问 admin 端点
