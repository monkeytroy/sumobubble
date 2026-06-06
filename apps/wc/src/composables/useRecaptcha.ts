import { onMounted } from 'vue';
import { CAPTCHA_SITE_KEY } from '@/config';

// reCAPTCHA v3 script is a singleton on the page. We inject it once
// (idempotent via the id check) and call grecaptcha.execute when a
// form is submitted.

const SCRIPT_ID = 'recaptchaV3';

const injectRecaptchaScript = () => {
  if (document.querySelector(`#${SCRIPT_ID}`)) return;
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?render=' + CAPTCHA_SITE_KEY;
  script.id = SCRIPT_ID;
  document.head.appendChild(script);
};

export const useRecaptcha = () => {
  onMounted(injectRecaptchaScript);

  const executeRecaptcha = (action: string): Promise<string> =>
    window.grecaptcha.execute(CAPTCHA_SITE_KEY, { action });

  return { executeRecaptcha };
};
