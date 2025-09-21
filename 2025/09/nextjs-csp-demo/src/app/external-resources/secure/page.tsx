'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import ResourceInputSection from '../components/ResourceInputSection';
import ExternalResourceExamples from '../components/ExternalResourceExamples';
import ResourceLoadLog from '../components/ResourceLoadLog';
import SecurityInfo from '../components/SecurityInfo';

export default function SecureExternalResourcesPage() {
  const [scriptUrl, setScriptUrl] = useState('https://malicious-site.example.com/evil.js');
  const [imageUrl, setImageUrl] = useState('http://tracking.ads.example.com/pixel.gif');
  const [loadedResources, setLoadedResources] = useState<string[]>([]);

  const loadExternalScript = () => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => {
      setLoadedResources(prev => [...prev, `✅ スクリプト読み込み完了: ${scriptUrl}`]);
    };
    script.onerror = () => {
      setLoadedResources(prev => [...prev, `❌ CSPによりブロック: ${scriptUrl}`]);
    };
    document.head.appendChild(script);
  };

  const loadTrackingPixel = () => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setLoadedResources(prev => [...prev, `✅ 画像読み込み完了: ${imageUrl}`]);
    };
    img.onerror = () => {
      setLoadedResources(prev => [...prev, `❌ CSPによりブロック: ${imageUrl}`]);
    };
  };

  return (
    <DemoLayout
      title="不正な外部リソースの読み込み - CSP有効版"
      description="このページではCSPが設定されているため、不正な外部リソースの読み込みがブロックされ、悪意のあるスクリプトや追跡から保護されます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <SecurityInfo isSecure={true} />

        <ResourceInputSection
          scriptUrl={scriptUrl}
          setScriptUrl={setScriptUrl}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          onLoadScript={loadExternalScript}
          onLoadImage={loadTrackingPixel}
          isSecure={true}
        />

        <ExternalResourceExamples isSecure={true} />

        <ResourceLoadLog loadedResources={loadedResources} isSecure={true} />
      </div>
    </DemoLayout>
  );
}
