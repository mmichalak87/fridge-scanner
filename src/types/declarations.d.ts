declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export default class Ionicons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module 'react-native-linear-gradient' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }

  export default class LinearGradient extends Component<LinearGradientProps> {}
}

declare module 'react-native-image-resizer' {
  interface Response {
    path: string;
    uri: string;
    size: number;
    name: string;
    width: number;
    height: number;
  }

  interface Options {
    mode?: 'contain' | 'cover' | 'stretch';
    onlyScaleDown?: boolean;
  }

  export default class ImageResizer {
    static createResizedImage(
      uri: string,
      width: number,
      height: number,
      format: string,
      quality: number,
      rotation?: number,
      outputPath?: string,
      keepMeta?: boolean,
      options?: Options
    ): Promise<Response>;
  }
}

declare module 'react-native-config' {
  interface Config {
    GEMINI_API_KEY?: string;
    [key: string]: string | undefined;
  }

  const Config: Config;
  export default Config;
}

declare module 'react-native-fs' {
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, contents: string, encoding?: string): Promise<void>;
  export function exists(path: string): Promise<boolean>;
  export function unlink(path: string): Promise<void>;
  export const DocumentDirectoryPath: string;
  export const CachesDirectoryPath: string;
  export const TemporaryDirectoryPath: string;
}
