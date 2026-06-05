export default function Home() {
  return (
    <div className="flex flex-col gap-4 mt-20">
      <div className="text-xl font-semibold">Privacy Policy</div>

      <div className="font-semibold">Introduction</div>

      <div>
        We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your
        personal information when you use our app.
      </div>

      <div className="font-semibold">What Information We Collect</div>

      <div>We collect the following information from you:</div>

      <ul className="list-disc pl-6">
        <li>
          Device information: We collect information about the device you use to access our app, such as your device
          type, operating system, and unique device identifier.
        </li>
        <li className="hidden">
          Location information: We may collect your location information if you have enabled location services on your
          device.
        </li>
        <li>
          Usage information: We collect information about how you use our app, such as the websites you visit, the pages
          you view, and the search terms you use.
        </li>
        <li>
          Log data: We collect log data from our servers, which includes information such as your IP address, browser
          type, and referring website.
        </li>
        <li>Chat data: Chat messages entered in our AI chat feature are collected and acessible to chatbot admins.</li>
      </ul>

      <div className="font-semibold">How We Use Your Information</div>

      <div>We use the information we collect from you to:</div>

      <ul className="list-disc pl-6">
        <li>
          Provide you with the services you have requested, such as summarizing website information and providing AI
          chat support.
        </li>
        <li>Improve our app and services.</li>
        <li>Personalize your experience with our app.</li>
        <li>Send you marketing and promotional communications.</li>
        <li>Target advertising.</li>
        <li>Comply with our legal obligations.</li>
      </ul>

      <div className="font-semibold">How We Share Your Information</div>

      <div>We may share your information with:</div>

      <div className="font-semibold">
        <ul className="list-disc pl-6">
          <li>
            Our third-party service providers, who help us provide our services, such as hosting our website, providing
            customer support or AI chat service providers.
          </li>
          <li>Advertisers, who help us target our marketing and promotional communications.</li>
          <li>Other third parties, with your consent.</li>
        </ul>
      </div>

      <div className="font-semibold">Your Rights</div>

      <div>You have the following rights with respect to your personal information:</div>

      <ul className="list-disc pl-6">
        <li>The right to access your personal information.</li>
        <li>The right to correct any inaccurate or incomplete personal information.</li>
        <li>The right to delete your personal information.</li>
        <li>The right to object to the processing of your personal information.</li>
        <li>The right to restrict the processing of your personal information.</li>
        <li>The right to portability of your personal information.</li>
        <li>The right to complain to a data protection authority.</li>
        <li>To exercise any of these rights, please contact us at support@sumobubble.com</li>
      </ul>

      <div className="font-semibold">How We Protect Your Information</div>

      <div>
        We take steps to protect your personal information from unauthorized access, use, disclosure, alteration, or
        destruction. These steps include:
      </div>

      <ul className="list-disc pl-6">
        <li>
          Using encryption and other security measures to protect your personal information when it is stored on our
          servers.
        </li>
        <li>
          Requiring our third-party service providers to take appropriate security measures to protect your personal
          information.
        </li>
        <li>Monitoring our systems for potential security breaches.</li>
        <li>Responding promptly to any security incidents.</li>
      </ul>

      <div className="font-semibold">Changes to This Privacy Policy</div>

      <div>
        We may update this Privacy Policy from time to time. Any changes will be effective immediately upon posting the
        revised Privacy Policy on our website. We encourage you to periodically review this Privacy Policy to stay
        informed about how we are protecting your information.
      </div>

      <div className="font-semibold">Contact Us</div>

      <div>If you have any questions about this Privacy Policy, please contact us at support@sumobubble.com</div>
    </div>
  );
}
