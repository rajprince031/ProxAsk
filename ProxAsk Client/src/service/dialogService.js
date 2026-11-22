import Swal from 'sweetalert2';

/**
 * GitHub Light styled SweetAlert2 dialog service
 * Fully aligned with github.com-design tokens:
 * Primary: #0D6731, Danger: #D1242F, Radii: 6px buttons / 8px modal
 */

const baseSwalConfig = {
  allowOutsideClick: true,
  allowEscapeKey: true,
  showCloseButton: true,
  showDenyButton: false,
  customClass: {
    popup: 'px-swal-popup',
    title: 'px-swal-title',
    htmlContainer: 'px-swal-content',
    confirmButton: 'px-swal-btn px-swal-btn--confirm',
    cancelButton: 'px-swal-btn px-swal-btn--cancel',
    closeButton: 'px-swal-close-btn',
  },
  buttonsStyling: false,
};

export const dialogService = {
  /**
   * Confirmation for deleting a question.
   * Strictly 2 actions: Delete & Cancel.
   */
  async confirmDeleteQuestion() {
    const result = await Swal.fire({
      ...baseSwalConfig,
      title: 'Delete Question?',
      text: 'Are you sure you want to delete this question? This action cannot be undone.',
      icon: 'warning',
      iconColor: '#D1242F',
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: 'Delete Question',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: 'px-swal-btn px-swal-btn--danger',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });
    return Boolean(result.isConfirmed);
  },

  /**
   * Confirmation for deleting an answer.
   * Strictly 2 actions: Delete & Cancel.
   */
  async confirmDeleteAnswer() {
    const result = await Swal.fire({
      ...baseSwalConfig,
      title: 'Delete Answer?',
      text: 'Are you sure you want to delete this answer? This action cannot be undone.',
      icon: 'warning',
      iconColor: '#D1242F',
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: 'Delete Answer',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: 'px-swal-btn px-swal-btn--danger',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });
    return Boolean(result.isConfirmed);
  },

  /**
   * Modal shown when an unauthenticated visitor tries to like an answer
   */
  async showUnauthenticatedLikeModal(navigate) {
    const result = await Swal.fire({
      ...baseSwalConfig,
      title: 'Join the conversation',
      text: 'Create an account or log in to like this answer.',
      icon: 'info',
      iconColor: '#0D6731',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Sign Up',
      denyButtonText: 'Log In',
      cancelButtonText: 'Cancel',
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: 'px-swal-btn px-swal-btn--confirm',
        denyButton: 'px-swal-btn px-swal-btn--secondary px-swal-btn--show-deny',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });

    if (result.isConfirmed) {
      if (navigate) navigate('/signup');
      return 'signup';
    } else if (result.isDenied) {
      if (navigate) navigate('/login');
      return 'login';
    }
    return 'cancel';
  },

  /**
   * Modal shown when an unauthenticated guest tries to uncheck "Send Anonymously"
   * Actions: Log In, Sign Up, Cancel (Cancel preserves anonymous mode)
   */
  async showUnauthenticatedAskPubliclyModal(navigate) {
    const result = await Swal.fire({
      ...baseSwalConfig,
      title: 'Login required',
      text: 'You must be logged in to ask a question publicly as yourself. Would you like to log in or sign up?',
      icon: 'info',
      iconColor: '#0D6731',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Log In',
      denyButtonText: 'Sign Up',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: 'px-swal-btn px-swal-btn--confirm',
        denyButton: 'px-swal-btn px-swal-btn--secondary px-swal-btn--show-deny',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });

    if (result.isConfirmed) {
      if (navigate) navigate('/login');
      return 'login';
    } else if (result.isDenied) {
      if (navigate) navigate('/signup');
      return 'signup';
    }
    return 'cancel';
  },

  /**
   * Confirmation for switching profile from private to public with pending follow requests
   */
  async confirmMakeProfilePublic(pendingCount) {
    const countText = pendingCount === 1 ? '1 pending follow request' : `${pendingCount} pending follow requests`;
    const result = await Swal.fire({
      ...baseSwalConfig,
      title: 'Make your profile public?',
      text: `All ${countText} will automatically be accepted, and anyone will be able to see your questions and answers.`,
      icon: 'question',
      iconColor: '#0D6731',
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: 'Make Public & Accept All',
      cancelButtonText: 'Cancel',
      focusCancel: false,
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: 'px-swal-btn px-swal-btn--confirm',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });
    return Boolean(result.isConfirmed);
  },

  /**
   * Generic confirmation dialog.
   * Strictly 2 actions: Confirm & Cancel.
   */
  async confirmAction({
    title = 'Are you sure?',
    text = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
  } = {}) {
    const result = await Swal.fire({
      ...baseSwalConfig,
      title,
      text,
      icon: isDestructive ? 'warning' : 'question',
      iconColor: isDestructive ? '#D1242F' : '#0D6731',
      showCancelButton: true,
      showDenyButton: false,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      focusCancel: isDestructive,
      customClass: {
        ...baseSwalConfig.customClass,
        confirmButton: isDestructive
          ? 'px-swal-btn px-swal-btn--danger'
          : 'px-swal-btn px-swal-btn--confirm',
        cancelButton: 'px-swal-btn px-swal-btn--cancel',
      },
    });
    return Boolean(result.isConfirmed);
  },

  /**
   * Success notification modal
   */
  async showSuccessDialog(title, text) {
    return Swal.fire({
      ...baseSwalConfig,
      title,
      text,
      icon: 'success',
      iconColor: '#08872B',
      confirmButtonText: 'OK',
    });
  },

  /**
   * Error notification modal
   */
  async showErrorDialog(title, text) {
    return Swal.fire({
      ...baseSwalConfig,
      title,
      text,
      icon: 'error',
      iconColor: '#D1242F',
      confirmButtonText: 'Dismiss',
    });
  },
};

export default dialogService;
