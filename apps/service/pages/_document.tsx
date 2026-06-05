import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head></Head>
      <body>
        <Main />
        <NextScript />
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      </body>
    </Html>
  );
}
