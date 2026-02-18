import { NodeViewWrapper } from "@tiptap/react";
import React, { useState, useEffect } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const ImageResizer = (props) => {
    const [width, setWidth] = useState(props.node.attrs.width);
    const [height, setHeight] = useState(props.node.attrs.height);

    const initialWidth = parseInt(width) || 500;
    const initialHeight = parseInt(height) || 300;

    useEffect(() => {
        setWidth(props.node.attrs.width);
        setHeight(props.node.attrs.height);
    }, [props.node.attrs.width, props.node.attrs.height]);

    const onResize = (event, { size }) => {
        setWidth(size.width);
        setHeight(size.height);
    };

    const onResizeStop = (event, { size }) => {
        props.updateAttributes({
            width: size.width,
            height: size.height,
        });
    };

    return (
        <NodeViewWrapper className="image-resizer-wrapper inline-block relative group" style={{ lineHeight: 0 }}>
            <ResizableBox
                width={initialWidth}
                height={initialHeight}
                axis="both"
                resizeHandles={["se"]}
                onResize={onResize}
                onResizeStop={onResizeStop}
                minConstraints={[100, 100]}
                maxConstraints={[1000, 1000]}
                className="relative"
                style={{
                    width: typeof width === 'number' ? `${width}px` : width === "100%" ? "100%" : width,
                    height: typeof height === 'number' ? `${height}px` : height === "auto" ? "auto" : height,
                }}
                handle={
                    <div className="react-resizable-handle react-resizable-handle-se absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-sm cursor-se-resize z-50 border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                }
            >
                <img
                    src={props.node.attrs.src}
                    alt={props.node.attrs.alt}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                    draggable="false"
                />
            </ResizableBox>
        </NodeViewWrapper>
    );
};

export default ImageResizer;
