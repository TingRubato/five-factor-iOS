/**
 * Share utility — capture a React view as PNG and share via native sheet.
 */
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export async function shareCard(viewRef: RefObject<View | null>) {
  if (!viewRef.current) return;
  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Share your archetype',
  });
}
