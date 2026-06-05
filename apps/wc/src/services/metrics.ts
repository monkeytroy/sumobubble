import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN_DEV = '56f9c327153be0d5ab8286258b081f4e';
const MIXPANEL_TOKEN = '965372adb258a92047dbf38f2ad6871e';

let ready = false;

export const metricsInit = async (customerId: string, isDev: boolean | null) => {
  if (isDev) {
    await mixpanel.init(MIXPANEL_TOKEN_DEV, {debug: true}); 
  } else {
    await mixpanel.init(MIXPANEL_TOKEN, {debug: false}); 
  }
  
  mixpanel.identify(customerId);
  ready = true;
}

export const track = (eventName: string, data?: any) => {
  if (ready) {
    mixpanel.track(eventName, data);
  } else {
    console.log('Track before ready');
  }
}