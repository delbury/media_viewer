export const ERROR_MSG = {
  commandError: 'inner command error',
  taskInProgress: 'task in progress',
  noRootDir: 'no root dir',
  notAnImageFile: 'not an image file',
  notAnVideoFile: 'not an video file',
  notAnAudioFile: 'not an audio file',
  notAnCorrectFile: 'not an currect file',
  errorPath: 'error path',
} satisfies Record<string, string | ((...args: string[]) => string)>;
