<template>
  <div class="tabs-tree">
    <el-menu ref="menuRef" :default-openeds="[activeDomain]" unique-opened>
      <el-sub-menu v-for="(item, index) in tabList" :key="index" :index="item.domain">
        <template #title>
          <img class="favicon" :src="item?.tabs[0]?.favIconUrl || defaultIcon" alt="" srcset="" />
          {{ item.domain }}
        </template>
        <template v-for="(tab, jdx) in item.tabs" :key="`${jdx}`">
          <el-menu-item
            :title="tab?.title"
            :class="{ active: tab.id === activeTabId }"
            :index="`${tab.id}-${jdx}`"
            @click="handleClickTab(tab)"
          >
            <!-- <img class="favicon" :src="tab.favIconUrl" alt="" srcset=""> -->
            <div class="left-title">
              {{ tab.title }}
            </div>
            <div class="right-actions">
              <button @click.stop="() => handleCloseTab(tab)">
                <el-icon size="14"><close-bold /></el-icon>
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
import { ElMenu, ElMenuItem, ElSubMenu, ElIcon, MenuInstance } from 'element-plus';
import { ITabGroup } from './types/common';
import { CloseBold } from '@element-plus/icons-vue';
const menuRef = ref<MenuInstance>();
function handleClickTab(tab: chrome.tabs.Tab) {
  if (!tab.id) return;
  chrome.tabs.update(tab.id, { url: tab.url, active: true });
}
const tabList = ref<ITabGroup[]>([]);
const activeTabId = ref(0);
const activeDomain = ref('');
const defaultIcon = chrome.runtime.getURL('/resource/ic-chrome-16.png');
/**
 * 展开指定domain目录
 * @param domain
 */
const openDomainFold = async (domain: string) => {
  if (domain) {
    activeDomain.value = domain;
    menuRef.value?.open(domain);
    return;
  }
};
/**
 * 选中tab
 * @param activeInfo
 */
const changeActiveTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
  if (!activeInfo.tabId) return;
  activeTabId.value = activeInfo.tabId;
};

// Define methods
async function getAllTabs() {
  const resp = await chrome.tabs.query({
    currentWindow: true
  });
  // 按域名分组
  const listMap: { [domain: string]: chrome.tabs.Tab[] } = {};
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
  tabList.value = Object.keys(listMap).map((domain) => {
    return {
      domain,
      tabs: listMap[domain]
    };
  });
  return;
}
/**
 * 获取当前激活的tab
 */
const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const [currTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return currTab;
};
/**
 * 关闭tab回调
 * @param tab
 */
const handleCloseTab = async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  await chrome.tabs.remove(tab.id);
  getAllTabs();
};

onMounted(async () => {
  await getAllTabs();
  const acTab = await getActiveTab();
  acTab?.id && changeActiveTab({ tabId: acTab?.id, windowId: acTab?.windowId });
  acTab.url && openDomainFold(new URL(acTab.url).hostname);
  // tab激活切换
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    changeActiveTab({ tabId: activeInfo.tabId, windowId: activeInfo.windowId });
    const tabs = await chrome.tabs.query({
      currentWindow: true
    });
    const activeTab: chrome.tabs.Tab | undefined = tabs.find(
      (item) => item.id === activeInfo?.tabId
    );
    activeTab?.url && openDomainFold(new URL(activeTab.url).hostname);
  });
  // tab新创建
  chrome.tabs.onCreated.addListener(async (tab) => {
    await getAllTabs();
    tab?.id && changeActiveTab({ tabId: tab?.id, windowId: tab?.windowId });
    setTimeout(() => tab.url && openDomainFold(new URL(tab.url).hostname), 500);
  });
  // tab被关闭
  chrome.tabs.onRemoved.addListener(async () => {
    getAllTabs();
    const newAcTab = await getActiveTab();
    newAcTab?.id && changeActiveTab({ tabId: newAcTab?.id, windowId: newAcTab?.windowId });
    newAcTab.url && openDomainFold(new URL(newAcTab.url).hostname);
  });
  // 内容更新不用重新处理选中展开逻辑
  chrome.tabs.onUpdated.addListener(async (upTabId) => {
    await getAllTabs();
    const newAcTab = await getActiveTab();
    // 如果刷新的是当前激活的tab，则更新选中domain文件夹
    if (newAcTab.id === upTabId) {
      const tabs = await chrome.tabs.query({
        currentWindow: true
      });
      const activeTab: chrome.tabs.Tab | undefined = tabs.find((item) => item.id === upTabId);
      activeTab?.url && openDomainFold(new URL(activeTab.url).hostname);
    }
  });
});
onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(changeActiveTab);
});
</script>

<style lang="less" scoped>
.tabs-tree {
  overflow-x: hidden;
  height: 100%;
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    width: 3px;
  }
}
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
    padding-left: 2px;
    display: flex;
    align-items: center;
    padding-right: 0;
    border: 1px solid transparent;
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
      border: 1px solid #fff;
      border-radius: 3px;
    }
  }
}
</style>
