import { useState, useEffect, forwardRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import "./imageUploader.css"

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}

function FileUploader({ size = "medium", asBase64 = false, label, control, id, name, onChange, maxFileUpload = 10, maxFileSize = 4 * 1024 * 1024, maxPreview = 5, onClick, accept = '', placeholder, disabled, readOnly, onSubmit, onRemove, src, field, error, ...props }, ref) {
    const [value, setValue] = useState([])
    const [preview, setPreview] = useState([])
    const onDrop = useCallback(acceptedFiles => {
        let cantUploadList = ""
        let cantUploadLength = 0;
        if ((value.length + 1) > maxFileUpload) {
            return console.log("reach limit max file upload")
        }
        else {
            let leftLimit = maxFileUpload - (value.length + 1);
            acceptedFiles = acceptedFiles.slice(0, leftLimit + 1)
        }

        acceptedFiles.forEach((file) => {
            if(file.size > maxFileSize){
                console.log(file.name,"@@fileName")
                cantUploadLength += 1;
                return cantUploadList += `\n ชื่อไฟล์ ${file.name} ขนาดไฟล์ ${humanFileSize(file.size)}`
            }
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const src = reader.result
                const { name, size, type, path, lastModified, lastModifiedDate, webkitRelativePath } = file
                file["base64"] = reader.result
                let result = file;

                setValue(prev => [...prev, result])
            }
            reader.readAsDataURL(file)
        })
        if(cantUploadLength){
            alert(`ไม่สามารถอัพโหลดไฟล์ ${cantUploadLength} ดังต่อไปนี้ เพราะมีขนาดไฟล์เกิน ${humanFileSize(maxFileSize)} ${cantUploadList}`)
        }
    }, [])

    const handleDeleteItemByIndex = (index) => {
        setValue(prev => [...prev.filter((file, _index) => _index !== index)])
    }

    const handleSubmit = () => {
        onSubmit?.(value)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const isFully = value.length >= maxFileUpload

    return (
        <>
            <div className='app-image-upload-container'>
                <div className='app-image-upload-area' {...getRootProps()}>
                    <div className='app-image-upload-center'>
                        <span className='app-image-upload-placeholder'>ลากหรือวางไฟล์ไว้ที่นี่</span>
                        <span className='app-image-upload-value' style={{ backgroundColor: isFully ? "green" : "darkgrey" }}>{value.length} / {maxFileUpload}</span>
                        <button className='app-image-upload-button' disabled={isFully}>เลือกไฟล์</button>
                    </div>
                    <input className='app-image-upload-input' {...getInputProps()} />
                </div>
                <div className='app-image-uload-description'>
                    <span className='app-image-upload-helper'>ขนาดไฟล์ไม่เกิน {humanFileSize(maxFileSize)}</span>
                    <span className='app-image-upload-helper'>, อัพโหลดได้ไม่เกิน {maxFileUpload} ไฟล์</span>
                    <span className='app-image-upload-helper'>, อัพโหลดได้เฉพาะไฟล์ .png, .jpeg, .gif</span>
                </div>
                <div className='app-image-upload-list' style={{ height: `${maxPreview * 64 - 32}px`, overflow: 'auto' }}>
                    {
                        value.map((file, index) => (
                            <div key={index} className='app-image-upload-item'>
                                <img src={file.base64} className='app-image-upload-preview-image' />
                                <div className='app-image-upload-preview-content'>
                                    <span>{file.name}</span>
                                    <span>{humanFileSize(file.size)}</span>
                                </div>
                                <button className="app-image-preview-delete" onClick={()=>handleDeleteItemByIndex(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    }
                </div>
                <div className='app-image-upload-actions'>
                    <button className='app-image-upload-button app-image-upload-submit' onClick={handleSubmit} disabled={!isFully}>อัพโหลด</button>
                </div>
            </div>
        </>
    );
}

export default forwardRef(FileUploader)
