//
// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
//

import React, { Suspense } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import {
  Manager as PopperManager,
  Popper,
  Reference as PopperReference,
} from 'react-popper';
import type { EmojiClickData } from '@indutny/emoji-picker-react';

import { AddEmoji } from '../elements/icons';
import type { Props as DropZoneProps } from '../elements/DropZone';
import { DropZone } from '../elements/DropZone';
import { StickerPreview } from '../elements/StickerPreview';
import { Spinner } from '../elements/Spinner';
import styles from './ArtFrame.module.scss';
import { useI18n } from '../contexts/I18n';
import { assert } from '../util/assert';
import { noop } from '../util/noop';
import { ArtType } from '../constants';
import type { EmojiData } from '../types.d';
import EMOJI_SHEET from '../assets/emoji.webp';
import { PopperRootContext } from './PopperRootContext';

export type Mode = 'removable' | 'pick-emoji' | 'add';

export type OnPickEmojiOptions = Readonly<{
  id: string;
  emoji: EmojiData;
}>;

export type Props = Partial<Pick<DropZoneProps, 'onDrop'>> &
  Readonly<{
    artType: ArtType;
    id?: string;
    emoji?: EmojiData;
    image?: string;
    mode?: Mode;
    showGuide?: boolean;
    onEmojiNameChange?(name: string): unknown;
    onPickEmoji?(options: OnPickEmojiOptions): unknown;
    onRemove?(id: string): unknown;
  }>;

const LazyEmojiPicker = React.lazy(() => import('./EmojiPicker'));

function Emoji({ name, sheetX, sheetY }: EmojiData): JSX.Element {
  const onRef = (elem: HTMLImageElement | null): void => {
    if (elem) {
      elem.style.setProperty('--sheet-x', sheetX.toString());
      elem.style.setProperty('--sheet-y', sheetY.toString());
    }
  };
  return (
    <img alt={name} src={EMOJI_SHEET} className={styles.emoji} ref={onRef} />
  );
}

export const ArtFrame = React.memo(function ArtFrame({
  id,
  artType,
  emoji,
  image,
  showGuide,
  mode,
  onRemove,
  onEmojiNameChange,
  onPickEmoji,
  onDrop,
}: Props) {
  const i18n = useI18n();
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const [emojiPopperRoot, setEmojiPopperRoot] =
    React.useState<HTMLElement | null>(null);
  const [previewActive, setPreviewActive] = React.useState(false);
  const [previewPopperRoot, setPreviewPopperRoot] =
    React.useState<HTMLElement | null>(null);
  const timerRef = React.useRef<number>();

  const handleToggleEmojiPicker = React.useCallback(() => {
    setEmojiPickerOpen(open => !open);
  }, [setEmojiPickerOpen]);

  const handlePickEmoji = React.useCallback(
    (clickData: EmojiClickData) => {
      if (!id) {
        return;
      }
      if (!onPickEmoji) {
        throw new Error(
          'ArtFrame/handlePickEmoji: onPickEmoji was not provided!'
        );
      }
      onPickEmoji({
        id,
        emoji: {
          emoji: clickData.emoji,
          sheetX: clickData.sheetX,
          sheetY: clickData.sheetY,
          name:
            clickData.names[0]
              ?.replace(/\s+/g, '_')
              ?.replace(/[^a-zA-Z_]/g, '') ?? '',
        },
      });
      setEmojiPickerOpen(false);
    },
    [id, onPickEmoji, setEmojiPickerOpen]
  );

  const handleRemove = React.useCallback(() => {
    if (!id) {
      return;
    }
    if (!onRemove) {
      throw new Error('ArtFrame/handleRemove: onRemove was not provided!');
    }
    onRemove(id);
  }, [onRemove, id]);

  const handleMouseEnter = React.useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPreviewActive(true);
    }, 500);
  }, [timerRef, setPreviewActive]);

  const handleMouseLeave = React.useCallback(() => {
    clearTimeout(timerRef.current);
    setPreviewActive(false);
  }, [timerRef, setPreviewActive]);

  React.useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [timerRef]
  );

  const { createRoot, removeRoot } = React.useContext(PopperRootContext);

  // Create popper root and handle outside clicks
  React.useEffect(() => {
    if (emojiPickerOpen) {
      const root = createRoot();
      setEmojiPopperRoot(root);
      const handleOutsideClick = ({ target }: MouseEvent) => {
        const targetNode = target as HTMLElement;
        const button = targetNode.closest(`button.${styles.emojiButton}`);
        if (!root.contains(targetNode) && !button) {
          setEmojiPickerOpen(false);
        }
      };
      document.addEventListener('click', handleOutsideClick);

      return () => {
        removeRoot(root);
        setEmojiPopperRoot(null);
        document.removeEventListener('click', handleOutsideClick);
      };
    }

    return noop;
  }, [createRoot, emojiPickerOpen, removeRoot]);

  React.useEffect(() => {
    if (mode !== 'pick-emoji' && image && previewActive) {
      const root = createRoot();
      setPreviewPopperRoot(root);

      return () => {
        removeRoot(root);
      };
    }

    return noop;
  }, [
    createRoot,
    image,
    mode,
    previewActive,
    removeRoot,
    setPreviewPopperRoot,
  ]);

  const [dragActive, setDragActive] = React.useState<boolean>(false);

  const emojiPickerSpinner = (
    <div className={styles.emojiPickerSpinner}>
      <Spinner size={56} />
    </div>
  );

  const sizeContainer = (
    <div
      className={styles.sizeContainer}
      data-art-type={artType}
      data-drag-active={dragActive}
    >
      {
        // eslint-disable-next-line no-nested-ternary
        mode !== 'add' ? (
          image ? (
            <img
              className={styles.image}
              data-art-type={artType}
              src={image}
              alt={artType}
            />
          ) : (
            <div className={styles.spinner}>
              <Spinner size={56} />
            </div>
          )
        ) : null
      }
      {showGuide && mode !== 'add' ? (
        <div className={styles.guide} data-art-type={artType} />
      ) : null}
      {mode === 'removable' ? (
        <button
          type="button"
          aria-label={i18n('StickerCreator--DropStage--removeSticker')}
          className={styles.closeButton}
          onClick={handleRemove}
          // Reverse the mouseenter/leave logic for the remove button so
          // we don't accidentally cover the remove button
          onMouseEnter={handleMouseLeave}
          onMouseLeave={handleMouseEnter}
        />
      ) : null}
      {mode === 'add' && onDrop ? (
        <DropZone
          label={i18n(`StickerCreator--DropStage--dragDrop--${artType}`)}
          onDrop={onDrop}
          inner
          onDragActive={setDragActive}
        />
      ) : null}
      {mode === 'pick-emoji' ? (
        <PopperManager>
          <PopperReference>
            {({ ref }) => (
              <button
                type="button"
                ref={ref}
                className={styles.emojiButton}
                onClick={handleToggleEmojiPicker}
              >
                {emoji?.emoji ? <Emoji {...emoji} /> : <AddEmoji />}
              </button>
            )}
          </PopperReference>
          {emojiPickerOpen && emojiPopperRoot
            ? createPortal(
                <Popper placement="bottom-start">
                  {({ ref, style }) => (
                    <div ref={ref} style={{ ...style, marginTop: '8px' }}>
                      <Suspense fallback={emojiPickerSpinner}>
                        <LazyEmojiPicker onEmojiClick={handlePickEmoji} />
                      </Suspense>
                    </div>
                  )}
                </Popper>,
                emojiPopperRoot
              )
            : null}
        </PopperManager>
      ) : null}
      {mode !== 'pick-emoji' && image && previewActive && previewPopperRoot
        ? createPortal(
            <Popper
              placement="bottom"
              modifiers={[
                { name: 'offset', options: { offset: [undefined, 8] } },
              ]}
            >
              {({ ref, style, arrowProps, placement }) => {
                assert(artType === ArtType.Sticker, 'Unexpected art type');
                return (
                  <StickerPreview
                    ref={ref}
                    style={style}
                    image={image}
                    arrowProps={arrowProps}
                    placement={placement}
                  />
                );
              }}
            </Popper>,
            previewPopperRoot
          )
        : null}
    </div>
  );

  const containerClassName = classNames(
    styles.container,
    mode === 'add' && styles.nonDraggable
  );

  return (
    <PopperManager>
      <PopperReference>
        {({ ref: rootRef }) => (
          <div
            className={containerClassName}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={rootRef}
          >
            {sizeContainer}
          </div>
        )}
      </PopperReference>
    </PopperManager>
  );
});
