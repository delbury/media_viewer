import { PopperProps, Tooltip } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyledSettingTooltipWrapper } from './style';

interface TooltipSettingProps {
  children: React.ReactElement;
  tooltipContent?: React.ReactElement;
}

export interface TooltipSettingInstance {
  lock: () => void;
  close: () => void;
  open: () => void;
}

// modifiers
const TOOLTIP_MODIFIERS: PopperProps['modifiers'] = [
  {
    // 防止溢出屏幕
    name: 'preventOverflow',
    options: {
      // 设置与屏幕边缘的最小间距（单位：px）
      padding: 12,
      // 以视口为边界
      boundariesElement: 'viewport',
    },
  },
];

const TooltipSetting = forwardRef<TooltipSettingInstance, TooltipSettingProps>(
  ({ children, tooltipContent }, ref) => {
    const wrapperRef = useRef<HTMLElement>(null);
    // tooltip 是否打开
    const [open, setOpen] = useState(false);
    // 锁定tooltip 打开的状态
    const lockOpen = useRef(false);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => {
      if (!lockOpen.current) setOpen(false);
    }, [lockOpen]);

    // 锁定 tooltip
    const lock = useCallback(() => {
      lockOpen.current = true;
    }, []);

    useEffect(() => {
      const controller = new AbortController();
      document.addEventListener(
        'pointerup',
        () => {
          if (lockOpen.current) setOpen(false);
          lockOpen.current = false;
        },
        { signal: controller.signal }
      );
      return () => {
        controller.abort();
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        lock,
        close: handleClose,
        open: handleOpen,
      }),
      [handleClose, handleOpen, lock]
    );

    return (
      <StyledSettingTooltipWrapper ref={wrapperRef}>
        <Tooltip
          placement="top"
          leaveDelay={200}
          enterTouchDelay={500}
          disableFocusListener
          title={tooltipContent}
          slotProps={{
            popper: {
              container: wrapperRef.current,
              modifiers: TOOLTIP_MODIFIERS,
            },
          }}
          open={open}
          onOpen={handleOpen}
          onClose={handleClose}
        >
          {children}
        </Tooltip>
      </StyledSettingTooltipWrapper>
    );
  }
);

TooltipSetting.displayName = 'TooltipSetting';

export default TooltipSetting;
