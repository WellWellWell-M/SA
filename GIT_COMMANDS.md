# Git 命令速查手册

## 📋 目录
- [日常工作流程](#日常工作流程)
- [查看状态和历史](#查看状态和历史)
- [提交相关](#提交相关)
- [回退和撤销](#回退和撤销)
- [分支操作](#分支操作)
- [远程仓库](#远程仓库)
- [实用技巧](#实用技巧)

---

## 🔄 日常工作流程

### 基本流程
```bash
# 1. 修改文件（在编辑器中）

# 2. 查看修改了什么
git status

# 3. 添加到暂存区
git add -A

# 4. 提交到本地仓库
git commit -m "描述性的提交信息"

# 5. 推送到远程仓库（发布）
git push
```

### 一行命令版本
```bash
# 添加并提交
git add -A && git commit -m "描述信息"

# 添加、提交并推送
git add -A && git commit -m "描述信息" && git push
```

---

## 👀 查看状态和历史

### 查看当前状态
```bash
# 查看哪些文件被修改
git status

# 查看具体修改内容
git diff

# 查看已暂存的修改
git diff --staged
```

### 查看提交历史
```bash
# 查看最近 10 条提交（简洁版）
git log --oneline -10

# 查看详细提交历史
git log

# 查看某个文件的修改历史
git log -p index.html

# 查看某次提交的详细内容
git show 0479c54
```

---

## 💾 提交相关

### 添加文件到暂存区
```bash
# 添加所有修改（推荐）
git add -A

# 添加指定文件
git add index.html index-public.html

# 添加当前目录所有文件
git add .
```

### 提交
```bash
# 标准提交
git commit -m "描述信息"

# 快捷提交（自动 add 已跟踪的文件）
git commit -am "描述信息"

# 修改最近一次提交信息
git commit --amend -m "新的提交信息"
```

---

## ⏪ 回退和撤销

### 撤销最近一次提交

#### 保留修改（推荐）
```bash
# 撤销 commit，但保留文件修改
git reset --soft HEAD~1

# 现在可以重新修改，然后重新提交
git add -A
git commit -m "新的提交信息"
```

#### 丢弃修改（危险）
```bash
# ⚠️ 撤销 commit 并删除所有修改
git reset --hard HEAD~1
```

### 回退到指定版本
```bash
# 1. 查看提交历史，找到版本号
git log --oneline -10

# 2. 回退到指定版本（保留修改）
git reset --soft 3c30a0f

# 或者回退并丢弃修改
git reset --hard 3c30a0f
```

### 撤销某个文件的修改
```bash
# 恢复文件到最近一次提交的状态
git checkout HEAD -- index.html

# 恢复文件到指定版本
git checkout 3c30a0f -- index.html
```

### 撤销已推送的提交（推荐）
```bash
# 创建一个反向提交来撤销
git revert HEAD

# 或者撤销指定的提交
git revert 0479c54

# 然后推送
git push
```

### 强制回退远程仓库（不推荐）
```bash
# ⚠️ 危险操作！会改写历史
git reset --hard HEAD~1
git push --force
```

---

## 🌿 分支操作

### 查看分支
```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a
```

### 切换分支
```bash
# 切换到已存在的分支
git checkout main
git checkout public

# 创建并切换到新分支
git checkout -b new-branch
```

### 合并分支
```bash
# 将指定分支合并到当前分支
git merge other-branch
```

---

## 🌐 远程仓库

### 推送和拉取
```bash
# 推送到远程仓库
git push

# 推送并设置上游分支
git push -u origin main

# 拉取远程更新
git pull

# 只拉取不合并
git fetch
```

### 查看远程信息
```bash
# 查看远程仓库地址
git remote -v

# 查看远程分支
git branch -r
```

---

## 🛠️ 实用技巧

### 临时保存修改
```bash
# 保存当前修改（不提交）
git stash

# 查看保存的修改
git stash list

# 恢复最近保存的修改
git stash pop

# 恢复但不删除保存
git stash apply
```

### 比较差异
```bash
# 比较工作区和暂存区
git diff

# 比较暂存区和最近一次提交
git diff --staged

# 比较两个提交
git diff 3c30a0f 0479c54

# 比较两个分支
git diff main public
```

### 查找和搜索
```bash
# 在提交历史中搜索
git log --grep="关键词"

# 查找谁修改了某一行
git blame index.html

# 搜索代码内容
git grep "搜索内容"
```

### 清理和维护
```bash
# 删除未跟踪的文件（预览）
git clean -n

# 删除未跟踪的文件（执行）
git clean -f

# 删除未跟踪的文件和目录
git clean -fd
```

---

## 📌 常用场景速查

### 场景 1：提交信息写错了
```bash
git commit --amend -m "正确的提交信息"
```

### 场景 2：忘记添加某个文件
```bash
git add forgotten-file.js
git commit --amend --no-edit
```

### 场景 3：想撤销最近的提交
```bash
# 保留修改
git reset --soft HEAD~1

# 丢弃修改
git reset --hard HEAD~1
```

### 场景 4：已经 push 了，想撤销
```bash
git revert HEAD
git push
```

### 场景 5：想看某次提交改了什么
```bash
git show 0479c54
```

### 场景 6：想回到某个历史版本看看
```bash
git checkout 3c30a0f
# 看完后回到最新版本
git checkout main
```

---

## ⚠️ 危险命令警告

以下命令会**永久删除数据**或**改写历史**，使用前请三思：

```bash
# 会删除所有未提交的修改
git reset --hard HEAD

# 会改写远程历史
git push --force

# 会删除未跟踪的文件
git clean -f
```

---

## 💡 最佳实践

1. **频繁 commit（本地）**
   - 每完成一个小功能就 commit
   - commit 信息要清晰描述做了什么

2. **谨慎 push（远程）**
   - 确认代码没问题再 push
   - push 前先 pull 确保没有冲突

3. **使用有意义的提交信息**
   ```bash
   # ✅ 好的提交信息
   git commit -m "添加音量渐变功能"
   git commit -m "修复移动端横向滚动问题"
   
   # ❌ 不好的提交信息
   git commit -m "update"
   git commit -m "fix bug"
   ```

4. **提交前检查**
   ```bash
   git status        # 看看改了什么
   git diff          # 看看具体改动
   git add -A        # 添加所有修改
   git commit -m "..." # 提交
   ```

---

## 🆘 遇到问题怎么办

### 提交冲突
```bash
# 1. 拉取远程更新
git pull

# 2. 解决冲突（编辑文件）

# 3. 添加解决后的文件
git add -A

# 4. 完成合并
git commit -m "解决冲突"
```

### 不小心删除了文件
```bash
# 恢复删除的文件
git checkout HEAD -- deleted-file.js
```

### 想放弃所有本地修改
```bash
# ⚠️ 会丢失所有未提交的修改
git reset --hard HEAD
```

---

**最后更新**: 2026-02-11  
**适用项目**: SA (Signal Attenuation)
