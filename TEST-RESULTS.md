# 测试与交付记录

执行日期：2026-11-02（Asia/Shanghai）。Windows x64，Node 24.22.1，Electron 36.3.1。

## 最终通过

- TypeScript strict 静态检查：`node node_modules/typescript/bin/tsc --noEmit`，0 错误。
- Vite 生产构建：通过，使用本地资源，无外部 CDN。
- 数据/导出单元测试：5/5 通过。
- Electron 源码应用完整验收：通过。
- 最终 `release/win-unpacked/Canvas Web Editor.exe` 真实发布程序验收：通过，退出码 0。
- 流程：默认空白画布 → 添加中文文本 → 数值编辑 → 鼠标拖动/缩放/旋转 → 本地图像导入 → 锁定/解锁 → 图层置底 → 新增页面及文字 → 保存 → 关闭应用 → 启动新进程 → 打开恢复 → 撤销/重做 → 复制/粘贴/删除 → 多选统一边界 → 隐藏/恢复图片 → 内部预览/退出 → 导出真实网页 → 独立 Electron 浏览窗口加载导出 HTML。
- 保存后检查了两个页面、图层数据及图片原始字节一致性。
- 独立网页检查了中文内容、图片加载完成且 naturalWidth > 0，并生成截图。
- renderer 未出现 pageerror；生产版本没有此前开发构建的 CSP 警告。
- electron-builder 成功生成 Windows x64 NSIS 安装版和便携版，检查文件均存在且非空。

## 发布文件

- `release/Canvas-Web-Editor-1.0.0-Setup-x64.exe`：86,857,317 字节。
- `release/Canvas-Web-Editor-1.0.0-Portable-x64.exe`：86,629,541 字节。
- `release/win-unpacked/Canvas Web Editor.exe`：已直接执行完整验收。
- SHA-256 校验值：`release/SHA256SUMS.txt`。

## 证据

- `.test-output/project/project.json`：保存并重新打开的多页面工程。
- `.test-output/project/assets/images/`：原图资源。
- `.test-output/website/index.html`：独立导出站点。
- `.test-output/editor.png`：编辑器验收截图。
- `.test-output/website.png`：独立网页验收截图。

## 修复后通过的初次失败

- 环境无 npm：使用项目内 npm 和启动脚本补齐。
- Electron 安装脚本下载停滞：直接下载官方相同版本 Windows 发行包。
- 打包文件名中的 target 宏无效：分别配置 NSIS 和 portable 的 artifactName。
- 组件图标参与可访问名称：修正自动化按钮定位。
- 生产 CSP 阻止测试的动态求值等待函数：改用 Locator 等待，保留严格 CSP。

## 尚未执行及限制

- 未实际走 NSIS 安装、卸载界面；未在另一台机器执行安装包或便携启动器。发布 EXE 验收使用 win-unpacked 版本。
- 没有代码签名证书，使用默认 Electron 图标。
- 没有自动化点击默认浏览器的外部预览按钮；导出 HTML 使用独立无 Node 集成窗口加载验证。
- 没有遍历所有字体、所有图片格式及超大工程性能压力测试。
- 容器嵌套/编组变换、字体导入、交互式裁剪遮罩、自动保存尚未实现；详见 README.md。

## 1.1 功能修改复验（2026-11-02）

- strict TypeScript 检查和 Vite 生产构建通过。
- 单元测试增加至 8 项，全部通过：补充裁切、工程往返、独立透明度和全组件外部 URL 导出测试。
- scripts/improvements-e2e.cjs：真实 Electron 新功能验收通过。读取 213 个已安装字体；双击文本、双击页面/图层重命名、负数钳制、图标对齐/装饰、反向绘制椭圆与线条、图片中文显示模式及裁剪位置条件显示、预览 URL 跳转、导出 HTML/工程及图片重新导入、白色背景、裁切样式、移除原生菜单均通过。
- scripts/e2e.cjs：原有编辑、鼠标拖动/缩放/旋转、图层、保存后重启恢复、撤销重做、多页面、预览与独立网页加载流程全部通过。
- 新增截图：.test-output/improvements.png。
- 系统字体读取测试针对本机 Windows；未实现外部字体文件导入。网站重新导入依赖随导出附带的 project.json，不解析手动修改的 HTML/CSS。
- 最终 1.1.0 NSIS 安装版及便携版已重新构建；两个桌面测试脚本均直接使用 release/win-unpacked/Canvas Web Editor.exe 执行，全部通过。安装/卸载界面未复测。

## 1.2 工具、分组、蒙版验收（2026-11-03）

- strict TypeScript 检查、Vite 生产构建通过；11 项单元测试全部通过。
- 三套真实桌面测试（scripts/v12-e2e.cjs、scripts/e2e.cjs、scripts/improvements-e2e.cjs）均在最终 1.2.0 release/win-unpacked/Canvas Web Editor.exe 上通过。
- 新增验收覆盖：矩形/蒙版拖动绘制、文字点击定位、隐式占位、双击编辑、组合 B/I/U/S 装饰、负号输入和角度上下界、字号下限、圆角上限、文本三模式、文字宽高缩放、框选、编组收起展开、组中心缩放及整体拖动、内外蒙版、链接提示词、鼠标锚定 Ctrl 滚轮缩放、输入百分比、工程重新导入。
- 独立窗口加载导出的 index.html，检查了 CSS 蒙版、链接提示与实际渲染截图；截图为 .test-output/v12website.png，编辑器截图为 .test-output/v12.png。工程包含 groups、maskMode、textMode 等新增数据，重新导入后组列表恢复。
- 原有保存后重启恢复、原图、图层拖动、撤销重做、复制粘贴、多页面、中文和独立网页流程通过。
- 生成 release/Canvas-Web-Editor-1.2.0-Setup-x64.exe 和 release/Canvas-Web-Editor-1.2.0-Portable-x64.exe；安装/卸载流程未复测。
- 范围：单层图层组；文本反向拉框镜像未实现（可选项）。悬停提示采用浏览器原生 title，显示延迟由浏览器决定。
