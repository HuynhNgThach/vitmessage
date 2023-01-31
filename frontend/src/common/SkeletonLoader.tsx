import { Skeleton } from "@chakra-ui/react";
import React from "react";

type Props = {
  count: number;
  height: string;
  width: string;
};

const SkeletonLoader: React.FC<Props> = ({ count, height, width }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          width={width}
          startColor="whiteAlpha.400"
          endColor="whiteAlpha.300"
          borderRadius={4}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
