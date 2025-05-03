import { StyledFloatAlertInfo } from '../style';

interface AlertInfoProps {
  message?: string;
}

const AlertInfo = ({ message }: AlertInfoProps) => {
  return !!message && <StyledFloatAlertInfo>{message}</StyledFloatAlertInfo>;
};

export default AlertInfo;
