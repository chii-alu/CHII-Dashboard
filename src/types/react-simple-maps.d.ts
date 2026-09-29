declare module "react-simple-maps" {
  import { ReactNode, FC, SVGProps } from "react";

  interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string;
    children: (geographies: Geography[], projection: any) => ReactNode;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography?: any;
    children?: ReactNode;
  }

  interface ZoomableGroupProps extends SVGProps<SVGGElement> {
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
  }

  interface Geography {
    rsmKey: string;
    properties: Record<string, any>;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
  export const ZoomableGroup: FC<ZoomableGroupProps>;
}
