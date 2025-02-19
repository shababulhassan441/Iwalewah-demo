declare module 'card-info' {
    interface CardInfoOptions {
      banksLogosPath?: string;
      brandsLogosPath?: string;
      brandLogoPolicy?: string;
      preferredExt?: string;
    }
  
    interface CardInfo {
      bankName?: string;
      bankLogo?: string;
      bankLogoSvg?: string;
      bankLogoPng?: string;
      brandName?: string;
      brandLogo?: string;
      brandLogoSvg?: string;
      brandLogoPng?: string;
      backgroundColor?: string;
      textColor?: string;
      codeName?: string;
      codeLength?: number;
      numberMask?: string;
      numberNice?: string;
    }
  
    const CardInfo: new (cardNumber: string, options?: CardInfoOptions) => CardInfo;
    export default CardInfo;
  }
  