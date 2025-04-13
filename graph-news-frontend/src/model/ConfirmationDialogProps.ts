interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    type?: 'danger' | 'warning' | 'info';
    darkMode: boolean;
  }
  
  export default ConfirmationDialogProps;