/**
 * Where a piece of media is hosted / how it must be rendered.
 * `File` is a directly addressable URL (img/video tag); `YouTube` is a video
 * id embedded via an iframe. New providers (Vimeo, coach uploads…) extend here.
 */
export enum MediaSource {
  File = 'FILE',
  YouTube = 'YOUTUBE',
}
