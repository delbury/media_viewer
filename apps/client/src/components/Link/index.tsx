import { Link as RouterLink } from '@/i18n/routing';
import { LinkProps, Link as UiLink } from '@mui/material';

const Link = (props: LinkProps) => {
  return (
    <UiLink
      component="div"
      {...props}
      href={null}
      sx={{
        ':hover *': {
          color: 'primary.main',
        },
      }}
    >
      <RouterLink
        style={{ display: 'contents' }}
        href={props.href ?? ''}
      >
        {props.children}
      </RouterLink>
    </UiLink>
  );
};

export default Link;
