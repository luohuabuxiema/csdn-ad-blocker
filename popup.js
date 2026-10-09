document.addEventListener('DOMContentLoaded', () => {
  const hidePriceCb = document.getElementById('hidePrice');
  const hideSubCountCb = document.getElementById('hideSubCount');

  // Load saved settings
  chrome.storage.sync.get({
    hidePrice: true,
    hideSubCount: true
  }, (items) => {
    hidePriceCb.checked = items.hidePrice;
    hideSubCountCb.checked = items.hideSubCount;
  });

  const reloadCSDNTabs = () => {
    chrome.tabs.query({url: "*://*.csdn.net/*"}, function(tabs) {
      tabs.forEach(tab => chrome.tabs.reload(tab.id));
    });
  };

  // Save settings when changed
  hidePriceCb.addEventListener('change', () => {
    chrome.storage.sync.set({ hidePrice: hidePriceCb.checked }, reloadCSDNTabs);
  });

  hideSubCountCb.addEventListener('change', () => {
    chrome.storage.sync.set({ hideSubCount: hideSubCountCb.checked }, reloadCSDNTabs);
  });
});
