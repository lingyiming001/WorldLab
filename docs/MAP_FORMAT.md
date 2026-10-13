# WorldLab 地图文件 v1

扩展名 `.worldlab.json`，UTF-8 JSON。`format=worldlab-map`、`version=1`。

- id / title / creator / description / updatedAt：地图标识与创建者纯文本信息。导入时创建新的本机 ID，不覆盖已有地图。
- language：zh 或 en；地图进入后设置物体气泡与小地图的语言，不改变应用界面语言。
- labels：id、固定 parent、name 两项中英名称、enabled。关闭部件时沿 parent 回退到最近启用的标签；未启用任何上级时不显示名称。现有物体语义层级由引擎提供。
- objects：对象 ID、position / rotation / scale 三维数组、visible。旋转为弧度；变换局部于父节点。保存支持的内置节点及自定义模型，内置未命名装饰仍由校园生成器构建。
- assets：模型 ID、filename、data（自包含 GLB 的 Base64）、license（创建者提供的许可全文 / 来源）。自定义模型需要匹配标签和对象记录；内置柴犬由应用分发，不重复打包。

所有数组数量有界，位置 / 旋转数值有限且绝对值不超过 100，缩放范围 0.1 至 10。GLB 每个最多 30 MB，最多 20 个，总 Base64 最多 60 MB（约 45 MB 二进制）；地图文件最多 65 MB。无外部模型 URL，无脚本执行。未知版本拒绝导入。

使用：地图库 → 下载 → 把文件发送给接收者 → 接收者在能访问的 WorldLab 中导入。支持系统文件共享的浏览器可以使用“共享”；否则下载文件。网站目前私有，分享文件不会自动改变网站权限。地图也不是独立 HTML 应用，需要此版本 WorldLab 或兼容的运行程序。

`basketball-english.worldlab.json` 是实际通过浏览器下载、回读的示例，单独识别篮球架并使用 Basketball goal 名称。
