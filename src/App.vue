<template>
  <div class="">
    <el-menu :default-openeds="[]">
      <el-sub-menu :index="item.domain" v-for="(item, index) in tabList" :key="index">
        <template #title>
          <img class="favicon" :src="item?.tabs[0]?.favIconUrl || defaultIcon" alt="" srcset="">
          {{ item.domain }}
        </template>
        <template v-for="(tab, jdx) in item.tabs" :key="`${tab.id}-${jdx}`">
          <el-menu-item
            :title="tab?.title"
            @click="handleClickTab(tab)"
            :class="{active: tab.id === activeTabId}"
            :index="`${tab.id}-${jdx}`">
            <!-- <img class="favicon" :src="tab.favIconUrl" alt="" srcset=""> -->
            <div class="left-title">
              {{ tab.title }}
            </div>
            <div class="right-actions">
              <button @click.stop="() => handleCloseTab(tab)">
                <el-icon size="14"><CloseBold /></el-icon>
              </button>
            </div>
          </el-menu-item>
        </template>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ElButton, ElMenu, ElMenuItem, ElSubMenu, ElIcon} from 'element-plus';
import { ITabGroup } from './types/common';
import { CloseBold } from '@element-plus/icons-vue';
// Define component state
function handleClickTab(tab: chrome.tabs.Tab) {
  if (!tab.id) return;
  chrome.tabs.update(tab.id, { url: tab.url, active: true });
}
const tabList = ref<ITabGroup[]>([]);
const activeTabId = ref(0);
const defaultIcon = chrome.runtime.getURL('/resource/ic-chrome-16.png');
// Define methods
async function getAllTabs() {
  const resp = await chrome.tabs.query({
    currentWindow: true
  });
  // 按域名分组
  const listMap: {[domain: string]: chrome.tabs.Tab[]} = {};
  resp?.forEach((tab) => {
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      if (listMap[domain]) {
        listMap[domain].push(tab);
      } else {
        listMap[domain] = [tab];
      }
    }
  });
  tabList.value = Object.keys(listMap).map(domain => {
    return {
      domain,
      tabs: listMap[domain]
    }
  })
}
const changeActiveTab = (activeInfo: chrome.tabs.TabActiveInfo) => {
  if (!activeInfo.tabId) return;
  activeTabId.value = activeInfo.tabId;
}
const handleCloseTab = async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  await chrome.tabs.remove(tab.id);
  getAllTabs();
}
onMounted(() => {
  getAllTabs();
  chrome.tabs.onActivated.addListener(changeActiveTab)
});
onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(changeActiveTab)
})
</script>

<style lang="less" scoped>
.favicon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  object-fit: cover;
}
/deep/ .el-menu {
  border-right: 0;
  background-color: transparent;
  &.el-menu--inline {
    background-color: #101010;
  }
}

/deep/ .el-sub-menu__title {
  height: 32px !important;
  color: #fff;
  &:hover {
    background-color: #333;
  }
}
/deep/ .el-sub-menu {
  .el-menu-item {
    height: 32px !important;
    text-wrap: nowrap;
    color: #fff;
    cursor: pointer;
    padding-left: 3px;
    display: flex;
    align-items: center;
    padding-right: 0;
    .left-title {
      flex-grow: 1;
      height: 32px;
      line-height: 32px;
      word-wrap: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .right-actions {
      flex-shrink: 0;
      height: 32px;
      display: flex;
      align-items: center;
      button {
        border: 0;
        background-color: transparent;
        width: 32px;
        height: 32px;
        color: #fff;
        cursor: pointer;
        text-align: center;
        border: 1px solid transparent;
        border-radius: 3px;
        i {
          position: relative;
          left: -3px;
          top: -2px;
        }
        &:hover {
          border: 1px solid #fff;
        }
      }
    }
    &:hover {
      background-color: #666;
    }
    &.active {
      border: 2px solid #fff;
    }
  }
}
</style>