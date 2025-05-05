'use client';

import ResizeContainerItem from './ResizeContainerItem';
import ResizeContainerWrapper from './ResizeContainerWrapper';

const ResizeContainer = ResizeContainerItem as typeof ResizeContainerItem & {
  Wrapper: typeof ResizeContainerWrapper;
};
ResizeContainer.Wrapper = ResizeContainerWrapper;

export default ResizeContainer;
