import { PopperProps, Tooltip } from '@mui/material';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyledSettingTooltipWrapper } from './style';

interface TooltipSettingProps {
  // 强制打开
  forceOpen?: boolean;
  children: React.ReactElement;
  tooltipContent?: React.ReactElement;
  open?: boolean;
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
  ({ children, tooltipContent, ...restProps }, ref) => {
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

    const innerOpen = useMemo(() => {
      if ('open' in restProps) return restProps.open;
      if ('forceOpen' in restProps) return restProps.forceOpen;
      return open;
    }, [open, restProps]);

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
          enterDelay={200}
          leaveDelay={50}
          enterTouchDelay={500}
          disableFocusListener
          title={tooltipContent}
          slotProps={{
            popper: {
              container: wrapperRef.current,
              modifiers: TOOLTIP_MODIFIERS,
              keepMounted: true,
            },
          }}
          open={innerOpen}
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
