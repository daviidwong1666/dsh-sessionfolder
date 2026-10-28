window.__ModuleLoader__.load({
  id: 'dsh-session-folders',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useMemo, useEffect, useRef, useCallback } = React;

    const NS = 'local.sessionFolders';
    const STORAGE_KEY = 'dsh.session-folders.v1';
    const DATA_VERSION = 2;
    // Cleared when this page's first content-search probe fails; local title
    // matching then carries the search on its own.
    let remoteSearchOff = false;
    const MENU_WIDTH = 208;
    const MENU_ITEM_HEIGHT = 28;

    // Folder colors are artwork: the only literal colors in this bundle.
    const COLORS = [
      { id: 'blue', value: '#4c8dff' },
      { id: 'violet', value: '#a855f7' },
      { id: 'teal', value: '#14b8a6' },
      { id: 'green', value: '#22c55e' },
      { id: 'amber', value: '#f59e0b' },
      { id: 'orange', value: '#f97316' },
      { id: 'rose', value: '#ef4444' },
      { id: 'pink', value: '#ec4899' },
      { id: 'slate', value: '#94a3b8' },
    ];

    const CSS = [
      '.sf-root{display:flex;flex-direction:column;min-height:0;height:100%;box-sizing:border-box;color:var(--dsw-alias-label-primary)}',
      '.sf-rail{flex:1;align-items:center;padding:8px 0;gap:4px}',
      '.sf-railButton{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;border-radius:var(--dsw-radius-md,8px);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0}',
      '.sf-railButton:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}',
      '.sf-header{display:flex;align-items:center;gap:2px;height:32px;padding:0 8px;flex:none}',
      '.sf-headerTitle{flex:1;min-width:0;padding-inline-start:4px;font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sf-scroll{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 8px 12px;display:flex;flex-direction:column;gap:2px}',
      '.sf-group{display:flex;flex-direction:column;gap:1px}',
      '.sf-groupHeader{display:flex;align-items:center;gap:4px;height:28px;padding:0 4px;border-radius:var(--dsw-radius-md,8px);cursor:pointer;user-select:none;color:var(--dsw-alias-label-secondary);outline:none}',
      '.sf-groupHeader:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-groupHeader:focus-visible{outline:1px solid var(--dsw-alias-brand-primary)}',
      '.sf-groupHeader.sf-dropTarget{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}',
      '.sf-groupTitle{flex:1;min-width:0;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sf-groupBody{display:flex;flex-direction:column;gap:1px;padding-inline-start:4px}',
      '.sf-chevron{width:14px;height:14px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));transition:transform .15s var(--ds-ease-in-out,ease)}',
      '.sf-chevron.sf-open{transform:rotate(90deg)}',
      '.sf-sessionRow{display:flex;align-items:center;gap:0;height:32px;padding:0 8px;border-radius:var(--dsw-radius-md,8px);cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary);outline:none}',
      '.sf-sessionRow.sf-indent{padding-inline-start:24px}',
      '.sf-sessionRow:focus-visible{outline:1px solid var(--dsw-alias-brand-primary)}',
      '.sf-sessionRow:hover,.sf-sessionRow.sf-menuOpen,.sf-sessionRow.sf-selected{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-sessionRow.sf-archived .sf-title,.sf-sessionRow.sf-archived .sf-time{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary))}',
      '.sf-slot{width:16px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center}',
      '.sf-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary)}',
      '.sf-dot[data-state=ongoing]{background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));animation:sf-pulse 1.6s ease-in-out infinite}',
      '.sf-dot[data-state=warning]{background:var(--dsw-alias-state-warn-primary)}',
      '.sf-dot[data-state=done]{background:var(--dsw-alias-state-success-primary)}',
      '.sf-title{flex:1;min-width:0;font-size:13px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 6px 0 4px}',
      '.sf-time{flex:none;font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-rowActions{display:none;flex:none;align-items:center;gap:8px}',
      '.sf-sessionRow:hover .sf-rowActions,.sf-sessionRow.sf-menuOpen .sf-rowActions,.sf-folderRow:hover .sf-rowActions,.sf-folderRow.sf-menuOpen .sf-rowActions,.sf-groupHeader:hover .sf-rowActions,.sf-groupHeader.sf-menuOpen .sf-rowActions{display:inline-flex}',
      '.sf-sessionRow:hover .sf-time,.sf-sessionRow.sf-menuOpen .sf-time{display:none}',
      '.sf-iconButton{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;padding:0;border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));cursor:pointer;flex:none}',
      '.sf-iconButton:hover{color:var(--dsw-alias-label-primary)}',
      '.sf-search{display:flex;align-items:center;gap:4px;margin:0 4px 4px;padding:0 6px;height:28px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1)}',
      '.sf-search:focus-within{border-color:var(--dsw-alias-brand-primary)}',
      '.sf-searchIcon{display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-searchInput{flex:1;min-width:0;height:100%;border:none;outline:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;font-family:inherit;padding:0}',
      '.sf-searchInput::placeholder{color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-results{display:flex;flex-direction:column;gap:1px}',
      '.sf-result{display:flex;flex-direction:column;gap:1px;width:100%;text-align:start;padding:5px 8px;border:none;background:transparent;border-radius:var(--dsw-radius-md,8px);cursor:pointer;font-family:inherit;color:var(--dsw-alias-label-primary)}',
      '.sf-result:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-resultTitle{font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sf-result.sf-archived .sf-resultTitle{color:var(--dsw-alias-label-caption,var(--dsw-alias-label-secondary))}',
      '.sf-snippet{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.sf-searchState{padding:12px 8px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));text-align:center}',
      '.sf-folderBlock{display:flex;flex-direction:column;gap:1px}',
      '.sf-folderRow{display:flex;align-items:center;gap:6px;height:32px;padding:0 8px;border-radius:var(--dsw-radius-md,8px);cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary);outline:none}',
      '.sf-folderRow:focus-visible{outline:1px solid var(--dsw-alias-brand-primary)}',
      '.sf-folderRow:hover,.sf-folderRow.sf-menuOpen{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-folderRow.sf-dropTarget{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary)}',
      '.sf-folderDot{width:8px;height:8px;border-radius:2px;flex:none}',
      '.sf-count{flex:none;font-size:10px;line-height:16px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-folderBody{display:flex;flex-direction:column;gap:1px}',
      '.sf-folderEmpty{height:26px;display:flex;align-items:center;padding-inline-start:32px;font-size:12px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-addWorkspace{display:flex;align-items:center;gap:6px;height:30px;padding:0 8px;margin-top:4px;border:none;background:transparent;border-radius:var(--dsw-radius-md,8px);color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;text-align:start}',
      '.sf-addWorkspace:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}',
      '.sf-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 8px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:12px;text-align:center}',
      '.sf-menu{position:fixed;z-index:90;box-sizing:border-box;padding:6px;border-radius:var(--dsw-radius-lg,12px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);box-shadow:0 12px 32px rgba(0,0,0,.24);display:flex;flex-direction:column;gap:1px;pointer-events:auto}',
      '.sf-menuItem{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;padding:0 8px;border:none;background:transparent;border-radius:var(--dsw-radius-sm,6px);color:var(--dsw-alias-label-primary);font-size:12px;text-align:start;cursor:pointer;font-family:inherit}',
      '.sf-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-menuItem:disabled{opacity:.5;cursor:default}',
      '.sf-menuChevron{margin-inline-start:auto;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));display:inline-flex}',
      '.sf-menuLabel{padding:4px 8px;font-size:11px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.sf-menuSeparator{height:1px;margin:4px 6px;background:var(--dsw-alias-border-l1)}',
      '.sf-swatch{width:8px;height:8px;border-radius:2px;flex:none}',
      '.sf-menuBack{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;border:none;background:transparent;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));font-size:11px;cursor:pointer;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);font-family:inherit;text-align:start}',
      '.sf-menuBack:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2))}',
      '.sf-mask{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.34);display:flex;align-items:center;justify-content:center;pointer-events:auto}',
      '.sf-dialog{width:min(420px,calc(100vw - 48px));box-sizing:border-box;background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,12px);box-shadow:0 24px 64px rgba(0,0,0,.32);padding:16px;display:flex;flex-direction:column;gap:12px;color:var(--dsw-alias-label-primary)}',
      '.sf-dialogTitle{font-size:14px;font-weight:600}',
      '.sf-dialogBody{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap}',
      '.sf-dialogError{font-size:12px;color:var(--dsw-alias-state-error-primary)}',
      '.sf-input{height:32px;box-sizing:border-box;width:100%;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;outline:none;font-family:inherit}',
      '.sf-input:focus{border-color:var(--dsw-alias-brand-primary)}',
      '.sf-dialogFooter{display:flex;justify-content:flex-end;gap:8px}',
      '.sf-button{height:28px;padding:0 12px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;cursor:pointer;font-family:inherit}',
      '.sf-button:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.sf-button.sf-primary{background:var(--dsw-alias-label-primary);border-color:transparent;color:var(--dsw-alias-bg-overlay)}',
      '.sf-button.sf-primary:hover{background:var(--dsw-alias-label-primary);opacity:.88}',
      '.sf-button.sf-primary:disabled:hover{opacity:.6}',
      '.sf-button.sf-danger{background:var(--dsw-alias-state-error-primary);border-color:transparent;color:var(--dsw-alias-bg-overlay)}',
      '.sf-button.sf-danger:hover{background:var(--dsw-alias-state-error-primary);opacity:.88}',
      '.sf-button.sf-danger:disabled:hover{opacity:.6}',
      '.sf-button:disabled{opacity:.6;cursor:default}',
      '@keyframes sf-pulse{0%,100%{opacity:1}50%{opacity:.35}}',
      '@media (prefers-reduced-motion:reduce){.sf-chevron{transition:none}.sf-dot[data-state=ongoing]{animation:none}}',
    ].join('');

    const LOCALE = {
      en: {
        'header.title': 'Sessions',
        'header.newSession': 'New session',
        'header.options': 'View options',
        'header.showArchived': 'Show archived sessions',
        'header.hideArchived': 'Hide archived sessions',
        'header.collapseAll': 'Collapse all',
        'header.expandAll': 'Expand all',
        'header.addWorkspace': 'Add workspace…',
        'search.placeholder': 'Search session names…',
        'search.clear': 'Clear search',
        'search.empty': 'No matching sessions',
        'search.more': 'Showing the first matches only',
        'group.defaultWorkspace': 'Default workspace',
        'group.ungrouped': 'Ungrouped',
        'group.newSession': 'New session',
        'group.rename': 'Rename workspace…',
        'group.delete': 'Remove workspace…',
        'group.newFolder': 'New folder…',
        'group.menu': 'Workspace options',
        'action.folderMenu': 'Folder actions',
        'action.sessionMenu': 'Session actions',
        'action.sessionMenuTitle': 'Session',
        'action.rename': 'Rename…',
        'action.delete': 'Delete',
        'action.color': 'Color',
        'action.addToFolder': 'Move to folder',
        'action.removeFromFolder': 'Remove from folder',
        'action.newFolder': 'New folder…',
        'action.archive': 'Archive',
        'action.unarchive': 'Unarchive',
        'action.fork': 'Fork session',
        'action.copyId': 'Copy session ID',
        'action.back': 'Back',
        'action.cancel': 'Cancel',
        'action.confirm': 'Confirm',
        'action.stopAndArchive': 'Stop and archive',
        'dialog.newFolderTitle': 'New folder',
        'dialog.newFolderPlaceholder': 'Folder name',
        'dialog.renameFolderTitle': 'Rename folder',
        'dialog.renameFolderPlaceholder': 'Folder name',
        'dialog.deleteFolderTitle': 'Delete folder',
        'dialog.deleteFolderBody': 'Sessions in “{name}” go back to the workspace list. The folder itself is removed.',
        'dialog.renameSessionTitle': 'Rename session',
        'dialog.renameSessionPlaceholder': 'Session title',
        'dialog.renameWorkspaceTitle': 'Rename workspace',
        'dialog.renameWorkspacePlaceholder': 'Workspace name',
        'dialog.deleteWorkspaceTitle': 'Remove workspace',
        'dialog.deleteWorkspaceBody': 'Remove “{name}” from the sidebar? Its sessions stay on disk.',
        'dialog.archiveTitle': 'Session is still working',
        'dialog.archiveBody': 'This session has work running. Stop it and archive the session?',
        'folder.empty': 'Empty folder',
        'folder.unnamed': 'Untitled folder',
        'session.untitled': 'New session',
        'session.archivedLabel': 'Archived',
        'empty.none': 'No sessions here yet',
        'error.rename': 'Rename failed: {message}',
        'error.folder': 'Operation failed: {message}',
        'time.now': 'now',
        'time.minutes': '{n}m ago',
        'time.hours': '{n}h ago',
        'time.days': '{n}d ago',
        'rail.expand': 'Expand sidebar',
        'color.blue': 'Blue',
        'color.violet': 'Violet',
        'color.teal': 'Teal',
        'color.green': 'Green',
        'color.amber': 'Amber',
        'color.orange': 'Orange',
        'color.rose': 'Rose',
        'color.pink': 'Pink',
        'color.slate': 'Slate',
      },
      zh: {
        'header.title': '会话',
        'header.newSession': '新建会话',
        'header.options': '视图选项',
        'header.showArchived': '显示已归档会话',
        'header.hideArchived': '隐藏已归档会话',
        'header.collapseAll': '全部收起',
        'header.expandAll': '全部展开',
        'header.addWorkspace': '添加工作区…',
        'search.placeholder': '搜索会话名称…',
        'search.clear': '清除搜索',
        'search.empty': '没有匹配的会话',
        'search.more': '仅显示前若干条结果',
        'group.defaultWorkspace': '默认工作区',
        'group.ungrouped': '未分组',
        'group.newSession': '新建会话',
        'group.rename': '重命名工作区…',
        'group.delete': '移除工作区…',
        'group.newFolder': '新建文件夹…',
        'group.menu': '工作区选项',
        'action.folderMenu': '文件夹操作',
        'action.sessionMenu': '会话操作',
        'action.sessionMenuTitle': '会话',
        'action.rename': '重命名…',
        'action.delete': '删除',
        'action.color': '颜色',
        'action.addToFolder': '加入文件夹',
        'action.removeFromFolder': '移出文件夹',
        'action.newFolder': '新建文件夹…',
        'action.archive': '归档',
        'action.unarchive': '取消归档',
        'action.fork': '分叉会话',
        'action.copyId': '复制 Session ID',
        'action.back': '返回',
        'action.cancel': '取消',
        'action.confirm': '确定',
        'action.stopAndArchive': '停止并归档',
        'dialog.newFolderTitle': '新建文件夹',
        'dialog.newFolderPlaceholder': '文件夹名称',
        'dialog.renameFolderTitle': '重命名文件夹',
        'dialog.renameFolderPlaceholder': '文件夹名称',
        'dialog.deleteFolderTitle': '删除文件夹',
        'dialog.deleteFolderBody': '「{name}」里的会话会回到工作区列表，文件夹本身删除。',
        'dialog.renameSessionTitle': '重命名会话',
        'dialog.renameSessionPlaceholder': '会话标题',
        'dialog.renameWorkspaceTitle': '重命名工作区',
        'dialog.renameWorkspacePlaceholder': '工作区名称',
        'dialog.deleteWorkspaceTitle': '移除工作区',
        'dialog.deleteWorkspaceBody': '把「{name}」从侧栏移除？会话记录仍然保留在磁盘上。',
        'dialog.archiveTitle': '会话还在运行',
        'dialog.archiveBody': '这个会话还有正在运行的工作。要停止它并归档吗？',
        'folder.empty': '空文件夹',
        'folder.unnamed': '未命名文件夹',
        'session.untitled': '新会话',
        'session.archivedLabel': '已归档',
        'empty.none': '还没有会话',
        'error.rename': '重命名失败：{message}',
        'error.folder': '操作失败：{message}',
        'time.now': '刚刚',
        'time.minutes': '{n} 分钟前',
        'time.hours': '{n} 小时前',
        'time.days': '{n} 天前',
        'rail.expand': '展开侧栏',
        'color.blue': '蓝色',
        'color.violet': '紫色',
        'color.teal': '青色',
        'color.green': '绿色',
        'color.amber': '琥珀色',
        'color.orange': '橙色',
        'color.rose': '玫红',
        'color.pink': '粉色',
        'color.slate': '灰色',
      },
    };

    // ---- storage -------------------------------------------------------

    function emptyData() {
      return { version: DATA_VERSION, folders: {}, assign: {}, collapsed: {}, showArchived: true };
    }

    function loadData() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null) return emptyData();
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object') return emptyData();
        const data = emptyData();
        if (parsed.folders !== null && typeof parsed.folders === 'object') data.folders = parsed.folders;
        if (parsed.assign !== null && typeof parsed.assign === 'object') data.assign = parsed.assign;
        if (parsed.collapsed !== null && typeof parsed.collapsed === 'object') data.collapsed = parsed.collapsed;
        // Version 1 shipped with archived sessions hidden; that default was not a
        // user choice, so it is upgraded to the visible default once.
        data.showArchived = parsed.version === DATA_VERSION ? parsed.showArchived === true : true;
        return data;
      } catch (reason) {
        console.warn('[session-folders] could not read folder data:', reason);
        return emptyData();
      }
    }

    function saveData(data) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (reason) {
        console.warn('[session-folders] could not persist folder data:', reason);
      }
    }

    function createStore(initial) {
      let value = initial;
      const listeners = new Set();
      return {
        getSnapshot() { return value; },
        subscribe(listener) {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
        set(next) {
          if (next === value) return;
          value = next;
          for (const listener of listeners) listener();
        },
      };
    }

    function folderId() {
      return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function colorValue(id) {
      const entry = COLORS.find((color) => color.id === id);
      return entry === undefined ? COLORS[0].value : entry.value;
    }

    // ---- pure folder operations ---------------------------------------

    function withFolders(data, workspaceKey, nextFolders) {
      const folders = Object.assign({}, data.folders);
      folders[workspaceKey] = nextFolders;
      return Object.assign({}, data, { folders });
    }

    function createFolder(data, workspaceKey, name, sessionId) {
      const list = Array.isArray(data.folders[workspaceKey]) ? data.folders[workspaceKey] : [];
      const folder = { id: folderId(), name: name, color: 'blue', collapsed: false };
      let next = withFolders(data, workspaceKey, list.concat([folder]));
      if (typeof sessionId === 'string') next = assignSession(next, sessionId, folder.id);
      return next;
    }

    function renameFolder(data, workspaceKey, id, name) {
      const list = (data.folders[workspaceKey] || []).map((folder) =>
        folder.id === id ? Object.assign({}, folder, { name }) : folder);
      return withFolders(data, workspaceKey, list);
    }

    function setFolderColor(data, workspaceKey, id, color) {
      const list = (data.folders[workspaceKey] || []).map((folder) =>
        folder.id === id ? Object.assign({}, folder, { color }) : folder);
      return withFolders(data, workspaceKey, list);
    }

    function setFolderCollapsed(data, workspaceKey, id, collapsed) {
      const list = (data.folders[workspaceKey] || []).map((folder) =>
        folder.id === id ? Object.assign({}, folder, { collapsed }) : folder);
      return withFolders(data, workspaceKey, list);
    }

    function deleteFolder(data, workspaceKey, id) {
      const list = (data.folders[workspaceKey] || []).filter((folder) => folder.id !== id);
      const assign = {};
      for (const [sessionId, folderOf] of Object.entries(data.assign)) {
        if (folderOf !== id) assign[sessionId] = folderOf;
      }
      return Object.assign(withFolders(data, workspaceKey, list), { assign });
    }

    function assignSession(data, sessionId, id) {
      const assign = Object.assign({}, data.assign);
      assign[sessionId] = id;
      return Object.assign({}, data, { assign });
    }

    function unassignSession(data, sessionId) {
      if (data.assign[sessionId] === undefined) return data;
      const assign = Object.assign({}, data.assign);
      delete assign[sessionId];
      return Object.assign({}, data, { assign });
    }

    // ---- small helpers -------------------------------------------------

    function cx() {
      let out = '';
      for (const part of arguments) {
        if (typeof part === 'string' && part !== '') out = out === '' ? part : out + ' ' + part;
      }
      return out;
    }

    function basename(path) {
      if (typeof path !== 'string' || path === '') return '';
      const parts = path.split(/[\\/]+/).filter((part) => part !== '');
      return parts.length === 0 ? path : parts[parts.length - 1];
    }

    function currentSessionId(byId) {
      for (const id of Object.keys(byId)) {
        const summary = byId[id];
        if (summary !== null && summary.retainedBy !== undefined && (summary.retainedBy.mainView || 0) > 0) return id;
      }
      return undefined;
    }

    function statusState(node) {
      if (node === null || node === undefined) return 'idle';
      if (node.pendingInteraction !== undefined) return 'warning';
      if (node.running === true || (node.runningSubagentCount || 0) > 0) return 'ongoing';
      if (node.completed === true) return 'done';
      return 'idle';
    }

    function formatTime(updatedAt, t) {
      if (typeof updatedAt !== 'number' || updatedAt <= 0) return '';
      const diff = Date.now() - updatedAt;
      const minute = 60000;
      const hour = 60 * minute;
      const day = 24 * hour;
      if (diff < minute) return t('time.now');
      if (diff < hour) return t('time.minutes', { n: Math.floor(diff / minute) });
      if (diff < day) return t('time.hours', { n: Math.floor(diff / hour) });
      if (diff < 7 * day) return t('time.days', { n: Math.floor(diff / day) });
      const date = new Date(updatedAt);
      return String(date.getMonth() + 1) + '/' + String(date.getDate());
    }

    // ---- model ---------------------------------------------------------

    function buildModel(list, workspaceSnapshot, data) {
      const byId = list.byId || {};
      const current = currentSessionId(byId);
      const archived = new Set(workspaceSnapshot.archivedSessionIds || []);
      const pinned = new Set(workspaceSnapshot.pinnedSessionIds || []);
      const showArchived = data.showArchived === true;
      const items = workspaceSnapshot.items || [];

      const groupOf = new Map();
      for (const item of items) {
        for (const id of item.sessionIds || []) groupOf.set(id, item.workspaceId);
      }

      const visible = (summary) => {
        if (summary === null || summary === undefined) return false;
        if (summary.origin === 'subagent') return false;
        if (summary.blank === true && summary.id !== current) return false;
        if (showArchived === false && archived.has(summary.id)) return false;
        return true;
      };

      const groups = [];
      for (const item of items) {
        const sessionIds = (item.sessionIds || []).filter((id) => visible(byId[id]));
        groups.push({
          key: item.workspaceId,
          workspaceId: item.workspaceId,
          title: item.title,
          path: item.path,
          sessionIds,
        });
      }
      const ungrouped = Object.keys(byId)
        .filter((id) => groupOf.has(id) === false && visible(byId[id]))
        .sort((a, b) => ((byId[b].updatedAt || 0) - (byId[a].updatedAt || 0)));
      if (ungrouped.length > 0) {
        groups.push({ key: '', workspaceId: undefined, title: undefined, path: undefined, sessionIds: ungrouped });
      }

      for (const group of groups) {
        const folders = (Array.isArray(data.folders[group.key]) ? data.folders[group.key] : [])
          .map((folder, index) => ({ folder, index }));
        const known = new Set(folders.map((entry) => entry.folder.id));
        const members = new Map(folders.map((entry) => [entry.folder.id, []]));
        const loose = [];
        for (const id of group.sessionIds) {
          const folderOf = data.assign[id];
          if (typeof folderOf === 'string' && known.has(folderOf)) members.get(folderOf).push(id);
          else loose.push(id);
        }

        const blocks = [];
        for (const id of loose) {
          const summary = byId[id];
          blocks.push({
            kind: 'session',
            id,
            summary,
            archived: archived.has(id),
            pinned: pinned.has(id),
            rank: summary.blank === true ? Number.MAX_SAFE_INTEGER : (summary.updatedAt || 0),
          });
        }
        for (const entry of folders) {
          const folder = entry.folder;
          const memberIds = members.get(folder.id);
          let rank = 0;
          let isPinned = false;
          for (const id of memberIds) {
            const summary = byId[id];
            if (summary !== undefined) rank = Math.max(rank, summary.updatedAt || 0);
            if (pinned.has(id)) isPinned = true;
          }
          blocks.push({ kind: 'folder', folder, index: entry.index, memberIds, pinned: isPinned, rank });
        }

        blocks.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          if (a.rank !== b.rank) return b.rank - a.rank;
          if (a.kind !== b.kind) return a.kind === 'session' ? -1 : 1;
          if (a.kind === 'session') return a.id < b.id ? -1 : 1;
          return a.index - b.index;
        });
        group.blocks = blocks;
      }

      return { groups, current, archived, pinned, byId };
    }

    function groupTitle(group, t) {
      if (group.key === '') return t('group.ungrouped');
      if (typeof group.title === 'string' && group.title !== '' && group.title !== 'default-workspace') return group.title;
      if (group.title === 'default-workspace') return t('group.defaultWorkspace');
      const label = basename(group.path);
      if (label !== '') return label;
      return typeof group.workspaceId === 'string' ? group.workspaceId : t('group.ungrouped');
    }

    // ---- icons ---------------------------------------------------------

    function IconChevron() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M6 3.5 10.5 8 6 12.5', stroke: 'currentColor', strokeWidth: 1.5,
          strokeLinecap: 'round', strokeLinejoin: 'round',
        }));
    }

    function IconPlus() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M8 3.5v9M3.5 8h9', stroke: 'currentColor', strokeWidth: 1.5,
          strokeLinecap: 'round',
        }));
    }

    function IconMore() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': true },
        h('circle', { cx: 3, cy: 8, r: 1.35 }),
        h('circle', { cx: 8, cy: 8, r: 1.35 }),
        h('circle', { cx: 13, cy: 8, r: 1.35 }));
    }

    function IconSliders() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M2.5 5h11M2.5 11h11', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round',
        }),
        h('circle', { cx: 6, cy: 5, r: 1.6, fill: 'var(--dsw-alias-bg-overlay)', stroke: 'currentColor', strokeWidth: 1.3 }),
        h('circle', { cx: 10.5, cy: 11, r: 1.6, fill: 'var(--dsw-alias-bg-overlay)', stroke: 'currentColor', strokeWidth: 1.3 }));
    }

    function IconFolder() {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.4 1.7h5A1.5 1.5 0 0 1 14 6.2v5.3A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z',
          stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round',
        }));
    }

    function IconBack() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M9.5 3.5 5 8l4.5 4.5', stroke: 'currentColor', strokeWidth: 1.4,
          strokeLinecap: 'round', strokeLinejoin: 'round',
        }));
    }

    function IconClose() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M4 4l8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.4,
          strokeLinecap: 'round',
        }));
    }

    function IconSearch() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('circle', { cx: 7, cy: 7, r: 4.2, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M10.2 10.2 13.5 13.5', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }));
    }

    // ---- popup menu ----------------------------------------------------

    function Menu(props) {
      const menu = props.menu;
      const onClose = props.onClose;
      const push = props.push;
      const back = props.back;
      const ref = useRef(null);
      const [position, setPosition] = useState({ left: menu.x, top: menu.y });

      useEffect(() => {
        const node = ref.current;
        if (node === null) return;
        const rect = node.getBoundingClientRect();
        const width = rect.width || MENU_WIDTH;
        let left = menu.x;
        let top = menu.y;
        if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
        if (top + rect.height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - rect.height - 8);
        if (left !== position.left || top !== position.top) setPosition({ left, top });
      }, [menu.x, menu.y, menu.items, position.left, position.top]);

      return h('div', {
        ref,
        className: 'sf-menu',
        role: 'menu',
        style: { left: position.left + 'px', top: position.top + 'px', minWidth: MENU_WIDTH + 'px', maxWidth: '280px' },
      },
      menu.parent !== undefined && h('button', {
        type: 'button', className: 'sf-menuBack', role: 'menuitem',
        onClick: () => { back(); },
      }, h('span', { style: { display: 'inline-flex' } }, h(IconBack)), menu.title),
      menu.items.map((item, index) => {
        if (item.type === 'separator') return h('div', { key: 'sep' + index, className: 'sf-menuSeparator', role: 'separator' });
        if (item.type === 'label') return h('div', { key: 'label' + index, className: 'sf-menuLabel' }, item.text);
        const disabled = item.disabled === true;
        return h('button', {
          key: 'item' + index,
          type: 'button',
          role: 'menuitem',
          className: 'sf-menuItem',
          disabled,
          onClick: () => {
            if (disabled) return;
            if (Array.isArray(item.items)) {
              push(Object.assign({}, menu, { title: item.label, items: item.items, parent: { title: menu.title, items: menu.items, parent: menu.parent } }));
              return;
            }
            onClose();
            const result = item.onSelect === undefined ? undefined : item.onSelect();
            if (result !== undefined && typeof result.then === 'function') result.catch((reason) => console.warn('[session-folders] action failed:', reason));
          },
        },
        item.swatch !== undefined && h('span', { className: 'sf-swatch', style: { background: item.swatch } }),
        h('span', { style: { flex: '1', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.label),
        Array.isArray(item.items) && h('span', { className: 'sf-menuChevron' }, h(IconChevron)));
      }));
    }

    // ---- dialogs -------------------------------------------------------

    function DialogHost(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const request = props.useDialog((value) => value);
      const closeDialog = props.closeDialog;
      const [value, setValue] = useState('');
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState(null);
      const inputRef = useRef(null);

      useEffect(() => {
        setValue(typeof request === 'object' && request !== null && typeof request.value === 'string' ? request.value : '');
        setBusy(false);
        setError(null);
      }, [request]);

      useEffect(() => {
        if (request === null || request === undefined) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            closeDialog();
          }
        };
        document.addEventListener('keydown', onKeyDown, true);
        const node = inputRef.current;
        if (node !== null) {
          node.focus();
          node.select();
        }
        return () => document.removeEventListener('keydown', onKeyDown, true);
      }, [request, closeDialog]);

      if (request === null || request === undefined) return null;
      const kind = request.kind;
      const hasInput = kind === 'folderCreate' || kind === 'folderRename' || kind === 'sessionRename' || kind === 'workspaceRename';

      const finish = (run) => {
        setBusy(true);
        setError(null);
        Promise.resolve()
          .then(() => run())
          .then(() => { closeDialog(); })
          .catch((reason) => {
            setBusy(false);
            setError(t('error.folder', { message: reason !== null && reason !== undefined && reason.message !== undefined ? reason.message : String(reason) }));
          });
      };

      const submit = () => {
        if (busy === true) return;
        const name = value.trim();
        if (hasInput && name === '') return;
        switch (kind) {
          case 'folderCreate':
            props.createFolder(request.workspaceKey, name, request.sessionId);
            closeDialog();
            return;
          case 'folderRename':
            props.renameFolder(request.workspaceKey, request.folderId, name);
            closeDialog();
            return;
          case 'sessionRename':
            finish(() => props.renameSession(request.sessionId, name));
            return;
          case 'workspaceRename':
            finish(() => props.renameWorkspace(request.workspaceId, name));
            return;
          case 'folderDelete':
            props.deleteFolderData(request.workspaceKey, request.folderId);
            closeDialog();
            return;
          case 'workspaceDelete':
            finish(() => props.deleteWorkspace(request.workspaceId));
            return;
          case 'archiveConfirm':
            finish(() => props.archiveSession(request.sessionId, { stopActivity: true }));
            return;
          default:
            closeDialog();
        }
      };

      const onSubmit = (event) => {
        if (event !== undefined) event.preventDefault();
        submit();
      };

      const title = {
        folderCreate: t('dialog.newFolderTitle'),
        folderRename: t('dialog.renameFolderTitle'),
        sessionRename: t('dialog.renameSessionTitle'),
        workspaceRename: t('dialog.renameWorkspaceTitle'),
        folderDelete: t('dialog.deleteFolderTitle'),
        workspaceDelete: t('dialog.deleteWorkspaceTitle'),
        archiveConfirm: t('dialog.archiveTitle'),
      }[kind] || '';

      const body = kind === 'folderDelete'
        ? t('dialog.deleteFolderBody', { name: request.name })
        : kind === 'workspaceDelete'
          ? t('dialog.deleteWorkspaceBody', { name: request.name })
          : kind === 'archiveConfirm'
            ? t('dialog.archiveBody')
            : null;

      const confirmLabel = kind === 'archiveConfirm' ? t('action.stopAndArchive') : t('action.confirm');
      const danger = kind === 'folderDelete' || kind === 'workspaceDelete' || kind === 'archiveConfirm';
      const placeholder = {
        folderCreate: t('dialog.newFolderPlaceholder'),
        folderRename: t('dialog.renameFolderPlaceholder'),
        sessionRename: t('dialog.renameSessionPlaceholder'),
        workspaceRename: t('dialog.renameWorkspacePlaceholder'),
      }[kind] || '';

      return h('div', {
        className: 'sf-mask',
        onMouseDown: (event) => { if (event.target === event.currentTarget) closeDialog(); },
      },
      h('form', {
        className: 'sf-dialog',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': title,
        onSubmit,
      },
      h('div', { className: 'sf-dialogTitle' }, title),
      body !== null && h('div', { className: 'sf-dialogBody' }, body),
      hasInput && h('input', {
        ref: inputRef,
        className: 'sf-input',
        value,
        placeholder,
        disabled: busy,
        onChange: (event) => setValue(event.target.value),
      }),
      error !== null && h('div', { className: 'sf-dialogError' }, error),
      h('div', { className: 'sf-dialogFooter' },
        h('button', { type: 'button', className: 'sf-button', disabled: busy, onClick: () => closeDialog() }, t('action.cancel')),
        h('button', {
          type: 'submit',
          className: cx('sf-button', danger ? 'sf-danger' : 'sf-primary'),
          disabled: busy || (hasInput && value.trim() === ''),
        }, confirmLabel))));
    }

    // ---- browser -------------------------------------------------------

    function WorkspaceFolders(props) {
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const wide = props.wide !== false;
      const expandSidebar = props.expandSidebar;

      const list = props.useSessions((state) => state);
      const snapshot = props.useWorkspaces((state) => state);
      const statuses = props.useSessionStatus((state) => state) || {};
      const data = props.useData((state) => state);

      const [menu, setMenu] = useState(null);
      const [dragging, setDragging] = useState(null);
      const [dropTarget, setDropTarget] = useState(null);
      const [query, setQuery] = useState('');
      const [remoteHits, setRemoteHits] = useState({ query: '', items: [], hasMore: false });
      const [, setClock] = useState(0);
      const menuRef = useRef(null);
      const searchRef = useRef(props.searchSessions);
      searchRef.current = props.searchSessions;

      useEffect(() => {
        const handle = window.setInterval(() => setClock((value) => value + 1), 60000);
        return () => { window.clearInterval(handle); };
      }, []);

      // Content search is an optional Host capability: this deployment configures
      // the session-query index with openAt "never", so a failed probe switches the
      // plugin to its local title matching for the rest of the page's lifetime.
      useEffect(() => {
        const text = query.trim();
        if (text === '' || remoteSearchOff === true) {
          setRemoteHits({ query: '', items: [], hasMore: false });
          return undefined;
        }
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
          Promise.resolve()
            .then(() => searchRef.current(text, controller.signal))
            .then((result) => {
              if (controller.signal.aborted) return;
              if (result === null || result === undefined || result.ok !== true) {
                remoteSearchOff = true;
                setRemoteHits({ query: text, items: [], hasMore: false });
                return;
              }
              const value = result.value === undefined || result.value === null ? {} : result.value;
              setRemoteHits({
                query: text,
                items: Array.isArray(value.items) ? value.items : [],
                hasMore: value.hasMore === true,
              });
            })
            .catch(() => {
              if (controller.signal.aborted) return;
              remoteSearchOff = true;
              setRemoteHits({ query: text, items: [], hasMore: false });
            });
        }, 250);
        return () => {
          window.clearTimeout(timer);
          controller.abort();
        };
      }, [query]);

      useEffect(() => {
        if (menu === null) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            setMenu(null);
          }
        };
        const onPointerDown = (event) => {
          const node = menuRef.current;
          if (node !== null && node.contains(event.target)) return;
          setMenu(null);
        };
        const onScroll = () => setMenu(null);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('mousedown', onPointerDown, true);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
          document.removeEventListener('keydown', onKeyDown, true);
          document.removeEventListener('mousedown', onPointerDown, true);
          window.removeEventListener('scroll', onScroll, true);
          window.removeEventListener('resize', onScroll);
        };
      }, [menu]);

      const model = useMemo(() => buildModel(list, snapshot, data), [list, snapshot, data]);

      const updateData = props.updateData;

      const openMenuAt = useCallback((anchor, page) => {
        const rect = anchor.getBoundingClientRect();
        const height = (page.items.length * MENU_ITEM_HEIGHT) + (page.parent === undefined ? 12 : 40);
        let x = rect.right - MENU_WIDTH;
        if (x < 8) x = 8;
        let y = rect.bottom + 4;
        if (y + height > window.innerHeight - 8) y = Math.max(8, rect.top - height - 4);
        setMenu(Object.assign({ x, y }, page));
      }, []);

      const pushPage = useCallback((next) => setMenu(next), []);
      const popPage = useCallback(() => {
        setMenu((current) => {
          if (current === null || current.parent === undefined) return current;
          return Object.assign({}, current, { title: current.parent.title, items: current.parent.items, parent: current.parent.parent });
        });
      }, []);

      const toggleGroup = useCallback((key) => {
        updateData((previous) => {
          const collapsed = Object.assign({}, previous.collapsed);
          if (collapsed[key] === true) delete collapsed[key];
          else collapsed[key] = true;
          return Object.assign({}, previous, { collapsed });
        });
      }, [updateData]);

      const toggleFolder = useCallback((workspaceKey, id, collapsed) => {
        updateData((previous) => setFolderCollapsed(previous, workspaceKey, id, collapsed === false));
      }, [updateData]);

      const menuClose = useCallback(() => setMenu(null), []);

      const assign = useCallback((sessionId, folderId) => {
        menuClose();
        updateData((previous) => assignSession(previous, sessionId, folderId));
      }, [menuClose, updateData]);

      const removeFromFolder = useCallback((sessionId) => {
        updateData((previous) => unassignSession(previous, sessionId));
      }, [updateData]);

      const askArchive = useCallback((sessionId) => {
        props.archiveSession(sessionId).catch((reason) => {
          const details = reason !== null && reason !== undefined ? reason.rpcError : undefined;
          if (details !== undefined && details !== null && details.code === 'workspace/session-active') {
            props.requestDialog({ kind: 'archiveConfirm', sessionId });
            return;
          }
          console.warn('[session-folders] archive rejected:', reason);
        });
      }, [props]);

      // header/section actions ------------------------------------------

      const addWorkspace = useCallback(() => {
        Promise.resolve()
          .then(() => props.pickDirectory())
          .then((path) => {
            if (typeof path !== 'string' || path === '') return undefined;
            return props.createWorkspace({ path });
          })
          .catch((reason) => console.warn('[session-folders] add workspace failed:', reason));
      }, [props]);

      const openHeaderMenu = useCallback((event) => {
        const items = [
          {
            label: data.showArchived === true ? t('header.hideArchived') : t('header.showArchived'),
            onSelect: () => updateData((previous) => Object.assign({}, previous, { showArchived: previous.showArchived !== true })),
          },
          { type: 'separator' },
          {
            label: t('header.collapseAll'),
            onSelect: () => updateData((previous) => {
              const collapsed = {};
              for (const group of model.groups) collapsed[group.key] = true;
              return Object.assign({}, previous, { collapsed });
            }),
          },
          {
            label: t('header.expandAll'),
            onSelect: () => updateData((previous) => Object.assign({}, previous, { collapsed: {} })),
          },
        ];
        openMenuAt(event.currentTarget, { title: t('header.options'), items });
      }, [data.showArchived, model.groups, openMenuAt, t, updateData]);

      // row menus ------------------------------------------------------

      const sessionMenu = useCallback((block, group, anchor) => {
        const sessionId = block.id;
        const folders = (Array.isArray(data.folders[group.key]) ? data.folders[group.key] : []);
        const folderOf = data.assign[sessionId];
        const items = [];
        if (folderOf === undefined) {
          const folderItems = folders.map((folder) => ({
            label: folder.name,
            swatch: colorValue(folder.color),
            onSelect: () => assign(sessionId, folder.id),
          }));
          folderItems.push({ type: 'separator' });
          folderItems.push({
            label: t('action.newFolder'),
            onSelect: () => props.requestDialog({ kind: 'folderCreate', workspaceKey: group.key, sessionId }),
          });
          items.push({ label: t('action.addToFolder'), items: folderItems });
        } else {
          items.push({ label: t('action.removeFromFolder'), onSelect: () => removeFromFolder(sessionId) });
        }
        items.push({ type: 'separator' });
        items.push({
          label: t('action.rename'),
          onSelect: () => props.requestDialog({
            kind: 'sessionRename', sessionId, value: block.summary.displayTitle || '',
          }),
        });
        if (block.archived === true) {
          items.push({ label: t('action.unarchive'), onSelect: () => props.unarchiveSession(sessionId) });
        } else {
          items.push({ label: t('action.archive'), onSelect: () => askArchive(sessionId) });
        }
        items.push({ label: t('action.fork'), onSelect: () => props.forkSession(sessionId) });
        items.push({ type: 'separator' });
        items.push({ label: t('action.copyId'), onSelect: () => props.copySessionId(sessionId) });
        openMenuAt(anchor, { title: t('action.sessionMenuTitle'), rowKey: 'session:' + sessionId, items });
      }, [assign, askArchive, data.assign, data.folders, openMenuAt, props, removeFromFolder, t]);

      const folderMenu = useCallback((block, group, anchor) => {
        const folder = block.folder;
        const colorItems = COLORS.map((color) => ({
          label: t('color.' + color.id),
          swatch: color.value,
          onSelect: () => updateData((previous) => setFolderColor(previous, group.key, folder.id, color.id)),
        }));
        const items = [
          { label: t('action.rename'), onSelect: () => props.requestDialog({ kind: 'folderRename', workspaceKey: group.key, folderId: folder.id, value: folder.name }) },
          { label: t('action.color'), items: colorItems },
          { type: 'separator' },
          { label: t('action.delete'), onSelect: () => props.requestDialog({ kind: 'folderDelete', workspaceKey: group.key, folderId: folder.id, name: folder.name }) },
        ];
        openMenuAt(anchor, { title: folder.name, rowKey: 'folder:' + folder.id, items });
      }, [openMenuAt, props, t, updateData]);

      const groupMenu = useCallback((group, anchor) => {
        const items = [
          { label: t('group.newSession'), onSelect: () => props.startSession(group.workspaceId) },
          { label: t('group.newFolder'), onSelect: () => props.requestDialog({ kind: 'folderCreate', workspaceKey: group.key }) },
        ];
        if (typeof group.workspaceId === 'string') {
          items.push({ type: 'separator' });
          items.push({
            label: t('group.rename'),
            onSelect: () => props.requestDialog({ kind: 'workspaceRename', workspaceId: group.workspaceId, value: typeof group.title === 'string' && group.title !== 'default-workspace' ? group.title : '' }),
          });
          items.push({
            label: t('group.delete'),
            onSelect: () => props.requestDialog({ kind: 'workspaceDelete', workspaceId: group.workspaceId, name: groupTitle(group, t) }),
          });
        }
        openMenuAt(anchor, { title: groupTitle(group, t), items });
      }, [openMenuAt, props, t]);

      // render ---------------------------------------------------------

      if (wide === false) {
        return h('div', { className: 'sf-root sf-rail' },
          h('button', {
            type: 'button',
            className: 'sf-railButton',
            title: t('rail.expand'),
            'aria-label': t('rail.expand'),
            onClick: () => { if (typeof expandSidebar === 'function') expandSidebar(); },
          }, h(IconFolder)));
      }

      const keyHandler = (run) => (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          run();
        }
      };

      const renderSession = (block, group, indent) => {
        const summary = block.summary;
        const selected = summary.id === model.current;
        const title = typeof summary.displayTitle === 'string' && summary.displayTitle !== ''
          ? summary.displayTitle
          : t('session.untitled');
        const state = statusState(statuses[summary.id]);
        return h('div', {
          key: 'session:' + summary.id,
          className: cx('sf-sessionRow', indent === true && 'sf-indent', selected && 'sf-selected', block.archived === true && 'sf-archived', menu !== null && menu.rowKey === 'session:' + summary.id && 'sf-menuOpen'),
          role: 'button',
          tabIndex: 0,
          'aria-label': title,
          'aria-current': selected ? 'true' : undefined,
          draggable: block.archived !== true,
          onKeyDown: keyHandler(() => { props.openSession(summary.id); }),
          onClick: () => { props.openSession(summary.id); },
          onDragStart: (event) => {
            setDragging(summary.id);
            try {
              event.dataTransfer.setData('text/plain', summary.id);
              event.dataTransfer.effectAllowed = 'move';
            } catch (reason) { /* dataTransfer is best effort */ }
          },
          onDragEnd: () => { setDragging(null); setDropTarget(null); },
        },
        h('span', { className: 'sf-slot' },
          state !== 'idle' && block.archived !== true && h('span', { className: 'sf-dot', 'data-state': state })),
        h('span', { className: 'sf-title' }, title),
        h('span', { className: 'sf-time' }, block.archived === true ? t('session.archivedLabel') : formatTime(summary.updatedAt, t)),
        h('span', { className: 'sf-rowActions' },
          h('button', {
            type: 'button',
            className: 'sf-iconButton',
            title: t('action.sessionMenu'),
            'aria-label': t('action.sessionMenu'),
            onClick: (event) => {
              event.stopPropagation();
              sessionMenu(block, group, event.currentTarget);
            },
            onKeyDown: (event) => { event.stopPropagation(); },
          }, h(IconMore))));
      };

      const renderFolder = (block, group) => {
        const folder = block.folder;
        const collapsed = folder.collapsed === true;
        return h('div', { key: 'folder:' + folder.id, className: 'sf-folderBlock' },
          h('div', {
            className: cx('sf-folderRow', dropTarget === 'folder:' + folder.id && 'sf-dropTarget', menu !== null && menu.rowKey === 'folder:' + folder.id && 'sf-menuOpen'),
            role: 'button',
            tabIndex: 0,
            'aria-expanded': collapsed ? 'false' : 'true',
            'aria-label': folder.name,
            onKeyDown: keyHandler(() => toggleFolder(group.key, folder.id, collapsed)),
            onClick: () => toggleFolder(group.key, folder.id, collapsed),
            onDragOver: (event) => {
              if (dragging === null) return;
              event.preventDefault();
              event.stopPropagation();
              try { event.dataTransfer.dropEffect = 'move'; } catch (reason) { /* ignore */ }
              if (dropTarget !== 'folder:' + folder.id) setDropTarget('folder:' + folder.id);
            },
            onDragLeave: () => {
              if (dropTarget === 'folder:' + folder.id) setDropTarget(null);
            },
            onDrop: (event) => {
              event.preventDefault();
              event.stopPropagation();
              let sessionId = dragging;
              if (sessionId === null) {
                try { sessionId = event.dataTransfer.getData('text/plain'); } catch (reason) { sessionId = null; }
              }
              setDragging(null);
              setDropTarget(null);
              if (typeof sessionId === 'string' && sessionId !== '') {
                updateData((previous) => assignSession(previous, sessionId, folder.id));
              }
            },
          },
          h('span', { className: cx('sf-chevron', collapsed === false && 'sf-open') }, h(IconChevron)),
          h('span', { className: 'sf-folderDot', style: { background: colorValue(folder.color) } }),
          h('span', { className: 'sf-title' }, folder.name === '' ? t('folder.unnamed') : folder.name),
          h('span', { className: 'sf-count' }, String(block.memberIds.length)),
          h('span', { className: 'sf-rowActions' },
            h('button', {
              type: 'button',
              className: 'sf-iconButton',
              title: t('action.folderMenu'),
              'aria-label': t('action.folderMenu'),
              onClick: (event) => {
                event.stopPropagation();
                folderMenu(block, group, event.currentTarget);
              },
              onKeyDown: (event) => { event.stopPropagation(); },
            }, h(IconMore)))),
          collapsed === false && h('div', { className: 'sf-folderBody' },
            block.memberIds.length === 0
              ? h('div', { className: 'sf-folderEmpty' }, t('folder.empty'))
              : block.memberIds.map((id) => renderSession(
                { id, summary: model.byId[id], archived: model.archived.has(id) },
                group,
                true))));
      };

      const groups = model.groups;
      const hasAny = groups.some((group) => group.sessionIds.length > 0 || (Array.isArray(data.folders[group.key]) && data.folders[group.key].length > 0));
      const searching = query.trim() !== '';

      // Titles, workspace labels, and folder names match locally and instantly;
      // content hits from the Host index (when this deployment has one) are merged
      // in and supply the snippet line.
      const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === '') return { rows: [], hasMore: false };
        const showArchivedNow = data.showArchived === true;
        const matches = [];
        const taken = new Set();
        const push = (id, label, snippet) => {
          if (typeof id !== 'string' || id === '' || taken.has(id)) return;
          const summary = model.byId[id];
          if (summary === undefined) return;
          if (summary.origin === 'subagent') return;
          if (summary.blank === true && id !== model.current) return;
          if (showArchivedNow === false && model.archived.has(id) === true) return;
          taken.add(id);
          matches.push({
            id,
            label,
            snippet,
            rank: typeof summary.updatedAt === 'number' ? summary.updatedAt : 0,
          });
        };
        for (const group of model.groups) {
          const groupLabel = groupTitle(group, t);
          const groupHit = groupLabel.toLowerCase().includes(q);
          const folderLabels = new Map();
          for (const block of group.blocks) {
            if (block.kind !== 'folder' || typeof block.folder.name !== 'string' || block.folder.name === '') continue;
            if (block.folder.name.toLowerCase().includes(q) === false) continue;
            for (const id of block.memberIds) folderLabels.set(id, block.folder.name);
          }
          for (const id of group.sessionIds) {
            const summary = model.byId[id];
            if (summary === undefined) continue;
            const title = typeof summary.displayTitle === 'string' ? summary.displayTitle.toLowerCase() : '';
            if (title.includes(q) === false && groupHit === false && folderLabels.has(id) === false) continue;
            push(id, folderLabels.get(id) || groupLabel, '');
          }
        }
        for (const item of remoteHits.items) {
          const id = item === null || item === undefined ? undefined : item.sessionId;
          const snippet = item === null || item === undefined || item.snippet === undefined || item.snippet === null
            ? ''
            : String(item.snippet);
          push(id, '', snippet);
        }
        matches.sort((left, right) => (right.rank - left.rank) || (left.id < right.id ? -1 : 1));
        return { rows: matches, hasMore: remoteHits.hasMore === true };
      }, [query, model, data.showArchived, t, remoteHits]);

      const searchBody = () => {
        if (searchResults.rows.length === 0) {
          return h('div', { className: 'sf-searchState' }, t('search.empty'));
        }
        return [
          h('div', { className: 'sf-results', key: 'results' },
            searchResults.rows.map((row) => {
              const summary = model.byId[row.id];
              const archived = model.archived.has(row.id);
              const secondary = row.snippet !== '' ? row.snippet : row.label;
              return h('button', {
                type: 'button',
                key: 'result:' + row.id,
                className: cx('sf-result', archived && 'sf-archived'),
                onClick: () => {
                  setMenu(null);
                  props.openSession(row.id);
                },
              },
              h('span', { className: 'sf-resultTitle' }, summary.displayTitle === '' ? t('session.untitled') : summary.displayTitle),
              secondary === '' ? null : h('span', { className: 'sf-snippet' }, secondary));
            })),
          searchResults.hasMore === true
            ? h('div', { className: 'sf-searchState', key: 'more' }, t('search.more'))
            : null,
        ];
      };

      return h('div', { className: 'sf-root' },
        h('div', { className: 'sf-header' },
          h('span', { className: 'sf-headerTitle' }, t('header.title')),
          h('button', {
            type: 'button',
            className: 'sf-iconButton',
            title: t('header.newSession'),
            'aria-label': t('header.newSession'),
            onClick: () => { props.startSession(); },
          }, h(IconPlus)),
          h('button', {
            type: 'button',
            className: 'sf-iconButton',
            title: t('header.options'),
            'aria-label': t('header.options'),
            onClick: openHeaderMenu,
          }, h(IconSliders))),
        h('div', { className: 'sf-search' },
          h('span', { className: 'sf-searchIcon' }, h(IconSearch)),
          h('input', {
            type: 'text',
            className: 'sf-searchInput',
            value: query,
            placeholder: t('search.placeholder'),
            'aria-label': t('search.placeholder'),
            spellCheck: false,
            onChange: (event) => { setQuery(event.target.value); },
            onKeyDown: (event) => {
              event.stopPropagation();
              if (event.key === 'Escape') setQuery('');
            },
            onKeyUp: (event) => { event.stopPropagation(); },
          }),
          query !== '' && h('button', {
            type: 'button',
            className: 'sf-iconButton',
            title: t('search.clear'),
            'aria-label': t('search.clear'),
            onClick: () => { setQuery(''); },
          }, h(IconClose))),
        h('div', { className: 'sf-scroll' },
          searching && searchBody(),
          searching === false && groups.map((group) => {
            const collapsed = data.collapsed[group.key] === true;
            return h('section', { key: 'group:' + group.key, className: 'sf-group' },
              h('div', {
                className: cx('sf-groupHeader', dropTarget === 'group:' + group.key && 'sf-dropTarget'),
                role: 'button',
                tabIndex: 0,
                'aria-expanded': collapsed ? 'false' : 'true',
                'aria-label': groupTitle(group, t),
                onKeyDown: keyHandler(() => toggleGroup(group.key)),
                onClick: () => toggleGroup(group.key),
                onDragOver: (event) => {
                  if (dragging === null) return;
                  event.preventDefault();
                  try { event.dataTransfer.dropEffect = 'move'; } catch (reason) { /* ignore */ }
                  if (dropTarget !== 'group:' + group.key) setDropTarget('group:' + group.key);
                },
                onDragLeave: () => {
                  if (dropTarget === 'group:' + group.key) setDropTarget(null);
                },
                onDrop: (event) => {
                  event.preventDefault();
                  let sessionId = dragging;
                  if (sessionId === null) {
                    try { sessionId = event.dataTransfer.getData('text/plain'); } catch (reason) { sessionId = null; }
                  }
                  setDragging(null);
                  setDropTarget(null);
                  if (typeof sessionId === 'string' && sessionId !== '') {
                    updateData((previous) => unassignSession(previous, sessionId));
                  }
                },
              },
              h('span', { className: cx('sf-chevron', collapsed === false && 'sf-open') }, h(IconChevron)),
              h('span', { className: 'sf-groupTitle' }, groupTitle(group, t)),
              h('span', { className: 'sf-rowActions' },
                h('button', {
                  type: 'button',
                  className: 'sf-iconButton',
                  title: t('group.newSession'),
                  'aria-label': t('group.newSession'),
                  onClick: (event) => {
                    event.stopPropagation();
                    props.startSession(group.workspaceId);
                  },
                  onKeyDown: (event) => { event.stopPropagation(); },
                }, h(IconPlus)),
                h('button', {
                  type: 'button',
                  className: 'sf-iconButton',
                  title: t('group.menu'),
                  'aria-label': t('group.menu'),
                  onClick: (event) => {
                    event.stopPropagation();
                    groupMenu(group, event.currentTarget);
                  },
                  onKeyDown: (event) => { event.stopPropagation(); },
                }, h(IconMore)))),
              collapsed === false && h('div', { className: 'sf-groupBody' },
                group.blocks.map((block) => (block.kind === 'folder'
                  ? renderFolder(block, group)
                  : renderSession(block, group, false)))));
          }),
          searching === false && hasAny === false && h('div', { className: 'sf-empty' },
            h(IconFolder),
            h('div', {}, t('empty.none'))),
          searching === false && h('button', { type: 'button', className: 'sf-addWorkspace', onClick: addWorkspace },
            h('span', { style: { display: 'inline-flex' } }, h(IconPlus)),
            h('span', {}, t('header.addWorkspace')))),
        menu !== null && h('div', { ref: menuRef }, h(Menu, { menu, onClose: menuClose, push: pushPage, back: popPage, t })));
    }

    // ---- plugin --------------------------------------------------------

    return {
      inject: ['slots', 'locale', 'sessions', 'uiWorkspace', 'workspaces'],
      apply(ctx) {
        const dataStore = createStore(loadData());
        const dialogStore = createStore(null);

        const updateData = (updater) => {
          const next = updater(dataStore.getSnapshot());
          dataStore.set(next);
          saveData(next);
        };

        ctx.effect(() => {
          const tagId = 'dsh-session-folders/styles';
          let tag = document.querySelector('style[data-plugin-css="' + tagId + '"]');
          if (tag === null) {
            tag = document.createElement('style');
            tag.dataset.plugin = 'dsh-session-folders';
            tag.dataset.pluginCss = tagId;
            tag.textContent = CSS;
            document.head.appendChild(tag);
          }
          return () => {
            if (tag !== null && tag.parentNode !== null) tag.parentNode.removeChild(tag);
          };
        }, 'session-folders: styles');

        ctx.effect(() => ctx.locale.register(NS, { en: LOCALE.en, zh: LOCALE.zh }), 'session-folders: dictionaries');

        const uiWorkspace = () => ctx.uiWorkspace;
        const sessions = () => ctx.sessions;
        const workspaces = () => ctx.workspaces;

        const sharedFace = () => ({
          openSession: (sessionId) => { uiWorkspace().openSession(sessionId); },
          startSession: (workspaceId) => { uiWorkspace().startSession(workspaceId); },
          forkSession: (sessionId) => { uiWorkspace().forkSession(sessionId).catch((reason) => console.warn('[session-folders] fork failed:', reason)); },
          archiveSession: (sessionId, options) => uiWorkspace().archiveSession(sessionId, options),
          unarchiveSession: (sessionId) => uiWorkspace().unarchiveSession(sessionId),
          renameWorkspace: (workspaceId, title) => workspaces().rename(workspaceId, title),
          deleteWorkspace: (workspaceId) => workspaces().delete(workspaceId),
          createWorkspace: (input) => workspaces().create(input),
          pickDirectory: () => uiWorkspace().pickDirectory(),
          searchSessions: (query, signal) => sessions().search(query, signal),
          copySessionId: (sessionId) => {
            const text = String(sessionId);
            if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
              navigator.clipboard.writeText(text).catch((reason) => console.warn('[session-folders] copy failed:', reason));
              return;
            }
            console.warn('[session-folders] clipboard unavailable');
          },
          renameSession: async (sessionId, title) => {
            const result = await sessions().using(sessionId, { source: 'workspaceOperation' }, (reference) => reference.binding.session.rename(title));
            if (result.ok !== true) throw new Error(result.error !== undefined ? result.error.message : 'rename failed');
          },
          updateData,
          requestDialog: (request) => dialogStore.set(request),
          closeDialog: () => dialogStore.set(null),
        });

        ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
          name: 'sidebar.workspaces',
          priority: -1,
          locale: NS,
          inject: () => Object.assign(sharedFace(), {
            hooks: { data: dataStore },
            createFolder: (workspaceKey, name, sessionId) => updateData((previous) => createFolder(previous, workspaceKey, name, sessionId)),
            renameFolder: (workspaceKey, folderId, name) => updateData((previous) => renameFolder(previous, workspaceKey, folderId, name)),
            deleteFolderData: (workspaceKey, folderId) => updateData((previous) => deleteFolder(previous, workspaceKey, folderId)),
          }),
        }, WorkspaceFolders));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'session-folders-dialog',
          order: 600,
          locale: NS,
          inject: () => Object.assign(sharedFace(), {
            hooks: { dialog: dialogStore },
            createFolder: (workspaceKey, name, sessionId) => updateData((previous) => createFolder(previous, workspaceKey, name, sessionId)),
            renameFolder: (workspaceKey, folderId, name) => updateData((previous) => renameFolder(previous, workspaceKey, folderId, name)),
            deleteFolderData: (workspaceKey, folderId) => updateData((previous) => deleteFolder(previous, workspaceKey, folderId)),
          }),
        }, DialogHost));
      },
    };
  },
});
