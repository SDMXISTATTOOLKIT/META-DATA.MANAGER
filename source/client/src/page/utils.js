import {userMenu} from "../constants/menus";
import {PATH_META_MANAGER} from "../constants/paths";

export const isClassificationsServer = (username, permissions, anonymousPages, t) => {
  const metaManagerNode = userMenu(t).find(({path}) => path === PATH_META_MANAGER);

  return username !== null
    ? !permissions || !permissions.functionality || permissions.functionality.length !== 1
      ? false
      : metaManagerNode.children.map(({path}) => path.substr(path.lastIndexOf("/") + 1)).includes(permissions.functionality[0])
    : !anonymousPages || anonymousPages.length !== 1
      ? false
      : metaManagerNode.children.map(({path}) => path).includes(anonymousPages[0]);
};

export const isPageVisible = (permissions, anonymousPages) => ({children, path, isDivider}) =>
  isDivider || children || (
    permissions !== null
      ? (
        permissions.functionality
          ? permissions.functionality.filter(page =>
          page === path.substr(path.lastIndexOf("/") + 1)
          ).length
          : false
      )
      : (children || anonymousPages.filter(page => page === path).length)
  );