import {
  AppDetailsUrlQueryParams,
  getAppDeepPathFromDashboardUrl,
  resolveAppIframeUrl,
} from "@saleor/apps/urls";
import useLocale from "@saleor/hooks/useLocale";
import useShop from "@saleor/hooks/useShop";
import { useTheme } from "@saleor/macaw-ui";
import clsx from "clsx";
import React, { useEffect } from "react";
import { useLocation } from "react-router";

import { useStyles } from "./styles";
import { useAppActions } from "./useAppActions";
import useTokenRefresh from "./useTokenRefresh";

interface Props {
  src: string;
  appToken: string;
  appId: string;
  className?: string;
  params?: AppDetailsUrlQueryParams;
  refetch?: () => void;
  onLoad?(): void;
  onError?(): void;
}

const getOrigin = (url: string) => new URL(url).origin;

/**
 * Hide app initially and wait till app informs Dashboard thats its ready to be shown
 *
 * TODO - what about older apps? They will never appear. Add timeout? Or add field to manifest?
 */
const iframeStyle = {
  height: 0,
};

export const AppFrame: React.FC<Props> = ({
  src,
  appToken,
  appId,
  className,
  params = {},
  onLoad,
  onError,
  refetch,
}) => {
  const shop = useShop();
  const frameRef = React.useRef<HTMLIFrameElement>();
  const { themeType } = useTheme();
  const classes = useStyles();
  const appOrigin = getOrigin(src);
  const { postToExtension } = useAppActions(frameRef, appOrigin, appId);
  const location = useLocation();
  const { locale } = useLocale();

  useEffect(() => {
    postToExtension({
      type: "localeChanged",
      payload: {
        locale,
      },
    });
  }, [locale, postToExtension]);

  useEffect(() => {
    postToExtension({
      type: "theme",
      payload: {
        theme: themeType,
      },
    });
  }, [themeType, postToExtension]);

  useEffect(() => {
    postToExtension({
      type: "redirect",
      payload: {
        path: getAppDeepPathFromDashboardUrl(location.pathname, appId),
      },
    });
  }, [location.pathname]);

  useTokenRefresh(appToken, refetch);

  const handleLoad = () => {
    postToExtension({
      type: "handshake",
      payload: {
        token: appToken,
        version: 1,
      },
    });
    postToExtension({
      type: "theme",
      payload: {
        theme: themeType,
      },
    });

    if (onLoad) {
      onLoad();
    }
  };

  if (!shop?.domain.host) {
    return null;
  }

  return (
    <iframe
      style={iframeStyle}
      ref={frameRef}
      src={resolveAppIframeUrl(appId, src, params)}
      onError={onError}
      onLoad={handleLoad}
      className={clsx(classes.iframe, className)}
      sandbox="allow-same-origin allow-forms allow-scripts"
    />
  );
};
