# Release Note Draft

## Mobile temporary hidden entrypoints

在路线 B 首发阶段，`mobile-app` 运行时临时隐藏以下入口：

- 音频播放入口（例句播放触发入口）
- DeepSeek 入口
- 访问统计入口

该策略仅作用于 `mobile-app`，不改变 `web-site` 与 `desktop-app` 的既有可见性策略。

## Recovery strategy

后续按功能分批恢复入口，建议顺序：

1. 恢复音频入口（当移动端音频体验与资源策略稳定）
2. 恢复 DeepSeek 入口（当网络策略与服务配额可控）
3. 恢复访问统计入口（当统计合规与性能影响评估通过）

## Trigger conditions

满足以下条件之一可进入恢复评审：

- 对应功能在移动壳完成稳定性回归并通过发布门禁
- 对应功能的网络/第三方依赖在移动端可控且有降级方案
- 产品策略明确该入口恢复优先级并通过版本发布评审
