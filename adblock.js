/**
 * CSDN 极简去广告 - 内容脚本
 * 适配最新版 CSDN 页面架构，彻底清理广告元素与异常布局
 */

(() => {
  'use strict';

  // 广告选择器清单
  const AD_SELECTORS = [
    // 最新版左右两侧悬浮 VIP 广告及动效
    '.simple-ad-slot',
    '.simple-ad-slot-left',
    '.simple-ad-slot-right',
    '.simple-ad-slot__fixed',
    '.csdn-vip-motion',
    '[class*="csdn-vip-motion"]',
    '.simple-ad-bg',
    '[data-vip-slot]',
    // 分享组件
    '#tool-share',
    // 推荐流商业广告及推广卡片
    '#recommendAdBox',
    '.recommend-ad-box',
    '.recommend-box.insert-baidu-box',
    '.insert-baidu-box',
    '[id^="kp_box_"]',
    '.recommend-right_bottom',
    // 顶部与侧边栏广告
    '.toolbar-advert',
    '#toolBarBox .toolbar-advert',
    '.programmer1Box',
    '.indexSuperise',
    '#asideCustom',
    '#asideNewNps',
    '#aside-ad',
    '#asideWriteGuide',
    '.aside-box.custom-box',
    '.aside-box.cknows-side-card',
    '.js-aside-cknows',
    '.swiper-slide-box-remuneration',
    '#swiper-remuneration-container',
    '.sidetool-writearticle-box',
    '.sidetool-qrcode-box',
    // AI 助手浮窗
    '#chatgpt-article-detail',
    '.ai-article-qa',
    '.ai-article-box',
    // 登录弹窗与遮罩
    '#passportbox',
    '.passport-login-container',
    '.passport-login-mark',
    '.pulllog-box',
    '.box-box-large',
    '.box-box-default',
    '#toolBarBox .guide-login-mask'
  ];

  // 清理广告元素与矫正页面布局
  const cleanAds = () => {
    // 1. 批量移除广告节点
    AD_SELECTORS.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (el && el.parentNode) {
          el.remove();
        }
      });
    });

    // 2. 移除干扰页面宽度的广告标志类名
    if (document.body && document.body.classList.contains('has-simple-ad-background-skin')) {
      document.body.classList.remove('has-simple-ad-background-skin');
    }

    const mainFather = document.getElementById('csdn-main-father-root') || document.querySelector('.main_father');
    if (mainFather && mainFather.classList.contains('has-ad-slots')) {
      mainFather.classList.remove('has-ad-slots');
    }

    // 3. 针对“大家都在看”等伪装成侧边推荐模块的广告进行过滤
    const asideBoxes = document.querySelectorAll('#asideHotArticle, .aside-box');
    asideBoxes.forEach((el) => {
      const title = el.querySelector('.aside-title');
      if (title && title.textContent.includes('大家都在看')) {
        el.remove();
      }
    });
  };

  // 立即执行一次初始清理
  cleanAds();

  // 使用 requestAnimationFrame 防抖的 MutationObserver，避免频繁操作 DOM 导致卡顿
  let isFrameScheduled = false;
  const observer = new MutationObserver(() => {
    if (!isFrameScheduled) {
      isFrameScheduled = true;
      requestAnimationFrame(() => {
        cleanAds();
        isFrameScheduled = false;
      });
    }
  });

  const startObserver = () => {
    cleanAds();
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

  // 解除 CSDN 复制代码时的登录弹窗拦截
  window.addEventListener('DOMContentLoaded', () => {
    // 解锁可能存在的行内阻止事件
    document.querySelectorAll('#content_views pre, #content_views code').forEach((el) => {
      el.style.userSelect = 'text';
    });
  });

  // --------------------------------------------------------------------------
  // 用户自定义偏好：隐藏专栏价格 / 订阅数量（适配最新卡片及旧版专栏样式）
  // --------------------------------------------------------------------------
  const updatePreferenceStyles = (settings) => {
    let styleEl = document.getElementById('csdn-adblocker-pref-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'csdn-adblocker-pref-style';
      (document.head || document.documentElement).appendChild(styleEl);
    }

    let css = '';
    if (settings.hidePrice) {
      css += `
        /* 最新版专栏卡片价格 */
        .simple-biz-card__price-box .simple-biz-card__price,
        .simple-biz-card__price-box .simple-biz-card__old,
        /* 旧版专栏价格 */
        .old-add-new-box,
        .article-type-img.vip-img,
        .vip-article-box,
        .column-group-item .price,
        .column-group-item .oldprice {
          display: none !important;
        }
      `;
    }

    if (settings.hideSubCount) {
      css += `
        /* 最新版专栏文章数量/订阅信息 */
        .simple-biz-card__count,
        /* 旧版订阅信息 */
        .columnlist-head-con span:nth-child(2),
        .column-group-item-one > span:last-child {
          display: none !important;
        }
      `;
    }

    styleEl.textContent = css;
  };

  // 读取保存的设置
  chrome.storage.sync.get({
    hidePrice: true,
    hideSubCount: true
  }, (items) => {
    updatePreferenceStyles(items);
  });

  // 实时响应设置变化
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      chrome.storage.sync.get({
        hidePrice: true,
        hideSubCount: true
      }, (items) => {
        updatePreferenceStyles(items);
      });
    }
  });
})();
