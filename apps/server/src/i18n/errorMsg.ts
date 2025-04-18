export const ERROR_MSG = {
  serverError: 'server error',
  commandError: 'inner command error',
  taskInProgress: 'task in progress',
  noRootDir: 'no root dir',
  notAnImageFile: 'not an image file',
  notAnVideoFile: 'not an video file',
  notAnAudioFile: 'not an audio file',
  notAnCorrectFile: 'not an currect file',
  errorPath: 'error path',
  noFile: 'no file',
  sizeLimited: 'the requested file size is limited',
} satisfies Record<string, string | ((...args: string[]) => string)>;
