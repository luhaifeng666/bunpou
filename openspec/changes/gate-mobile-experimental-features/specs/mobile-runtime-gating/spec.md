# mobile-runtime-gating Spec

## ADDED Requirements

### Requirement: 平台判定 MUST 区分网站、桌面与移动运行时

系统 MUST 提供可被前端入口层复用的平台判定能力，并至少区分以下运行时：

- Web 站点运行时（浏览器访问）
- Desktop App 运行时（Tauri）
- Mobile App 运行时（iOS/Android 壳）

判定语义 MUST 避免将“非桌面端”直接等同于“移动端”。

#### Scenario: 网站访问不应被识别为移动 App

- **WHEN** 用户在浏览器中打开 Bunpou 站点（含移动浏览器）
- **THEN** 运行时被识别为 Web 站点，而非 Mobile App

### Requirement: 移动端入口隐藏 MUST 不影响网站与桌面端

当产品策略要求在移动端临时隐藏以下入口时：音频播放、DeepSeek、访问统计；该策略 MUST 仅作用于 Mobile App 运行时，不得改变网站与桌面端的可见性表现。

#### Scenario: 移动端隐藏入口

- **WHEN** 应用在 Mobile App 运行时渲染相关页面
- **THEN** 音频播放入口、DeepSeek 入口、访问统计入口不对用户展示

#### Scenario: 网站保持原有入口可见性

- **WHEN** 用户在 Web 站点访问同一页面
- **THEN** 入口可见性与变更前一致（除非另有独立 Web 需求变更）

#### Scenario: 桌面端保持原有入口可见性

- **WHEN** 用户在 Desktop App 运行同一页面
- **THEN** 入口可见性与变更前一致（除非另有独立桌面需求变更）

### Requirement: 入口隐藏 SHOULD 属于 UI 层策略

移动端临时隐藏策略 SHOULD 在入口/UI 层生效，并保持组件内部能力路径可独立演进，避免将“入口隐藏”与“功能移除”耦合。

#### Scenario: 仅入口层调整

- **WHEN** 执行移动端临时隐藏策略
- **THEN** 代码变更聚焦在平台可见性判定与入口渲染路径，而不是删除网站/桌面共享功能实现

### Requirement: 回归验证 MUST 覆盖跨端可见性

发布前验证 MUST 包含至少一组跨端回归检查，覆盖 Web、Desktop、Mobile 三类运行时中上述入口的预期可见性结果。

#### Scenario: 跨端可见性回归通过

- **WHEN** 维护者执行发布前验证
- **THEN** 可获得一份明确记录，证明入口隐藏策略仅在 Mobile App 生效，且未误伤网站和桌面端
