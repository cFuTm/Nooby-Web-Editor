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
