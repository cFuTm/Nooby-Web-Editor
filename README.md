# Canvas Web Editor

面向 Windows x64 的离线固定画布网页编辑器。React + TypeScript + Vite + Electron，画布使用真实 DOM，JSON 为独立数据层的权威状态。已有 `.obsidian` 目录保持原样。

## 使用

运行 `release/Canvas-Web-Editor-1.1.0-Portable-x64.exe`，或安装 `release/Canvas-Web-Editor-1.1.0-Setup-x64.exe`。无需另装 Node.js。当前构建没有代码签名，使用默认 Electron 图标。

1. 新建工程，默认 1440 × 900。点击画布空白处，在右侧修改页面名称、尺寸、背景颜色或背景图片。
2. 点击左侧组件或拖入画布。图片按钮打开本地文件选择器，保留原始字节。
3. 鼠标拖动元素；选框右下角调整尺寸，上方圆点旋转。双击文本或在右侧文本框编辑内容。右侧所有尺寸使用实际设计像素。
4. Shift + 点击多选，Ctrl + A 全选；Ctrl + C/V 复制粘贴；Delete 删除；Ctrl + Z 撤销，Ctrl + Y / Ctrl + Shift + Z 重做。
5. Alt + 拖动画布空白处或鼠标中键拖动平移，顶部比例切换缩放，适应按钮使画布居中适配。
6. 图层列表可拖动排序，使用显示、锁定按钮管理元素。右侧可修改名称、置顶/置底和上下移动。锁定后需在图层列表解锁才能编辑。
7. 页面标题旁的 + 新增页面；选择元素后可设置链接到其他页面。
8. 保存时选择一个专用空目录，生成 project.json 与 assets；之后直接保存到该目录。另存为选择另一目录。打开时选择 project.json。资源缺失会在底部提示。
9. 内部预览隐藏操作界面，Esc 退出。浏览器预览生成真实静态网站到临时目录并调用默认浏览器。导出网站请选择另一个专用空目录，直接双击 index.html 或放到静态服务器即可运行。

保存和导出会覆盖目标目录同名文件，请为不同工程、网站使用独立目录。关闭/新建前请主动保存。

## 开发与重建

标准开发环境：Windows x64，Node.js 22 或 24 和 npm。

```powershell
npm ci
npm run dev
npm test
npm run build
npm run dist
```

本次机器只有 Node，没有全局 npm，所以项目内下载了临时 npm 工具。此机器可使用：

```powershell
node .npm-tool/bin/npm-cli.js run dev
node .npm-tool/bin/npm-cli.js test
node .npm-tool/bin/npm-cli.js run build
$env:PATH="$pwd\scripts;$env:PATH"
node node_modules/electron-builder/cli.js --win nsis portable --x64 --config.electronDist=node_modules/electron/dist
```

`.npm-tool` 与 `electron-runtime.zip` 是此环境的下载工具和运行时备份，不属于应用源码。正常环境使用 npm ci 获取依赖。首次安装依赖和打包需要联网，应用的编辑、保存、导出不需要联网。应用名称、版本、appId、目标平台及安装方式在 package.json 的 build 配置中。可增加 win.icon 配置自定义 ico。

## 目录与实现

- `src/model.ts`：Project/Page/Element 类型、创建函数、数据校验、独立 Store、100 步历史和订阅接口。
- `src/main.tsx`：三栏界面、Pointer Events 变换、组件/图层/页面管理、属性表单及快捷键。
- `src/style.css`：编辑器 UI 样式。
- `src/exporter.ts`：共享元素样式转换和独立 HTML/CSS 导出；不读取编辑器 DOM。
- `electron/main.cjs`：窗口、安全设置、系统对话框、工程资源读写及导出。
- `electron/preload.cjs`：仅暴露 image/open/save/export 四个受控 API。
- `scripts/dev.cjs`：Vite 与 Electron 开发启动。
- `tests/model.test.ts`：数据层与导出单元测试。
- `scripts/e2e.cjs`：真实 Electron 端到端验收；使用系统对话框替身自动选择测试目录，不需要人工点击对话框。
- `scripts/preview-test.cjs`：脱离编辑器加载导出 HTML 的测试宿主。
- `dist/`：构建后的前端；`release/`：发布产物。
- `.test-output/`：测试工程、导出站点与截图。

## 工程格式

```json
{
  "version": 1,
  "name": "我的画布",
  "pages": [{
    "id": "唯一ID", "name": "首页", "width": 1440, "height": 900,
    "background": "#f8f5ee", "backgroundImage": "",
    "elements": []
  }]
}
```

Element 包含 id/type/name、x/y/width/height、rotation/opacity/zIndex、visible/locked、text/src、填充/边框/字体/图片显示属性、link（目标页面 ID），以及预留 groupId。完整字段见 model.ts。所有资源路径相对工程目录，例如 assets/images/UUID.png。保存复制原始图片，重新打开按相对路径装载为内存 data URL 用于编辑，工程数据本身不嵌入图片。另存为保留相同资源相对路径。当前会保留已导入的未使用资源。

## 导出机制

第一个页面为 index.html，其他页面为 pages/页面ID.html；每页生成 css/页面ID.css，共享 css/global.css 与 js/navigation.js。资源整体复制到 assets/images，预留 fonts/textures 目录。HTML 文本和属性转义，坐标数值校验，CSS 值清除声明分隔字符。图片使用 img/alt，文本和形状使用 div，页面使用 main。绝对定位、旋转、透明度、z-index 与编辑器共用样式计算。链接是普通相对路径 a 标签，不依赖 JavaScript 路由、CDN、React 或 Electron。

## 验证命令

```powershell
npm test
npm run build
node scripts/e2e.cjs
# 对打包后程序执行相同流程
$env:E2E_EXE="$pwd\release\win-unpacked\Canvas Web Editor.exe"
node scripts/e2e.cjs
```

E2E 会覆盖 .test-output 下专用测试数据。单元测试覆盖创建/校验、历史分支、JSON 多页面往返、转义与资源路径/链接、隐藏与变换。桌面流程覆盖鼠标变换、文本/原图、锁定/图层、多页面保存、关闭重启恢复、复制粘贴、撤销重做，以及独立加载导出 HTML。具体执行结果见 TEST-RESULTS.md。

## 第一版边界

- 容器是独立 DOM 元素，groupId 已预留；未实现嵌套容器、真正编组及复杂组合变换。多选显示统一边界，拖动同步位移；多选缩放对每个对象应用尺寸增量，不提供成组比例缩放。
- 图片通过 cover/contain/fill 与 object-position 调整显示裁剪区域；没有交互式裁剪遮罩，也不会破坏原始图片。
- 提供 Windows 已安装字体选择列表，尚无外部字体文件导入界面；换机器时字体外观取决于目标机器已安装的字体。
- 不提供吸附、框选、富文本、复杂动画或在线协作。
- 磁盘操作异常和资源缺失显示在底部状态栏。未实现自动保存和关闭前未保存提示。
- 安装器和便携版构建并检查文件，自动桌面验收使用 win-unpacked 的真实发布 EXE；尚未执行安装/卸载系统级流程和其他 Windows 机器上的测试。

## 1.1 编辑功能更新

- 画布和导出网页均按页面宽高裁切所有组件，包括旋转后超出范围的部分；缩小页面不删除组件数据，扩大后仍可恢复显示。
- 点击“线条”或“椭圆”进入绘制模式，在画布按下并拖动，松开完成；支持反向绘制。椭圆采用拖动矩形的宽高，线条采用起止点确定长度和角度。Esc 取消工具选择。默认黑色。
- 填充透明度与边框透明度分别设置，范围 0–1，另有影响整个组件的透明度。圆角和边框宽度最低为 0。
- 图片显示模式：铺满裁剪（cover）、完整显示（contain）、拉伸填满（fill）；仅铺满裁剪显示裁剪位置。
- 双击画布文本打开应用内编辑窗口；双击页面名称或未锁定图层名称打开重命名窗口。支持中文及多行文本。
- 默认页面背景为纯白。Windows 系统字体自动读取到字体下拉列表。文本对齐和装饰使用图标按钮，悬停显示中文提示；溢出选项使用中文。
- File/Edit/View 等原生菜单已移除。
- 所有组件都可填写“超链接 URL”，支持 https、http、mailto、tel；内部预览中打开系统默认应用，导出后使用普通链接。也可继续选择项目内页面。
- 新版导出网站包含 project.json 和原图。使用“打开”选择导出目录下的 index.html、pages 中的页面 HTML 或 project.json，可重新导入编辑。请保留完整目录。重新导入以 project.json 为准，不反向解析手动修改后的 HTML/CSS，也不支持缺少工程数据的旧版或第三方网站。

新增桌面验收：`node scripts/improvements-e2e.cjs`，测试绘制、双击编辑/重命名、字体、独立透明度、中文选项、裁切、超链接和导出重新导入。
