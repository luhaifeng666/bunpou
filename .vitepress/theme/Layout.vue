<!--
 * @Author: luhaifeng666 youzui@hotmail.com
 * @Date: 2023-11-28 14:44:29
 * @LastEditors: luhaifeng666 youzui@hotmail.com
 * @LastEditTime: 2023-11-28 14:44:56
 * @FilePath: /bunpou/.vitepress/theme/Layout.vue
 * @Description: 
 * 
-->
<template>
	<Layout>
		<template #doc-after>
			<Comment style="margin-top: 24px" />
		</template>
	</Layout>
</template>

<script lang="ts" setup>
import DefaultTheme from "vitepress/theme";
import Comment from "./components/Comment.vue";

const { Layout } = DefaultTheme;
</script>
