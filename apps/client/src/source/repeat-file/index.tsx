'use client';

import DirectoryPicker from '#/components/DirectoryPicker';
import { DirectoryInfo } from '#pkgs/apis';
import { useState } from 'react';
import SelectedDirInfo from './components/SelectedDirInfo';
import { StyledRepeatFileWrapper } from './style';

export default function RepeatFile() {
  const [currentDir, setCurrentDir] = useState<DirectoryInfo>();

  return (
    <StyledRepeatFileWrapper>
      <DirectoryPicker
        defaultVisible
        onCurrentDirChange={setCurrentDir}
        storageKeySuffix="RepeatFile"
      />

      <SelectedDirInfo dir={currentDir} />
    </StyledRepeatFileWrapper>
  );
}
