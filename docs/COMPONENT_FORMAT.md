# 组件与场景创作协议

地图格式仍为 `worldlab-map` version 1，旧地图兼容。可选新增：
- `base`: `campus` / `empty`（旧文件默认为校园）。空白场景保留地面和照明。
- `components`: 自定义组件定义；9 个平台基础组件通过固定 ID 引用。
- `instances`: 可摆放的组件实例，根 ID 以 `instance-` 开头。

组件 `{id,name:[中文,英文],category,parts}`。每部件必须包含 `{id,name,shape,size,position,rotation,color,solid,label}`。shape 允许 box / sphere / cylinder；box size=宽高深，sphere size=三轴半径，cylinder size=顶部半径/高度/底部半径。position/rotation 是组件内的坐标与弧度。色值为 #RRGGBB。solid 决定人物 AABB 碰撞；label 决定该部件是否具备语义标注。

实例 `{id,component,name,position,rotation,scale,visible,detail}`。position 三轴 [-22,22]，rotation [-2π,2π]，scale [.1,5]。detail 控制创建时整体或部件粒度，地图库还可分别调整标签。根标签 ID=实例 ID，部件标签 ID=`实例--部件`、parent=实例 ID。地图 objects 中根变换必须与 instances 一致，防止歧义。

上限：40 自定义定义、60 实例、32 部件/定义、512 实例部件总量、750 地图标签、160 地图根对象。定义 ID/部件 ID 为 1–60 个字母、数字、下划线、连字符。定义不能覆盖基础组件。部件 size [.02,20]、position [-20,20]。

Agent 方案：`{format:"worldlab-agent",version:1,title,description,language,base,components,instances}`。可只有 components，instances=[]；应用后组件进入库。不会执行任意 JS、HTML、远程代码或 Agent 指定的资源 URL。GLB 仍通过既有模型库导入。

单组件文件：`{format:"worldlab-component",version:1,component:组件定义}`。从平台基础组件导出时使用新的 custom ID，以便修改导入。自定义库目前随地图保存，不是跨用户云端资产仓库。

编辑器提供单步快照撤销：组件添加、复制、删除、数值变换和场景替换。拖动后可「同步拖动结果」；保存/下载自动读取当前 3D 变换。变换超出文件范围时保存会报错，应调整回范围后保存。部件没有独立变换编辑器。

碰撞为每个 solid 部件的世界 AABB，对旋转物体较保守。地板是地面装饰，不提供新楼层/跳跃物理。Agent 不创建可动画骨骼模型，复杂模型仍需 GLB。布局通行性需人工漫游检查，不承诺自动满足所有无重叠约束。
