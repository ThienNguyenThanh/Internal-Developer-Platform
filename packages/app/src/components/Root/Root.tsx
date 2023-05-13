import React, { PropsWithChildren } from 'react';
import { Link, makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import MapIcon from '@material-ui/icons/MyLocation';
import LayersIcon from '@material-ui/icons/Layers';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import { NavLink } from 'react-router-dom';
import { GraphiQLIcon } from '@backstage/plugin-graphiql';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  SidebarPage,
  sidebarConfig,
  SidebarItem,
  SidebarDivider,
  SidebarSpace,
  SidebarGroup,
  useSidebarOpenState,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { ApertureLogoFull } from './ApertureLogoFull';
import { ApertureLogoIcon } from './ApertureLogoIcon';
import HistoryIcon from '@material-ui/icons/History';
import { BackstageTheme } from '@backstage/theme';
import CategoryIcon from '@material-ui/icons/Category';
import BugReport from '@material-ui/icons/BugReport';
import EmojiNature from '@material-ui/icons/EmojiNature';
import { cardList } from '../home/ApproveProcess';
import '../home/App.css'

const useSidebarLogoStyles = makeStyles<BackstageTheme, { themeId: string }>({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: props => ({
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: props.themeId === 'aperture' ? 15 : 24,
  }),
});

const SidebarLogo = () => {
  const { isOpen } = useSidebarOpenState();

  const appThemeApi = useApi(appThemeApiRef);
  const themeId = appThemeApi.getActiveThemeId();
  const classes = useSidebarLogoStyles({ themeId: themeId! });

  const fullLogo = themeId === 'aperture' ? <ApertureLogoFull /> : <LogoFull />;
  const iconLogo = themeId === 'aperture' ? <ApertureLogoIcon /> : <LogoIcon />;

  return (
    <div className={classes.root}>
      <Link
        component={NavLink}
        to="/"
        underline="none"
        className={classes.link}
      >
        {isOpen ? fullLogo : iconLogo}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        <SidebarItem icon={HomeIcon} to="/" text="Home" />
        <SidebarItem icon={CategoryIcon} to="catalog" text="Catalog" />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={LayersIcon} to="explore" text="Explore" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
        <SidebarItem icon={CategoryIcon} to="secret-manager" text="Secret Manager" />
        {cardList.length ==0 && <SidebarItem icon={BugReport} to="approve-process" text="Approve process"/>}
        {cardList.length > 0 && <SidebarItem icon={EmojiNature} to="approve-process" text="Approve process"/>}
        <SidebarItem icon={HistoryIcon} to="event-logs" text="Event logs" />
        
      </SidebarGroup>
      <SidebarDivider />
      <SidebarItem icon={MapIcon} to="tech-radar" text="Tech Radar" />
      <SidebarItem icon={MoneyIcon} to="cost-insights" text="Cost Insights" />
      
      <SidebarItem icon={GraphiQLIcon} to="graphiql" text="GraphiQL" />
      <SidebarSpace />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarItem icon={NotificationsIcon} to="announcements" text="Announcements" />
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
