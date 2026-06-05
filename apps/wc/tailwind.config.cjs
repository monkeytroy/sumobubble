
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // if we find base font is an issue on many sites.. static?
      fontSize: {
        '2xs': '.70rem'
      },
      //   sm: '14px',
      //   base: '16px',
      //   xl: '20px',
      //   '2xl': '24px',
      //   '3xl': '30px',
      //   '4xl': '36px',
      //   '5xl': '48px',
      //   '6xl': '60px',
      //   '7xl': '72px',
      //   '8xl': '96px',
      //   '9xl': '128px',
      // },
      // spacing: {
      //   '0':   '0px',
      //   '0.5': '2px',
      //   '1':   '4px',
      //   '1.5': '6px',
      //   '2':   '8px',
      //   '2.5': '10px',
      //   '3':   '12px',
      //   '3.5': '14px',
      //   '4':   '16px',
      //   '5':   '20px',
      //   '6':   '24px',
      //   '7':   '28px',
      //   '8':   '32px',
      //   '9':   '36px',
      //   '10':  '40px',
      //   '11':  '44px',
      //   '12':  '48px',
      //   '14':  '56px',
      //   '16':  '64px',
      //   '20':  '80px',
      //   '24':  '96px',
      //   '28':  '112px',
      //   '32':  '128px',
      //   '36':  '144px',
      //   '40':  '160px',
      //   '44':  '176px',
      //   '48':  '192px',
      //   '52':  '208px',
      //   '56':  '224px',
      //   '60':  '240px',
      //   '64':  '256px',
      //   '72':  '288px',
      //   '80':  '320px',
      //   '96':  '384px',
      // },
      zIndex: {
        '100': '100',
        '999': '999'
      },
      transitionDelay: {
        '2000': '2000ms',
        '4000': '4000ms',
        '6000': '6000ms',
        '8000': '8000ms',
      },
      textColor: {
        skin: {
          primary: withOpacity("--color-primary"),
          darker: withOpacity("--primary"),
          a11y: withOpacity("--color-a11y"),
        },
      },
      backgroundColor: {
        skin: {
          primary: withOpacity("--color-primary"),
          a11y: withOpacity("--color-a11y"),
        },
      },
      ringColor: {
        skin: {
          primary: withOpacity("--color-primary"),
        },
      },
      borderColor: {
        skin: {
          primary: withOpacity("--color-primary"),
          a11y: withOpacity("--color-a11y"),
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'),]
}
