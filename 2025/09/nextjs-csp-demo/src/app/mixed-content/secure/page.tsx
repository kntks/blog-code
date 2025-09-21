'use client';

import DemoLayout from '@/components/DemoLayout';
import { HTTPResourceTester, CSPProtectionInfo, CSPAdditionalInfo } from '../components';

export default function SecureMixedContentPage() {
  return (
    <DemoLayout
      title="HTTPS混在コンテンツ（Mixed Content）- CSP有効版"
      description="このページではCSPのupgrade-insecure-requestsが設定されているため、HTTPリソースが自動的にHTTPSにアップグレードされ、混在コンテンツの問題が解決されます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <CSPProtectionInfo isSecure={true} />
        <HTTPResourceTester isSecure={true} />
        <CSPAdditionalInfo isSecure={true} />
      </div>
    </DemoLayout>
  );
}
