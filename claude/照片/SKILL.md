---
name: feishu-at-guide
description: 飞书 @ 功能完整指南 - 包含成功方法、失败案例和最佳实践
platform: feishu
version: 1.0.0
---

# Feishu @ Guide - 飞书 @ 功能完整指南

> 记录 @ 功能的成功方法、失败案例和最佳实践

---

## ✅ 成功方法

### 1. 群聊 @（必须同时有 user_id 和用户名）

**格式：**
```
<at user_id="ou_xxx">用户名</at>
```

**关键特征（缺一不可）：**
- ✅ `user_id="ou_xxx"` — 有双引号包裹
- ✅ `用户名` — 标签内必须有用户名文本(如无法获取，可直接使用`user_id`)
- ✅ 非自闭合标签

**成功示例：**
```
<at user_id="ou_xxx">旅途</at> 你好！
<at user_id="ou_xxx">朱迪</at> 早上好！
<at user_id="ou_xxx">ou_xxx</at> 早上好！
```

**适用场景：**
- 私聊/群聊消息（必须此格式）
- 频道消息
- 需要 @ 的时候

---

## 📋 快速对照表

| 场景 | 格式 | 示例 | 状态 |
|------|------|------|------|
| **私聊/群聊 @** | `<at user_id="ou_xxx">用户名</at>` | `<at user_id="ou_09dd0e6cf986d07666fa71f988d7d52a">旅途</at>` | ✅ **唯一有效格式** |
| 私聊 @ | `<at user_id="ou_xxx">ou_xxx</at>` | `<at user_id="ou_09dd0e6cf986d07666fa71f988d7d52a">ou_09dd0e6cf986d07666fa71f988d7d52a</at>` | ✅ 可用 |
| ❌ 自闭合格式 | `<at id=ou_xxx></at>` | `<at id=ou_xxx></at>` | ❌ **错误格式** |
| @ 所有人 | `@_all` | `@_all` | ✅ 可用 |

**核心结论：** 
- ✅ **唯一有效格式**：`<at user_id="ou_xxx">用户名</at>`
- ⚠️ **必须同时有**：`user_id`（带引号）+ `用户名`（标签内文本）
- ❌ **群聊中无效**：`<at id=...></at>` 自闭合格式

---

## 🔧 使用方法

### 在回复中 @ 用户

```python
# 获取 user_id 从消息 metadata
user_id = "ou_09dd0e6cf986d07666fa71f988d7d52a"
user_name = "旅途"  # 需要查询或已知

# 构建 @ 消息
at_message = f'<at user_id="{user_id}">{user_name}</at> 回复内容'
```

### 获取用户信息（推荐方式）

**从 Sender Metadata 获取（最可靠）**

每条入站消息的 metadata 中包含 Sender 信息：

```json
{
  "label": "ou_09dd0e6cf986d07666fa71f988d7d52a",
  "name": "ou_09dd0e6cf986d07666fa71f988d7d52a"
}
```

| 字段 | 含义 | 用途 |
|------|------|------|
| `Sender.label` | 用户 ID（飞书 ou_xxx 格式） | **用于 @ 的 user_id** |
| `Sender.name` | 用户名/显示名 | **用于 @ 标签内的用户名** |

**使用示例：**
```python
# 从入站消息 metadata 获取
user_id = sender.label      # ou_09dd0e6cf986d07666fa71f988d7d52a
user_name = get_user_name(user_id)  # 从记忆系统或 API 查询真实用户名

# 构建 @ 消息
at_message = f'<at user_id="{user_id}">{user_name}</at> 回复内容'
```

---

**其他获取方式：**

**方法 1：飞书 API 查询（需要凭证）**
```python
# 需要配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET
# 调用飞书用户 API 查询用户信息
```

**方法 2：记忆系统记录**
```python
# 第一次交互时记录 user_id -> 用户名映射
# 存储在 memory/feishu-users.md 中供后续使用
```

---

## 💡 最佳实践

### 1. 优先使用文本消息格式
- 除非发送卡片消息，否则一律用 `<at user_id="...">用户名</at>`

### 2. 用户名获取策略
- 有 API 权限：实时查询
- 无 API 权限：首次交互时询问并记录

### 3. 记忆映射关系
```
memory/feishu-users.md:
- ou_09dd0e6cf986d07666fa71f988d7d52a: 旅途 (管理员)
- ou_xxxx: 其他用户
```

### 4. 群聊 vs 私聊
- **群聊**：必须 @ 对方，否则不知道在跟谁说话
- **私聊**：可以不用 @，但 @ 了更清晰

### 5. 安全注意
- 不要在群聊中泄露敏感 user_id
- 用户映射关系属于隐私信息，妥善存储

---

## 📝 版本记录

**v1.0.1** (2026-02-25)
- 更新：添加从 Sender metadata 获取用户信息的详细说明
- 明确 Sender.label 和 Sender.name 的用途

**v1.0.0** (2026-02-25)
- 初始版本
- 记录成功和失败案例
- 总结最佳实践
- 作者：旅途的小虾 & 旅途

---

## 相关技能

- `feishu-at` - 基础 @ 功能封装
- `feishu-messaging` - 飞书消息发送
- `feishu-user-lookup` - 用户查询
