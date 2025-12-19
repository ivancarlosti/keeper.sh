import { Button } from "@base-ui-components/react/button";
import {
  button,
  integrationCard,
  integrationIcon,
  integrationInfo,
  integrationName,
  integrationDescription,
} from "@/styles";

const integrations = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync events from your Google Calendar",
    provider: "google" as const,
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Sync events from your Outlook calendar",
    provider: "outlook" as const,
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path
        fill="white"
        d="M24 7.387v10.478c0 .23-.08.424-.238.576-.16.154-.352.233-.576.233h-8.388v-6.09l1.452 1.03c.064.038.14.063.227.063.096 0 .18-.025.246-.076L24 8.78V7.387zm0-1.9c.006.116-.027.236-.1.36L15.596 11.68a.766.766 0 01-.183.076.57.57 0 01-.208.038.51.51 0 01-.195-.038.651.651 0 01-.17-.076L7.226 6.387h-.028L7.21 18.21c0 .082.03.154.09.213a.29.29 0 00.214.09h16.27c.224 0 .412-.08.563-.24.152-.156.23-.352.23-.587V5.578c0-.053-.012-.082-.037-.082-.028 0-.062.012-.1.037l-.253.178-.253.178-.25.178-.248.166-.26.178-.262.178-.272.178-.295.19-.316.207-.33.215-.316.215-.288.19-.262.166-.25.166-.25.166-.262.166zM1.19 8.04c.257-.328.586-.584.99-.768.4-.183.83-.273 1.29-.273.458 0 .888.09 1.29.273.4.184.73.44.988.768.26.328.387.703.387 1.12 0 .42-.127.793-.387 1.12-.257.327-.587.585-.987.77-.402.185-.832.278-1.29.278-.46 0-.89-.093-1.29-.278-.404-.185-.733-.443-.99-.77-.257-.327-.387-.7-.387-1.12 0-.417.13-.792.387-1.12zM0 18.143V5.57c0-.23.08-.424.238-.577.16-.153.352-.232.576-.232H8.28c.224 0 .412.08.563.232.152.153.227.347.227.577v12.572c0 .23-.075.424-.227.577-.15.153-.34.232-.563.232H.814c-.224 0-.416-.08-.576-.232A.786.786 0 010 18.143zm2.056-7.88v2.96c0 .124.04.223.12.296.078.073.18.11.307.11h1.488c.127 0 .23-.037.308-.11.08-.073.12-.172.12-.297v-2.96c0-.124-.04-.222-.12-.296-.08-.072-.18-.11-.308-.11H2.483c-.127 0-.23.038-.307.11-.08.074-.12.172-.12.297z"
      />
    </svg>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="flex-1">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Integrations</h1>
      <div className="flex flex-col gap-3">
        {integrations.map((integration) => (
          <div key={integration.id} className={integrationCard()}>
            <div className={integrationIcon({ provider: integration.provider })}>
              {integration.provider === "google" ? <GoogleIcon /> : <OutlookIcon />}
            </div>
            <div className={integrationInfo()}>
              <div className={integrationName()}>{integration.name}</div>
              <div className={integrationDescription()}>{integration.description}</div>
            </div>
            <Button className={button({ variant: "secondary" })}>Connect</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
