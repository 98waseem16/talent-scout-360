
import { Banner, BannerClose, BannerIcon, BannerTitle, BannerAction } from "@/components/ui/banner";
import { CircleAlert } from 'lucide-react';

const BannerDemo = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full" style={{
        '--primary': '0 72.2% 50.6%',
        '--primary-foreground': '0 85.7% 97.3%',
      } as React.CSSProperties}>
        <Banner inset>
          <BannerIcon icon={CircleAlert} />
          <BannerTitle>Something's gone <strong>horribly</strong> wrong.</BannerTitle>
          <BannerAction>Restart</BannerAction>
          <BannerClose />
        </Banner>
      </div>
      <div className="w-full" style={{
        '--primary': '24.6 95% 53.1%',
        '--primary-foreground': '60 9.1% 97.8%',
      } as React.CSSProperties}>
        <Banner inset>
          <BannerIcon icon={CircleAlert} />
          <BannerTitle>You're almost out of disk space.</BannerTitle>
          <BannerAction>Upgrade</BannerAction>
          <BannerClose />
        </Banner>
      </div>
      <div className="w-full" style={{
        '--primary': '142.1 76.2% 36.3%',
        '--primary-foreground': '355.7 100% 97.3%',
      } as React.CSSProperties}>
        <Banner inset>
          <BannerIcon icon={CircleAlert} />
          <BannerTitle>You've been selected for a secret mission.</BannerTitle>
          <BannerAction>Accept</BannerAction>
          <BannerClose />
        </Banner>
      </div>
    </div>
  );
};

export default BannerDemo;
