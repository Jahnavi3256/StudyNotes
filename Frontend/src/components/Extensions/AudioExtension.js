import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AudioComponent from './AudioComponent';

export default Node.create({
    name: 'audioComponent',

    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            type: {
                default: 'audio/webm',
            },
            title: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'audio-component',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['audio-component', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(AudioComponent);
    },
});
