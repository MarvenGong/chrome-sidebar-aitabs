<template>
  <div class="tabs-tree">
    <div
      v-for="(item, index) in tabList"
      :key="index"
      class="domain-panel"
      :class="{ active: activeDomain === item.domain || currDomain === item.domain }"
    >
      <h3 class="domain-title" @click="() => handleActiveDomain(item.domain)">
        <img
          class="left-facicon"
          :src="item?.tabs?.[0]?.favIconUrl || defaultIcon"
          alt=""
          srcset=""
        />
        <p class="title">{{ item.domain }}</p>
        <p class="count">&nbsp;({{ item?.tabs?.length }})</p>
        <img class="right-arrow" :src="icArrowDown" alt="" srcset="" />
      </h3>
      <transition name="slide-down">
        <ul v-show="activeDomain === item.domain || currDomain === item.domain" class="tab-list">
          <li
            v-for="(tab, jdx) in item?.tabs"
            :key="jdx"
            :title="tab?.title"
            :class="{ active: tab.id === activeTabId }"
            :data-favicon="tab.favIconUrl"
            @click="handleClickTab(tab)"
          >
            <!-- <img class="favicon" :src="tab.favIconUrl" alt="" srcset=""> -->
            <div class="left-title" :data-tab-id="tab?.id">{{ tab.title }}</div>
            <div class="right-actions">
              <button title="关闭标签页" @click.stop="() => handleCloseTab(tab)">
                <img :src="icCloseWhite" alt="" width="18" srcset="" />
              </button>
            </div>
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ITabGroup } from './types/common';
import { getDomainOfUrl, wait } from './utils';
const icCloseWhite = chrome.runtime.getURL('/resource/ic-close-white.svg');
const icArrowDown = chrome.runtime.getURL('/resource/ic-arrow-down-white.svg');
function handleClickTab(tab: chrome.tabs.Tab) {
  if (!tab.id) return;
  chrome.tabs.update(tab.id, { url: tab.url, active: true });
}
const tabList = ref<ITabGroup[]>([]);
const activeTabId = ref(0);
const activeDomain = ref(''); // 选中展开的域名
const currDomain = ref(''); // 当前tab的域名
const defaultIcon = chrome.runtime.getURL('/resource/ic-chrome-16.png');
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
const handleActiveDomain = (domain: string) => {
  if (activeDomain.value !== domain) {
    activeDomain.value = domain;
  } else {
    activeDomain.value = '';
  }
};
/**
 * 展开指定domain目录
 * @param domain
 */
const openDomainFold = async () => {
  const acTab = await getActiveTab();
  console.log('展开的菜单id', acTab);

  const domain = getDomainOfUrl(acTab?.url || '');
  if (domain) {
    currDomain.value = domain;
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
      const domain = getDomainOfUrl(tab.url);
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
  acTab.url && openDomainFold();
  // tab激活切换
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('标签页激活', activeInfo);
    await getAllTabs();
    wait(300);
    changeActiveTab({ tabId: activeInfo.tabId, windowId: activeInfo.windowId });
    const tabs = await chrome.tabs.query({
      currentWindow: true
    });
    const activeTab: chrome.tabs.Tab | undefined = tabs.find(
      (item) => item.id === activeInfo?.tabId
    );
    console.log('标签页激活，标签页信息', activeTab);
    activeTab?.url && openDomainFold();
  });
  // tab新创建
  chrome.tabs.onCreated.addListener(async (tab) => {
    console.log('标签页创建', tab);
    await getAllTabs();
    tab?.id && changeActiveTab({ tabId: tab?.id, windowId: tab?.windowId });
  });
  // tab被关闭
  chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    console.log('标签页关闭', removeInfo);
    if (removeInfo?.isWindowClosing) return;
    await getAllTabs();
    const newAcTab = await getActiveTab();
    newAcTab?.id && changeActiveTab({ tabId: newAcTab?.id, windowId: newAcTab?.windowId });
    newAcTab.url && openDomainFold();
  });
  // 内容更新不用重新处理选中展开逻辑
  chrome.tabs.onUpdated.addListener(async (upTabId, changeInfo, tab) => {
    console.log('标签页更新', tab, changeInfo);
    await getAllTabs();
    nextTick(() => {
      // 如果刷新的是当前激活的tab，则更新选中domain文件夹
      if (
        tab.active &&
        (changeInfo.status === 'complete' ||
          changeInfo?.url ||
          changeInfo?.favIconUrl ||
          changeInfo?.title)
      ) {
        tab?.url && openDomainFold();
      }
    });
  });
});
onUnmounted(() => {
  chrome.tabs.onActivated.removeListener(changeActiveTab);
});
</script>

<style lang="less" src="./styles/app.less" scoped></style>
