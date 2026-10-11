'use client';
import {useEffect} from 'react';
import {installTouchZoomLock} from '../../public/archive-touch-zoom.mjs';
export function usePublicZoomLock(){useEffect(()=>installTouchZoomLock(),[])}
