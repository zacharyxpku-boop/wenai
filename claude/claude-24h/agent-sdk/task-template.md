# 高效任务模板

## 写任务的黄金法则
- 一个任务 = 一个独立可验证的改动
- 明确指定文件路径和上下文
- 给出验收标准

## 模板

```json
{
  "id": "feat-user-login",
  "prompt": "请完成以下任务：\n\n## 目标\n在 src/api/auth.ts 中实现用户登录接口\n\n## 要求\n- POST /api/login 接受 {email, password}\n- 使用 bcrypt 验证密码\n- 返回 JWT token (有效期24h)\n- 参考 src/api/users.ts 的代码风格和错误处理方式\n\n## 约束\n- 不要修改已有的接口\n- 使用项目已有的依赖，不要安装新的包\n\n## 完成标准\n- 代码通过 TypeScript 编译无错误\n- 添加对应的单元测试\n- git commit 到当前分支",
  "projectDir": "C:\\Users\\86136\\Desktop\\my-project",
  "status": "pending",
  "priority": 1
}
```

## 任务粒度参考

### 太大（拆分它）
- "重构整个认证系统"
- "实现完整的用户管理模块"

### 刚好（直接执行）
- "给 UserService.create() 添加邮箱格式验证"
- "将 src/utils/date.js 从 moment 迁移到 dayjs"
- "修复 #123: 分页查询在最后一页返回空数组的 bug"
- "为 src/api/orders.ts 中的所有接口添加单元测试"

### 太小（合并它）
- "给变量改个名"
- "加一行注释"
