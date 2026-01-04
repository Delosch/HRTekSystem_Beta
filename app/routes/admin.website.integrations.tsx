// app/routes/admin.website.integrations.tsx
import { useState } from "react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EnvelopeIcon,
  ShareIcon,
  BarsArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function IntegrationsPage() {
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("UA-XXXXX-Y / G-XXXXXXXXX");
  const [facebookPixelId, setFacebookPixelId] = useState("XXXXXXXXXXXXXXX");
  const [hubspotFormEmbed, setHubspotFormEmbed] = useState(
    `<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/v2.js"></script>\n<script>\n  hbspt.forms.create({\n    region: "na1",\n    portalId: "YOUR_PORTAL_ID",\n    formId: "YOUR_FORM_ID"\n  });\n</script>`
  );
  const [intercomEmbed, setIntercomEmbed] = useState(
    `<script>window.intercomSettings = { app_id: "YOUR_APP_ID" };</script>\n<script>(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_event');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/YOUR_APP_ID';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();</script>`
  );

  const [mailchimpEmbed, setMailchimpEmbed] = useState(
    `\n<div id="mc_embed_signup">\n<form action="YOUR_MAILCHIMP_FORM_ACTION" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>\n    <div id="mc_embed_signup_scroll">\n\t<h2>Subscribe to our newsletter</h2>\n<div class="mc-field-group">\n\t<label for="mce-EMAIL">Email Address  <span class="asterisk">*</span>\n</label>\n\t<input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL">\n</div>\n\t<div id="mce-responses" class="clear foot">\n\t\t<div class="response" id="mce-error-response" style="display:none"></div>\n\t\t<div class="response" id="mce-success-response" style="display:none"></div>\n\t</div>    \n    <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_YOUR_LIST_ID_YOUR_FORM_ID" tabindex="-1" value=""></div>\n        <div class="optionalParent">\n            <div class="clear foot">\n                <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button">\n            </div>\n        </div>\n    </div>\n</form>\n</div>\n`
  );

  const handleSave = (integrationName: string) => {
    alert(`Integration settings for ${integrationName} saved! (Action: Update backend config)`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Integrations</h2>

      {/* Google Analytics */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-500" /> Google Analytics
        </h3>
        <div>
          <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 mb-1">Tracking ID (UA-XXXXX-Y or G-XXXXXXXXX)</label>
          <input
            type="text"
            id="googleAnalyticsId"
            value={googleAnalyticsId}
            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="G-XXXXXXXXX"
          />
        </div>
        <button
          onClick={() => handleSave("Google Analytics")}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
        >
          Save GA Settings
        </button>
      </section>

      {/* Facebook Pixel */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <ShareIcon className="h-6 w-6 mr-2 text-indigo-500" /> Facebook Pixel
        </h3>
        <div>
          <label htmlFor="facebookPixelId" className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
          <input
            type="text"
            id="facebookPixelId"
            value={facebookPixelId}
            onChange={(e) => setFacebookPixelId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="123456789012345"
          />
        </div>
        <button
          onClick={() => handleSave("Facebook Pixel")}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
        >
          Save Facebook Pixel
        </button>
      </section>

      {/* CRM/Webhooks (HubSpot Forms Example) */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <BarsArrowDownIcon className="h-6 w-6 mr-2 text-indigo-500" /> CRM / Webhooks (e.g., HubSpot Forms)
        </h3>
        <div>
          <label htmlFor="hubspotFormEmbed" className="block text-sm font-medium text-gray-700 mb-1">HubSpot Form Embed Code</label>
          <textarea
            id="hubspotFormEmbed"
            value={hubspotFormEmbed}
            onChange={(e) => setHubspotFormEmbed(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your HubSpot form embed code here."
          />
          <p className="mt-2 text-sm text-gray-500">
            For advanced use, consider dynamic form rendering or webhook configurations.
          </p>
        </div>
        <button
          onClick={() => handleSave("HubSpot Forms")}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
        >
          Save HubSpot Settings
        </button>
      </section>

      {/* Newsletter Embed (Mailchimp Example) */}
      <section className="mb-8 border-b border-gray-200 pb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <EnvelopeIcon className="h-6 w-6 mr-2 text-indigo-500" /> Newsletter Embed (e.g., Mailchimp)
        </h3>
        <div>
          <label htmlFor="mailchimpEmbed" className="block text-sm font-medium text-gray-700 mb-1">Mailchimp Form Embed Code</label>
          <textarea
            id="mailchimpEmbed"
            value={mailchimpEmbed}
            onChange={(e) => setMailchimpEmbed(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your Mailchimp signup form embed code here."
          />
        </div>
        <button
          onClick={() => handleSave("Newsletter Embed")}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
        >
          Save Newsletter Embed
        </button>
      </section>

      {/* Live Chat (Intercom Example) */}
      <section className="mb-8">
        <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
          <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 mr-2 text-indigo-500" /> Live Chat (e.g., Intercom)
        </h3>
        <div>
          <label htmlFor="intercomEmbed" className="block text-sm font-medium text-gray-700 mb-1">Intercom Embed Code</label>
          <textarea
            id="intercomEmbed"
            value={intercomEmbed}
            onChange={(e) => setIntercomEmbed(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your Intercom messenger embed code here."
          />
        </div>
        <button
          onClick={() => handleSave("Live Chat")}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
        >
          Save Live Chat Embed
        </button>
      </section>
    </div>
  );
}
