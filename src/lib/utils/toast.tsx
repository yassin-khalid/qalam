import { toast } from 'react-hot-toast';
import { ShowToastProps } from '../types/toast';
import ElegantToast from '../components/ElegantToast';

/**
 * Shows an elegant toast notification with customizable type, message, and title
 * @param {ShowToastProps} props - The props for the toast: type, message, title, duration, position
 */
export const showToast = (
  props: ShowToastProps
) => {
  const { type, message, title, duration = 5000, position = 'bottom-right' } = props;
  toast.custom(
    (t) => (
      <ElegantToast
        t={t}
        type={type}
        message={message}
        title={title}
        duration={duration}
      />
    ),
    {
      duration,
      position,
    }
  );
};
