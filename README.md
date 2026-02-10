# 📁 Signal Attenuation 项目文件说明

## 🎯 项目概述

这是一个"信号衰减"主题的交互式网页项目。原本所有代码都在一个 HTML 文件中，现在已经拆分为多个文件，便于维护和理解。

---

## 🔀 部署策略（重要）

本项目采用**双文件策略**，维护两个版本：

- **`index.html`**：完整开发版（包含所有内容和功能）
- **`index-public.html`**：公开发布版（删减部分私密内容）

### 工作流程

1. **日常开发**：在 `index.html` 中编辑和测试
2. **准备发布**：
   - 复制 `index.html` 的内容到 `index-public.html`
   - 在 `index-public.html` 中删除不想公开的模块/内容
3. **提交代码**：提交到 `main` 分支
4. **自动部署**：GitHub Actions 会自动将 `index-public.html` 部署到公开网站

### 注意事项

- ✅ 所有修改都在 `main` 分支的 `index.html` 中进行
- ✅ `index-public.html` 是手动维护的简化版
- ✅ 提交后会自动部署，无需手动操作 Git
- ⚠️ 不要直接在 `public` 分支工作

---

## 📂 文件结构

```
SA/
├── index.html              # 主HTML文件（新）
├── SA_cool.html           # 原始文件（备份）
├── css/                   # CSS样式文件夹
│   ├── variables.css      # CSS变量和主题配置
│   ├── base.css          # 基础样式
│   ├── animations.css    # 动画效果
│   └── components.css    # 组件样式
└── js/                    # JavaScript脚本文件夹
    ├── config.js         # MathJax配置
    ├── background.js     # 背景动画
    └── chat.js           # 聊天交互
```

---

## 📄 文件详细说明

### 1. **index.html** - 主HTML文件
**作用：** 网页的主体结构和内容

**包含内容：**
- 页面的 HTML 结构（标题、内容区、侧边栏等）
- 引用外部资源（字体、Tailwind CSS、MathJax）
- 引用拆分后的 CSS 和 JS 文件

**如何使用：**
- 双击这个文件在浏览器中打开
- 或者右键 → 打开方式 → 选择浏览器

**注释说明：**
- ✅ 每个 HTML 标签都有详细注释
- ✅ 每个 CSS 类名都有说明
- ✅ 所有注释都是中文

---

### 2. **SA_cool.html** - 原始文件（备份）
**作用：** 保留原始的单文件版本作为备份

**何时使用：**
- 如果新版本出现问题，可以回退到这个文件
- 对比新旧版本的差异

**建议：**
- 不要删除这个文件
- 不要修改这个文件

---

### 3. **css/variables.css** - CSS变量配置
**作用：** 定义整个网站的颜色主题和设计系统

**包含内容：**
```css
--primary: #D1FF4D;        /* 主色调：亮黄绿色 */
--bg: #050705;             /* 背景色：深绿黑色 */
--accent: #50fa7b;         /* 强调色：明亮绿色 */
/* ... 更多颜色变量 */
```

**如何修改主题颜色：**
1. 打开 `css/variables.css`
2. 找到 `:root { }` 部分
3. 修改颜色值（例如把 `#D1FF4D` 改为 `#FF6B6B`）
4. 保存文件，刷新浏览器即可看到效果

**注释说明：**
- ✅ 每个颜色变量都有用途说明
- ✅ 说明了在哪里使用这个颜色

---

### 4. **css/base.css** - 基础样式
**作用：** 页面的基础设置和全局样式

**包含内容：**
- CSS 重置（移除浏览器默认样式）
- body 背景和字体设置
- 屏幕覆盖层效果（扫描线）
- 背景采样点样式
- 滚动条样式

**重要样式：**
- `.overlay` - CRT 显示器效果
- `.dot` - 背景小圆点
- `.mono` - 等宽字体工具类
- `.serif` - 衬线字体工具类

**注释说明：**
- ✅ 每个样式属性都有说明
- ✅ 解释了为什么需要这个样式

---

### 5. **css/animations.css** - 动画效果
**作用：** 所有动画效果的定义

**包含动画：**
1. **故障文字效果** (`glitch-anim`)
   - 用于主标题"信号衰减"
   - 创建 RGB 色差和抖动效果

2. **频率跳变动画** (`frequency-jump`)
   - 用于副标题 "SIGNAL ATTENUATION"
   - 鼠标悬停时触发

3. **信号跳动动画** (`signal-bounce`)
   - 用于信号强度条
   - 上下弹跳效果

4. **消息淡入动画** (`fade-in-up`)
   - 用于聊天消息
   - 从下方淡入并上移

**如何禁用动画：**
- 如果觉得动画太多，可以在 `index.html` 中注释掉这一行：
  ```html
  <!-- <link rel="stylesheet" href="css/animations.css"> -->
  ```

**注释说明：**
- ✅ 每个动画都有详细说明
- ✅ 解释了动画的原理和效果

---

### 6. **css/components.css** - 组件样式
**作用：** 所有页面组件的样式定义

**包含组件：**
1. **聊天对话组件**
   - `.chat-history-container` - 聊天记录容器
   - `.message-row` - 消息行
   - `.message-bubble` - 消息气泡
   - `.message-sentinel` - AI 消息（左对齐）
   - `.message-operator` - 用户消息（右对齐）

2. **终端输入区域**
   - `.terminal-input-area` - 输入区域容器
   - `.input-prompt` - 提示符（MENG@M3PRO:~$）
   - `.command-input` - 输入框
   - `.execute-btn` - 执行按钮

3. **布局组件**
   - `.main-container` - 主容器（Grid 布局）
   - `.content-card` - 内容卡片
   - `.terminal-header` - 终端标题栏

4. **侧边栏组件**
   - `.sidebar` - 侧边栏容器
   - `.status-panel` - 状态面板
   - `.status-row` - 状态行
   - `.tag` - 标签（LIVE、01、02 等）

**响应式设计：**
- 包含多个 `@media` 查询
- 自动适配手机、平板、桌面端
- 断点：640px、768px、1024px

**注释说明：**
- ✅ 每个组件都有详细说明
- ✅ 每个样式属性都有解释
- ✅ 响应式断点都有说明

---

### 7. **js/config.js** - MathJax配置
**作用：** 配置数学公式的渲染规则

**配置内容：**
- 行内公式：`$公式$` 或 `\(公式\)`
- 显示公式：`$$公式$$` 或 `\[公式\]`

**示例：**
```javascript
// 行内公式（嵌入在文字中）
文字中的 $E=mc^2$ 会被渲染

// 显示公式（独立成行）
$$P_{justice} \propto \frac{Cost}{Radius_{power}}$$
```

**注释说明：**
- ✅ 每个配置项都有说明
- ✅ 解释了什么是行内公式和显示公式

---

### 8. **js/background.js** - 背景动画
**作用：** 生成和动画化背景的采样点（小圆点）

**工作原理：**
1. **生成阶段：** 创建 50 个随机分布的小圆点
2. **动画阶段：** 每 0.8 秒随机选择一个圆点让它闪烁

**关键函数：**
- `animateDots(timestamp)` - 动画循环函数
- 使用 `requestAnimationFrame` 实现高性能动画

**如何修改：**
- 修改圆点数量：改变 `for (let i = 0; i < 50; i++)` 中的 50
- 修改闪烁频率：改变 `if (timestamp - lastDotTime > 800)` 中的 800（毫秒）

**注释说明：**
- ✅ 每一行代码都有详细注释
- ✅ 解释了 `Math.random()`、`setTimeout` 等函数的作用

---

### 9. **js/chat.js** - 聊天交互
**作用：** 处理用户输入、显示消息、模拟 AI 回复

**主要功能：**
1. **获取页面元素**
   - 聊天框、输入框、发送按钮

2. **添加消息函数** (`appendMessage`)
   - 在聊天框中添加新消息
   - 区分用户消息和 AI 消息

3. **处理发送** (`handleSend`)
   - 获取用户输入
   - 显示用户消息
   - 1 秒后显示 AI 随机回复

4. **事件监听**
   - 点击按钮发送
   - 按回车键发送

**如何修改 AI 回复：**
1. 打开 `js/chat.js`
2. 找到 `const responses = [...]` 数组
3. 添加或修改回复内容
4. 保存文件，刷新浏览器

**注释说明：**
- ✅ 每个函数都有详细说明
- ✅ 每一行代码都有注释
- ✅ 解释了事件监听的原理

---

## 🚀 如何使用

### 方法1：直接打开（推荐）
1. 找到 `index.html` 文件
2. 双击打开（会在默认浏览器中打开）
3. 开始使用！

### 方法2：指定浏览器打开
1. 右键点击 `index.html`
2. 选择"打开方式"
3. 选择你喜欢的浏览器（Chrome、Safari、Firefox 等）

### 方法3：本地服务器（可选）
如果你想要更专业的开发环境：
```bash
# 在 SA 文件夹中打开终端，运行：
python3 -m http.server 8000

# 然后在浏览器中访问：
http://localhost:8000
```

---

## 🎨 如何修改

### 修改颜色主题
1. 打开 `css/variables.css`
2. 修改 `:root` 中的颜色值
3. 保存并刷新浏览器

### 修改文字内容
1. 打开 `index.html`
2. 找到要修改的文字（有详细注释帮助定位）
3. 修改内容
4. 保存并刷新浏览器

### 修改 AI 回复
1. 打开 `js/chat.js`
2. 找到 `const responses = [...]`
3. 修改或添加回复
4. 保存并刷新浏览器

### 禁用动画
1. 打开 `index.html`
2. 找到 `<link rel="stylesheet" href="css/animations.css">`
3. 在前面加 `<!--`，后面加 `-->`，变成：
   ```html
   <!-- <link rel="stylesheet" href="css/animations.css"> -->
   ```
4. 保存并刷新浏览器

---

## 📱 响应式设计

网页会自动适配不同设备：

- **手机竖屏** (≤ 640px)
  - 单列布局
  - 较小的字体和间距
  - 更大的触摸区域

- **手机横屏 / 小平板** (641px - 768px)
  - 单列布局
  - 中等字体和间距

- **平板** (769px - 1024px)
  - 单列布局
  - 接近桌面的字体大小

- **桌面端** (> 1024px)
  - 双列布局（主内容 + 侧边栏）
  - 完整的字体和间距

---

## 🔧 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6)** - 交互逻辑
- **Tailwind CSS** - CSS 框架
- **MathJax** - 数学公式渲染
- **Google Fonts** - 字体

---

## 📚 学习资源

如果你想深入学习，推荐以下资源：

1. **HTML 基础**
   - [MDN HTML 教程](https://developer.mozilla.org/zh-CN/docs/Learn/HTML)
   - [菜鸟教程 HTML](https://www.runoob.com/html/html-tutorial.html)

2. **CSS 基础**
   - [MDN CSS 教程](https://developer.mozilla.org/zh-CN/docs/Learn/CSS)
   - [CSS Tricks](https://css-tricks.com/)

3. **JavaScript 基础**
   - [MDN JavaScript 教程](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript)
   - [JavaScript.info](https://zh.javascript.info/)

4. **Tailwind CSS**
   - [Tailwind 官方文档](https://tailwindcss.com/docs)

---

## ❓ 常见问题

### Q1: 为什么要拆分文件？
**A:** 
- ✅ 更容易找到和修改特定的代码
- ✅ 多人协作时减少冲突
- ✅ 可以复用 CSS 和 JS 到其他页面
- ✅ 便于学习和理解代码结构

### Q2: 如果我修改了代码但没有效果？
**A:**
1. 确保保存了文件（Ctrl+S 或 Cmd+S）
2. 刷新浏览器（F5 或 Cmd+R）
3. 如果还是没效果，尝试强制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

### Q3: 可以删除 SA_cool.html 吗？
**A:** 建议保留作为备份。如果新版本出现问题，可以回退到原始版本。

### Q4: 如何查看某个元素的样式？
**A:**
1. 在浏览器中按 F12 打开开发者工具
2. 点击左上角的"选择元素"图标
3. 点击页面上的任意元素
4. 右侧会显示该元素的所有样式

### Q5: 注释会影响网页性能吗？
**A:** 不会。注释只是帮助理解代码，浏览器会忽略它们。如果真的很在意文件大小，可以使用工具压缩代码（但不建议初学者这样做）。

---

## 💡 提示

1. **备份重要文件** - 修改前先复制一份
2. **小步修改** - 每次只改一点，立即测试
3. **使用开发者工具** - F12 是你的好朋友
4. **阅读注释** - 所有文件都有详细的中文注释
5. **不要害怕出错** - 出错了可以撤销（Ctrl+Z）或恢复备份

---

## 📞 需要帮助？

如果遇到问题：
1. 先查看文件中的注释
2. 查看本说明文档
3. 使用浏览器开发者工具（F12）查看错误信息
4. 搜索错误信息（Google、Stack Overflow）

---

**祝你使用愉快！🎉**

*最后更新：2026-02-10*
# Force redeploy
