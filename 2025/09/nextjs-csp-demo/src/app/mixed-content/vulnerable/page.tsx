'use client';

import DemoLayout from '@/components/DemoLayout';
import { HTTPResourceTester, CSPProtectionInfo, CSPAdditionalInfo } from '../components';

export default function VulnerableMixedContentPage() {
  return (
    <DemoLayout
      title="HTTPS混在コンテンツ（Mixed Content）- CSP無効版"
      description="このページではCSPが設定されていないため、HTTPSサイト内でHTTPリソースが読み込まれ、セキュリティが低下する可能性があります。"
      isSecure={false}
    >
      <div className="space-y-6">
        <CSPProtectionInfo isSecure={false} />
        <HTTPResourceTester isSecure={false} />
        <CSPAdditionalInfo isSecure={false} />
      </div>
    </DemoLayout>
  );
}
