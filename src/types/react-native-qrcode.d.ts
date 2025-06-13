declare module 'react-native-qrcode' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    style?: ViewStyle;
  }

  export default class QRCode extends Component<QRCodeProps> {}
} 